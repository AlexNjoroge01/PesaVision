'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Hash, ArrowUpDown, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Transaction, PeakDay } from '@/types'

interface QuickInsightsProps {
  transactions: Transaction[]
  peakDays: PeakDay[]
  periodStart: string | null
  periodEnd: string | null
  className?: string
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.25,
    },
  }),
}

export function QuickInsights({
  transactions,
  peakDays,
  periodStart,
  periodEnd,
  className,
}: QuickInsightsProps) {
  const txCount = transactions?.length || 0
  const avgAmount = txCount > 0
    ? transactions.reduce((sum, t) => sum + t.amount, 0) / txCount
    : 0

  const busiestDay = peakDays?.length > 0
    ? peakDays.reduce((max, d) => d.averageAmount > max.averageAmount ? d : max, peakDays[0])
    : null

  const periodDays = periodStart && periodEnd
    ? Math.ceil((new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const insights = [
    {
      label: 'Total Transactions',
      value: txCount.toLocaleString(),
      icon: Hash,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Avg Transaction',
      value: `KES ${Math.round(avgAmount).toLocaleString()}`,
      icon: ArrowUpDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Busiest Day',
      value: busiestDay?.dayOfWeek || 'N/A',
      icon: CalendarDays,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Statement Period',
      value: periodDays ? `${periodDays} days` : 'N/A',
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ]

  return (
    <div className={cn('grid gap-3 grid-cols-2 lg:grid-cols-4', className)}>
      {insights.map((item, i) => (
        <motion.div
          key={item.label}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', item.bgColor)}>
                  <item.icon className={cn('h-4 w-4', item.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                  <p className={cn('text-sm font-semibold', item.color)}>{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
