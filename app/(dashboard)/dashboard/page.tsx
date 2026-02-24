'use client'

import { useState } from 'react'
import { useStatements } from '@/hooks/useStatements'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { TopCustomersChart } from '@/components/dashboard/TopCustomersChart'
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart'
import { PeakDaysChart } from '@/components/dashboard/PeakDaysChart'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'
import { RecommendationCards } from '@/components/dashboard/RecommendationCards'
import { QuickInsights } from '@/components/dashboard/QuickInsights'
import { AISummaryCard } from '@/components/dashboard/AISummaryCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, FileText, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: statements, isLoading, error } = useStatements()
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null)

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

  const completedStatements = statements?.filter((s) => s.status === 'DONE') || []

  // Use selected statement or fall back to the most recent completed one
  const activeStatement = selectedStatementId
    ? completedStatements.find((s) => s.id === selectedStatementId)
    : completedStatements[0]

  if (!activeStatement?.insight) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your business analytics
            </p>
          </div>
          <Button asChild className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Link href="/statements">
              <Upload className="mr-2 h-4 w-4" />
              Upload Statement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EmptyState type="dashboard" />
      </div>
    )
  }

  const insight = activeStatement.insight as any

  return (
    <div className="space-y-6">
      {/* Header with Statement Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {activeStatement.periodStart && activeStatement.periodEnd
              ? `${new Date(activeStatement.periodStart).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} — ${new Date(activeStatement.periodEnd).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'Your business analytics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {completedStatements.length > 1 && (
            <Select
              value={activeStatement.id}
              onValueChange={setSelectedStatementId}
            >
              <SelectTrigger className="w-[220px] rounded-xl border-2">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select statement" />
              </SelectTrigger>
              <SelectContent>
                {completedStatements.map((statement) => (
                  <SelectItem key={statement.id} value={statement.id}>
                    {statement.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button asChild className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Link href="/statements">
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalIn={activeStatement.totalIn}
        totalOut={activeStatement.totalOut}
        netFlow={activeStatement.netFlow}
        healthScore={insight.healthScore}
      />

      {/* Quick Insights Row */}
      {activeStatement.transactions && (
        <QuickInsights
          transactions={activeStatement.transactions}
          peakDays={insight.peakDays || []}
          periodStart={activeStatement.periodStart}
          periodEnd={activeStatement.periodEnd}
        />
      )}

      {/* AI Summary Card with Health Gauge */}
      <AISummaryCard
        aiSummary={insight.aiSummary || ''}
        healthScore={insight.healthScore}
      />

      {/* Charts Row 1: Cash Flow + Top Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart data={insight.monthlySummary} />
        <TopCustomersChart data={insight.topCustomers} />
      </div>

      {/* Charts Row 2: Category Breakdown + Peak Days */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdownChart data={insight.topExpenses} />
        <PeakDaysChart data={insight.peakDays} />
      </div>

      {/* Recommendations */}
      <RecommendationCards recommendations={insight.recommendations} />

      {/* Recent Transactions */}
      {activeStatement.transactions && (
        <TransactionsTable
          transactions={activeStatement.transactions}
          title="Recent Transactions"
          showPagination={true}
          limit={10}
        />
      )}
    </div>
  )
}
