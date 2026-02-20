'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types'

interface PlanBadgeProps {
  plan: Plan
  className?: string
}

const planConfig: Record<Plan, { label: string; className: string }> = {
  FREE: {
    label: 'Free',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  BASIC: {
    label: 'Basic',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  PRO: {
    label: 'Pro',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const config = planConfig[plan]

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
