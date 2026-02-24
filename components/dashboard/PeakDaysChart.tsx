'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { PeakDay } from '@/types'

interface PeakDaysChartProps {
  data: PeakDay[]
  className?: string
}

const DAY_COLORS: Record<string, string> = {
  Monday: '#3b82f6',
  Tuesday: '#8b5cf6',
  Wednesday: '#06b6d4',
  Thursday: '#f59e0b',
  Friday: '#22c55e',
  Saturday: '#ec4899',
  Sunday: '#ef4444',
}

const formatKES = (value: number) => {
  return `KES ${Math.round(value).toLocaleString()}`
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; payload: { day: string } }>
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{payload[0].payload.day}</p>
        <p className="text-sm text-muted-foreground">
          Avg: {formatKES(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export function PeakDaysChart({ data, className }: PeakDaysChartProps) {
  if (!data || data.length === 0) {
    return null
  }

  // Sort by day of week order
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const chartData = dayOrder
    .map((day) => {
      const found = data.find((d) => d.dayOfWeek === day)
      return found ? { day: day.slice(0, 3), fullDay: day, amount: Math.round(found.averageAmount) } : null
    })
    .filter(Boolean) as Array<{ day: string; fullDay: string; amount: number }>

  const maxAmount = Math.max(...chartData.map((d) => d.amount))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Peak Business Days</CardTitle>
        <CardDescription>Average transaction amount by day of week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="day"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DAY_COLORS[entry.fullDay] || '#6b7280'}
                    opacity={entry.amount === maxAmount ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
