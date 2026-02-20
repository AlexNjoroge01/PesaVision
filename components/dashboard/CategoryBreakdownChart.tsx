'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopExpense } from '@/types'

interface CategoryBreakdownChartProps {
  data: TopExpense[]
  className?: string
}

const COLORS: Record<string, string> = {
  SALES: '#22c55e',
  SUPPLIER_PAYMENT: '#3b82f6',
  UTILITY: '#f59e0b',
  SALARY: '#8b5cf6',
  WITHDRAWAL: '#ec4899',
  TRANSFER: '#06b6d4',
  AIRTIME: '#f97316',
  UNCATEGORIZED: '#6b7280',
}

const formatKES = (value: number) => {
  return `KES ${value.toLocaleString()}`
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; payload: { name: string; percentage: number } }>
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Amount: {formatKES(payload[0].value)}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.percentage.toFixed(1)}% of expenses
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CategoryBreakdownChart({ data, className }: CategoryBreakdownChartProps) {
  if (!data || data.length === 0) {
    return null
  }

  const chartData = data.map((item) => ({
    name: item.category.replace(/_/g, ' '),
    value: item.amount,
    percentage: item.percentage,
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name.replace(/ /g, '_')] || COLORS.UNCATEGORIZED}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
