'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  totalIn: number
  totalOut: number
  netFlow: number
  healthScore: number
  className?: string
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
}

export function StatsCards({
  totalIn,
  totalOut,
  netFlow,
  healthScore,
  className,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Revenue',
      value: `KES ${totalIn.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Expenses',
      value: `KES ${totalOut.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Net Cash Flow',
      value: `KES ${netFlow.toLocaleString()}`,
      icon: Activity,
      color: netFlow >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: netFlow >= 0 ? 'bg-blue-100' : 'bg-red-100',
    },
    {
      label: 'Health Score',
      value: `${healthScore}/100`,
      icon: Gauge,
      color: healthScore >= 70 ? 'text-purple-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600',
      bgColor: healthScore >= 70 ? 'bg-purple-100' : healthScore >= 50 ? 'bg-yellow-100' : 'bg-red-100',
    },
  ]

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', stat.color)}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn('p-3 rounded-full', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
