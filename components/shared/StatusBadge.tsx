'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StatementStatus } from '@/types'

interface StatusBadgeProps {
  status: StatementStatus
  className?: string
}

const statusConfig: Record<StatementStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse',
  },
  DONE: {
    label: 'Complete',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
