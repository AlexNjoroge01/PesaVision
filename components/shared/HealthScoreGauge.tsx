'use client'

import { cn } from '@/lib/utils'

interface HealthScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    text: 'text-sm',
    strokeWidth: 4,
  },
  md: {
    container: 'w-24 h-24',
    text: 'text-lg',
    strokeWidth: 6,
  },
  lg: {
    container: 'w-32 h-32',
    text: 'text-2xl',
    strokeWidth: 8,
  },
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreGradient(score: number): string {
  if (score >= 70) return '#22c55e' // green-500
  if (score >= 50) return '#eab308' // yellow-500
  return '#ef4444' // red-500
}

export function HealthScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: HealthScoreGaugeProps) {
  const config = sizeConfig[size]
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const normalizedScore = Math.min(100, Math.max(0, score))
  const offset = circumference - (normalizedScore / 100) * circumference
  const color = getScoreGradient(normalizedScore)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('relative', config.container)}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-bold',
              config.text,
              getScoreColor(normalizedScore)
            )}
          >
            {normalizedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-2 text-sm text-muted-foreground">
          Health Score
        </span>
      )}
    </div>
  )
}
