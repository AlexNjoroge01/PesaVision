'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthScoreGauge } from '@/components/shared/HealthScoreGauge'
import { Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AISummaryCardProps {
  aiSummary: string
  healthScore: number
  className?: string
}

export function AISummaryCard({ aiSummary, healthScore, className }: AISummaryCardProps) {
  const scoreLabel = healthScore >= 70
    ? 'Strong'
    : healthScore >= 50
    ? 'Moderate'
    : 'Needs Attention'

  const scoreColor = healthScore >= 70
    ? 'text-green-600'
    : healthScore >= 50
    ? 'text-yellow-600'
    : 'text-red-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            AI Business Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Health Score Gauge */}
            <div className="flex flex-col items-center shrink-0">
              <HealthScoreGauge score={healthScore} size="lg" showLabel={false} />
              <div className="mt-2 text-center">
                <p className={cn('text-sm font-semibold', scoreColor)}>{scoreLabel}</p>
                <p className="text-xs text-muted-foreground">Business Health</p>
              </div>
            </div>

            {/* Summary Text */}
            <div className="flex-1 space-y-3">
              {aiSummary ? (
                <div className="flex gap-3">
                  <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed text-foreground">
                    {aiSummary}
                  </p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Bot className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      AI summary is being generated. This will appear once your statement has been fully analyzed.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Try uploading a new statement or re-analyzing an existing one.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick health breakdown */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                <div className="text-center">
                  <div className={cn(
                    'text-xs font-medium',
                    healthScore >= 70 ? 'text-green-600' : 'text-muted-foreground'
                  )}>
                    Cash Flow
                  </div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full mx-0.5',
                          i <= (healthScore >= 70 ? 3 : healthScore >= 50 ? 2 : 1)
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    'text-xs font-medium',
                    healthScore >= 50 ? 'text-blue-600' : 'text-muted-foreground'
                  )}>
                    Consistency
                  </div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full mx-0.5',
                          i <= (healthScore >= 70 ? 3 : healthScore >= 40 ? 2 : 1)
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    'text-xs font-medium',
                    healthScore >= 60 ? 'text-purple-600' : 'text-muted-foreground'
                  )}>
                    Growth
                  </div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full mx-0.5',
                          i <= (healthScore >= 80 ? 3 : healthScore >= 60 ? 2 : 1)
                            ? 'bg-purple-500'
                            : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
