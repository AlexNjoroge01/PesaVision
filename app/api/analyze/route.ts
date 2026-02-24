import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseMpesaStatement, determineTransactionType } from '@/lib/pdf-parser'
import { analyzeTransactions, calculateTransactionStats } from '@/lib/mpesa-analyzer'
import { sendStatementReadyEmail } from '@/lib/resend'
import type { TransactionType, Category } from '@/types'

export async function POST(request: NextRequest) {
  console.log('[ANALYZE] Starting analysis request')
  try {
    const body = await request.json()
    const { statementId, fileBuffer } = body

    console.log('[ANALYZE] Request body - statementId:', statementId, 'fileBuffer length:', fileBuffer?.length)

    if (!statementId || !fileBuffer) {
      console.error('[ANALYZE] Missing statementId or fileBuffer')
      return NextResponse.json(
        { error: 'Missing statementId or fileBuffer' },
        { status: 400 }
      )
    }

    // Get statement and user
    console.log('[ANALYZE] Fetching statement from database')
    const statement = await prisma.statement.findUnique({
      where: { id: statementId },
      include: { user: true },
    })

    if (!statement) {
      console.error('[ANALYZE] Statement not found:', statementId)
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    console.log('[ANALYZE] Found statement, current status:', statement.status)

    // Update status to PROCESSING
    console.log('[ANALYZE] Updating status to PROCESSING')
    await prisma.statement.update({
      where: { id: statementId },
      data: { status: 'PROCESSING' },
    })

    try {
      // Decode base64 buffer
      console.log('[ANALYZE] Decoding base64 buffer')
      const buffer = Buffer.from(fileBuffer, 'base64')
      console.log('[ANALYZE] Buffer size:', buffer.length, 'bytes')

      // Parse PDF
      console.log('[ANALYZE] Starting PDF parsing')
      const parseResult = await parseMpesaStatement(buffer)
      console.log('[ANALYZE] PDF parsed, found', parseResult.transactions.length, 'transactions')

      if (parseResult.transactions.length === 0) {
        console.error('[ANALYZE] No transactions found in PDF')
        throw new Error('No transactions found in the PDF')
      }

      // Analyze transactions with AI
      console.log('[ANALYZE] Starting AI analysis')
      const analysis = await analyzeTransactions(parseResult.transactions)
      console.log('[ANALYZE] AI analysis complete, health score:', analysis.healthScore)

      // Calculate stats
      const stats = calculateTransactionStats(parseResult.transactions)

      // Create category map from AI analysis
      const categoryMap = new Map<string, Category>()
      const counterpartyMap = new Map<string, string>()

      for (const ct of analysis.transactions) {
        if (ct.reference) {
          categoryMap.set(ct.reference, ct.category as Category)
          if (ct.counterparty) {
            counterpartyMap.set(ct.reference, ct.counterparty)
          }
        }
      }

      // Create transactions in database
      const transactionsData = parseResult.transactions.map((t) => {
        const category = t.reference ? categoryMap.get(t.reference) || 'UNCATEGORIZED' : 'UNCATEGORIZED'
        const counterparty = t.reference ? counterpartyMap.get(t.reference) || t.counterparty : t.counterparty
        const type = determineTransactionType(t.description) as TransactionType

        return {
          statementId,
          date: t.date,
          type,
          amount: t.amount,
          balance: t.balance,
          reference: t.reference,
          counterparty,
          description: t.description,
          category,
          isIncoming: t.isIncoming,
        }
      })

      // Bulk insert transactions
      console.log('[ANALYZE] Inserting', transactionsData.length, 'transactions')
      await prisma.transaction.createMany({
        data: transactionsData,
      })

      // Create insight record
      console.log('[ANALYZE] Creating insight record')
      await prisma.insight.create({
        data: {
          statementId,
          topCustomers: JSON.parse(JSON.stringify(analysis.topCustomers)),
          topExpenses: JSON.parse(JSON.stringify(analysis.topExpenses)),
          peakDays: JSON.parse(JSON.stringify(analysis.peakDays)),
          monthlySummary: JSON.parse(JSON.stringify(analysis.monthlySummary)),
          aiSummary: analysis.aiSummary,
          recommendations: JSON.parse(JSON.stringify(analysis.recommendations)),
          healthScore: analysis.healthScore,
        },
      })

      // Update statement with final data
      console.log('[ANALYZE] Updating statement status to DONE')
      await prisma.statement.update({
        where: { id: statementId },
        data: {
          status: 'DONE',
          totalIn: stats.totalIn,
          totalOut: stats.totalOut,
          netFlow: stats.netFlow,
          periodStart: parseResult.periodStart,
          periodEnd: parseResult.periodEnd,
        },
      })

      // Send notification email
      if (statement.user.email) {
        console.log('[ANALYZE] Sending notification email to:', statement.user.email)
        try {
          await sendStatementReadyEmail(
            statement.user.email,
            statementId,
            analysis.healthScore,
            analysis.aiSummary
          )
          console.log('[ANALYZE] Email sent successfully')
        } catch (emailError) {
          console.error('[ANALYZE] Failed to send notification email:', emailError)
          // Don't fail the whole process if email fails
        }
      }

      console.log('[ANALYZE] Analysis complete successfully')
      return NextResponse.json({
        success: true,
        statementId,
        transactionCount: transactionsData.length,
        healthScore: analysis.healthScore,
      })
    } catch (processingError) {
      console.error('[ANALYZE] Processing error:', processingError)
      // Update status to FAILED
      console.log('[ANALYZE] Updating statement status to FAILED')
      await prisma.statement.update({
        where: { id: statementId },
        data: { status: 'FAILED' },
      })

      throw processingError
    }
  } catch (error) {
    console.error('[ANALYZE] Outer error:', error)
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
