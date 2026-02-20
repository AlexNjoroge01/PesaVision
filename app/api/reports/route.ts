import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessKraExport } from '@/lib/plan-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { renderToBuffer } from '@react-pdf/renderer'
import { MonthlySummaryPDF, CashFlowPDF } from '@/lib/pdf-report'
import type { ReportType } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        statement: {
          select: {
            fileName: true,
            periodStart: true,
            periodEnd: true,
          },
        },
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { statementId, type } = body as { statementId: string; type: ReportType }

    if (!statementId || !type) {
      return NextResponse.json(
        { error: 'Statement ID and report type are required' },
        { status: 400 }
      )
    }

    // Check KRA export access
    if (type === 'KRA_EXPORT') {
      const accessCheck = await canAccessKraExport(session.user.id)
      if (!accessCheck.allowed) {
        return NextResponse.json(
          { error: accessCheck.reason },
          { status: 403 }
        )
      }
    }

    // Get statement with all data
    const statement = await prisma.statement.findFirst({
      where: {
        id: statementId,
        userId: session.user.id,
      },
      include: {
        transactions: {
          orderBy: { date: 'asc' },
        },
        insight: true,
      },
    })

    if (!statement) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    // Generate report content based on type
    let buffer: Buffer
    let fileName: string

    switch (type) {
      case 'KRA_EXPORT':
        const csvContent = generateKraExport(statement.transactions as Array<{
          date: Date | string
          description: string
          reference?: string
          counterparty?: string
          category: string
          amount: number
          isIncoming: boolean
          balance?: number
        }>)
        buffer = Buffer.from(csvContent, 'utf-8')
        fileName = `kra-export-${statementId}.csv`
        break
      case 'MONTHLY_SUMMARY':
        const monthlyPdf = MonthlySummaryPDF({
          data: {
            statementId: statement.id,
            fileName: statement.fileName,
            periodStart: statement.periodStart,
            periodEnd: statement.periodEnd,
            totalIn: statement.totalIn,
            totalOut: statement.totalOut,
            netFlow: statement.netFlow,
            healthScore: statement.insight?.healthScore,
            aiSummary: statement.insight?.aiSummary,
            topCustomers: statement.insight?.topCustomers as Array<{ name: string; amount?: number; count?: number; totalAmount?: number; transactionCount?: number }> | undefined,
            topExpenses: statement.insight?.topExpenses as Array<{ category: string; amount: number; percentage: number }> | undefined,
            recommendations: (statement.insight?.recommendations ?? []) as Array<string | { title: string; description: string; priority: 'high' | 'medium' | 'low' }>,
          },
        })
        buffer = await renderToBuffer(monthlyPdf)
        fileName = `monthly-summary-${statementId}.pdf`
        break
      case 'CASH_FLOW':
        const cashFlowPdf = CashFlowPDF({
          data: {
            statementId: statement.id,
            fileName: statement.fileName,
            periodStart: statement.periodStart,
            periodEnd: statement.periodEnd,
            totalIn: statement.totalIn,
            totalOut: statement.totalOut,
            netFlow: statement.netFlow,
            monthlySummary: statement.insight?.monthlySummary as Array<{ month: string; income?: number; expenses?: number; totalIn?: number; totalOut?: number }> | undefined,
            transactions: statement.transactions.map((t) => ({
              date: t.date,
              description: t.description ?? '',
              amount: t.amount,
              isIncoming: t.isIncoming,
              category: t.category,
            })),
          },
        })
        buffer = await renderToBuffer(cashFlowPdf)
        fileName = `cash-flow-${statementId}.pdf`
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Determine file extension for proper download format
    const fileExtension = fileName.split('.').pop() || 'bin'
    const baseFileName = fileName.replace(/\.[^.]+$/, '')
    
    // Validate buffer before upload
    if (!buffer || buffer.length === 0) {
      console.error('Empty buffer generated for report')
      return NextResponse.json({ error: 'Failed to generate report content' }, { status: 500 })
    }

    // Validate PDF files have correct header
    if (fileName.endsWith('.pdf')) {
      const header = buffer.subarray(0, 5).toString('ascii')
      if (header !== '%PDF-') {
        console.error(`Generated PDF has invalid header: "${header}"`)
        return NextResponse.json({ error: 'Failed to generate valid PDF' }, { status: 500 })
      }
    }
    
    console.log(`Uploading report: ${fileName}, buffer size: ${buffer.length} bytes`)
    
    // Upload report to Cloudinary with extension in public_id for proper file serving
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: `reports/${session.user.id}`,
      filename: `${baseFileName}.${fileExtension}`, // Include extension in filename for raw files
      resourceType: 'raw',
    })
    
    console.log(`Upload result: ${uploadResult.secureUrl}`)

    // Create report record
    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        statementId,
        type,
        fileUrl: uploadResult.secureUrl,
      },
    })

    return NextResponse.json({
      reportId: report.id,
      fileUrl: uploadResult.secureUrl,
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

/**
 * Generate KRA-ready CSV export
 */
function generateKraExport(transactions: Array<{
  date: Date | string
  description: string
  reference?: string
  counterparty?: string
  category: string
  amount: number
  isIncoming: boolean
  balance?: number
}>): string {
  const headers = [
    'Date',
    'Description',
    'Reference',
    'Counterparty',
    'Category',
    'Amount (KES)',
    'Type',
    'Balance (KES)',
  ]

  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('en-KE'),
    `"${t.description?.replace(/"/g, '""') || ''}"`,
    t.reference || '',
    t.counterparty || '',
    t.category,
    t.amount.toString(),
    t.isIncoming ? 'Income' : 'Expense',
    t.balance?.toString() || '',
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
