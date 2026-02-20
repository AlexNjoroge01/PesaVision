'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { HealthScoreGauge } from '@/components/shared/HealthScoreGauge'
import { ArrowUpRight, ArrowDownRight, Calendar, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Statement } from '@/types'

interface StatementCardProps {
  statement: Statement & {
    insight?: { healthScore: number } | null
    _count?: { transactions: number }
  }
  className?: string
}

export function StatementCard({ statement, className }: StatementCardProps) {
  const periodText = statement.periodStart && statement.periodEnd
    ? `${new Date(statement.periodStart).toLocaleDateString()} - ${new Date(statement.periodEnd).toLocaleDateString()}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/statements/${statement.id}`}>
        <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">
                    {statement.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(statement.createdAt))} ago
                  </p>
                </div>
              </div>
              <StatusBadge status={statement.status} />
            </div>

            {periodText && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3 w-3" />
                {periodText}
              </div>
            )}

            {statement.status === 'DONE' && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        KES {statement.totalIn.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ArrowDownRight className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        KES {statement.totalOut.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      'text-xs font-semibold',
                      statement.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      Net: KES {statement.netFlow.toLocaleString()}
                    </span>
                    {statement._count && (
                      <span className="text-xs text-muted-foreground">
                        • {statement._count.transactions} transactions
                      </span>
                    )}
                  </div>
                </div>
                {statement.insight && (
                  <HealthScoreGauge
                    score={statement.insight.healthScore}
                    size="sm"
                    showLabel={false}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
