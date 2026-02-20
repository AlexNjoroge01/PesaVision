'use client'

import { useStatements } from '@/hooks/useStatements'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { TopCustomersChart } from '@/components/dashboard/TopCustomersChart'
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'
import { RecommendationCards } from '@/components/dashboard/RecommendationCards'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Loader2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: statements, isLoading, error } = useStatements()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    )
  }

  // Get the most recent completed statement
  const latestStatement = statements?.find((s) => s.status === 'DONE')

  if (!latestStatement?.insight) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your business analytics
            </p>
          </div>
          <Button asChild>
            <Link href="/statements">
              <Upload className="mr-2 h-4 w-4" />
              Upload Statement
            </Link>
          </Button>
        </div>
        <EmptyState type="dashboard" />
      </div>
    )
  }

  const insight = latestStatement.insight as any

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {latestStatement.periodStart && latestStatement.periodEnd
              ? `Statement period: ${new Date(latestStatement.periodStart).toLocaleDateString()} - ${new Date(latestStatement.periodEnd).toLocaleDateString()}`
              : 'Your business analytics'}
          </p>
        </div>
        <Button asChild>
          <Link href="/statements">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Statement
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalIn={latestStatement.totalIn}
        totalOut={latestStatement.totalOut}
        netFlow={latestStatement.netFlow}
        healthScore={insight.healthScore}
      />

      {/* AI Summary */}
      <div className="rounded-lg bg-muted p-4">
        <h3 className="font-semibold mb-2">AI Summary</h3>
        <p className="text-muted-foreground">{insight.aiSummary}</p>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart data={insight.monthlySummary} />
        <TopCustomersChart data={insight.topCustomers} />
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdownChart data={insight.topExpenses} />

      {/* Recommendations */}
      <RecommendationCards recommendations={insight.recommendations} />

      {/* Recent Transactions */}
      {latestStatement.transactions && (
        <TransactionsTable
          transactions={latestStatement.transactions}
          title="Recent Transactions"
          showPagination={false}
          limit={5}
        />
      )}
    </div>
  )
}
