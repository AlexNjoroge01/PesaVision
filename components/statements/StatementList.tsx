'use client'

import { useStatements } from '@/hooks/useStatements'
import { StatementCard } from './StatementCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Loader2 } from 'lucide-react'

export function StatementList() {
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
        <p className="text-red-500">Failed to load statements</p>
      </div>
    )
  }

  if (!statements || statements.length === 0) {
    return <EmptyState type="statements" />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statements.map((statement) => (
        <StatementCard key={statement.id} statement={statement} />
      ))}
    </div>
  )
}
