'use client'

import { use } from 'react'
import { useStatement } from '@/hooks/useStatements'
import { ProcessingStatus } from '@/components/statements/ProcessingStatus'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { TopCustomersChart } from '@/components/dashboard/TopCustomersChart'
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'
import { RecommendationCards } from '@/components/dashboard/RecommendationCards'
import { HealthScoreGauge } from '@/components/shared/HealthScoreGauge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft, MessageSquare, FileDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: statement, isLoading, error } = useStatement(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !statement) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load statement</p>
        <Button variant="outline" onClick={() => router.push('/statements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Statements
        </Button>
      </div>
    )
  }

  // Show processing status if not done
  if (statement.status === 'PENDING' || statement.status === 'PROCESSING') {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/statements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Statements
        </Button>
        <ProcessingStatus status={statement.status} />
      </div>
    )
  }

  // Show error state
  if (statement.status === 'FAILED') {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/statements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Statements
        </Button>
        <ProcessingStatus status="FAILED" />
      </div>
    )
  }

  const insight = statement.insight as {
    healthScore: number
    aiSummary: string
    topCustomers: Array<{ name: string; totalAmount: number; transactionCount: number }>
    topExpenses: Array<{ category: string; amount: number; percentage: number }>
    peakDays: Array<{ dayOfWeek: string; averageAmount: number }>
    monthlySummary: Array<{ month: string; totalIn: number; totalOut: number; netFlow: number }>
    recommendations: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/statements')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{statement.fileName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={statement.status} />
              {statement.periodStart && statement.periodEnd && (
                <span className="text-sm text-muted-foreground">
                  {new Date(statement.periodStart).toLocaleDateString()} - {new Date(statement.periodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/chat?statement=${id}`)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat about this
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalIn={statement.totalIn}
        totalOut={statement.totalOut}
        netFlow={statement.netFlow}
        healthScore={insight?.healthScore || 0}
      />

      {/* AI Summary & Health Score */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">AI Summary</h3>
            <p className="text-muted-foreground">{insight?.aiSummary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <HealthScoreGauge score={insight?.healthScore || 0} size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart data={insight?.monthlySummary || []} />
        <TopCustomersChart data={insight?.topCustomers || []} />
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdownChart data={insight?.topExpenses || []} />

      {/* Recommendations */}
      <RecommendationCards recommendations={insight?.recommendations || []} />

      {/* Transactions Table */}
      <TransactionsTable
        transactions={statement.transactions || []}
        title="All Transactions"
      />
    </div>
  )
}
