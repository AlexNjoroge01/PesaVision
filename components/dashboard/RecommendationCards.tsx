'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Info, CheckCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { Recommendation } from '@/types'

interface RecommendationCardsProps {
  recommendations: Recommendation[]
  className?: string
}

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
  },
  medium: {
    icon: Info,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  low: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
}

export function RecommendationCards({ recommendations, className }: RecommendationCardsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Recommendations</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((recommendation, index) => {
          const config = priorityConfig[recommendation.priority]
          const Icon = config.icon

          return (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card className={cn('border-l-4', config.borderColor)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-full', config.bgColor)}>
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <Badge variant="outline" className={cn('text-xs', config.badge)}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
