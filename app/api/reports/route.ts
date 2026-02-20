import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessKraExport } from '@/lib/plan-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'
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
    let reportContent: string
    let fileName: string

    switch (type) {
      case 'KRA_EXPORT':
        reportContent = generateKraExport(statement.transactions)
        fileName = `kra-export-${statementId}.csv`
        break
      case 'MONTHLY_SUMMARY':
        reportContent = generateMonthlySummary(statement)
        fileName = `monthly-summary-${statementId}.json`
        break
      case 'CASH_FLOW':
        reportContent = generateCashFlowReport(statement)
        fileName = `cash-flow-${statementId}.json`
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Upload report to Cloudinary
    const buffer = Buffer.from(reportContent, 'utf-8')
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: `reports/${session.user.id}`,
      filename: fileName.replace(/\.[^.]+$/, ''),
      resourceType: 'raw',
    })

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
function generateKraExport(transactions: any[]): string {
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

/**
 * Generate monthly summary report
 */
function generateMonthlySummary(statement: any): string {
  const summary = {
    statementId: statement.id,
    period: {
      start: statement.periodStart,
      end: statement.periodEnd,
    },
    totals: {
      totalIn: statement.totalIn,
      totalOut: statement.totalOut,
      netFlow: statement.netFlow,
    },
    insight: statement.insight
      ? {
          healthScore: statement.insight.healthScore,
          aiSummary: statement.insight.aiSummary,
          topCustomers: statement.insight.topCustomers,
          topExpenses: statement.insight.topExpenses,
          recommendations: statement.insight.recommendations,
        }
      : null,
    generatedAt: new Date().toISOString(),
  }

  return JSON.stringify(summary, null, 2)
}

/**
 * Generate cash flow report
 */
function generateCashFlowReport(statement: any): string {
  const report = {
    statementId: statement.id,
    period: {
      start: statement.periodStart,
      end: statement.periodEnd,
    },
    summary: {
      totalIn: statement.totalIn,
      totalOut: statement.totalOut,
      netFlow: statement.netFlow,
    },
    monthlySummary: statement.insight?.monthlySummary || [],
    transactions: statement.transactions.map((t: any) => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      isIncoming: t.isIncoming,
      category: t.category,
    })),
    generatedAt: new Date().toISOString(),
  }

  return JSON.stringify(report, null, 2)
}
