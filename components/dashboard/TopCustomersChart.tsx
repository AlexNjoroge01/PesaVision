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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopCustomer } from '@/types'

interface TopCustomersChartProps {
  data: TopCustomer[]
  className?: string
}

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

const formatKES = (value: number) => {
  return `KES ${value.toLocaleString()}`
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; payload: { name: string; count: number } }>
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Total: {formatKES(payload[0].value)}
        </p>
        <p className="text-sm text-muted-foreground">
          Transactions: {data.count}
        </p>
      </div>
    )
  }
  return null
}

export function TopCustomersChart({ data, className }: TopCustomersChartProps) {
  if (!data || data.length === 0) {
    return null
  }

  // Take top 5 and reverse for horizontal bar chart
  const chartData = data.slice(0, 5).map((item) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
    fullName: item.name,
    amount: item.totalAmount,
    count: item.transactionCount,
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
