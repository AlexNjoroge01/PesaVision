'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FileText,
  FileBarChart,
  CreditCard,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AdminStats {
  users: {
    total: number
    newThisMonth: number
    byPlan: Array<{ plan: string; count: number }>
    recent: Array<{
      id: string
      name: string | null
      email: string
      plan: string
      role: string
      createdAt: string
      businessName: string | null
    }>
    growth: Array<{ month: Date; count: number }>
  }
  statements: {
    total: number
    thisMonth: number
    byStatus: Array<{ status: string; count: number }>
    recent: Array<{
      id: string
      fileName: string
      status: string
      totalIn: number
      totalOut: number
      createdAt: string
      user: { name: string | null; email: string }
    }>
    growth: Array<{ month: Date; count: number }>
  }
  reports: {
    total: number
    thisMonth: number
    byType: Array<{ type: string; count: number }>
  }
  transactions: {
    total: number
    volume: number
  }
  subscriptions: {
    active: number
    byPlan: Array<{ plan: string; count: number }>
  }
  revenue: {
    monthlyRecurring: number
  }
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

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'SUPER_USER') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'SUPER_USER') {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError('Failed to load admin statistics')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  const mainStats = [
    {
      label: 'Total Users',
      value: stats.users.total.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `+${stats.users.newThisMonth} this month`,
      changeType: 'positive' as const,
    },
    {
      label: 'Statements Analyzed',
      value: stats.statements.total.toLocaleString(),
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${stats.statements.thisMonth} processed this month`,
      changeType: 'positive' as const,
    },
    {
      label: 'Reports Generated',
      value: stats.reports.total.toLocaleString(),
      icon: FileBarChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: `${stats.reports.thisMonth} this month`,
      changeType: 'positive' as const,
    },
    {
      label: 'Active Subscriptions',
      value: stats.subscriptions.active.toLocaleString(),
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: `${stats.subscriptions.byPlan.find(p => p.plan === 'PRO')?.count || 0} PRO users`,
      changeType: 'neutral' as const,
    },
  ]

  const secondaryStats = [
    {
      label: 'Total Transactions',
      value: stats.transactions.total.toLocaleString(),
      icon: Activity,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      label: 'Transaction Volume',
      value: `KES ${(stats.transactions.volume / 1000000).toFixed(2)}M`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Monthly Recurring Revenue',
      value: `KES ${stats.revenue.monthlyRecurring.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'PRO':
        return 'default'
      case 'BASIC':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your application statistics and metrics
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn('text-2xl font-bold mt-1', stat.color)}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {stat.changeType === 'positive' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                      {stat.change}
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-full', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {secondaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn('text-xl font-bold mt-1', stat.color)}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('p-2.5 rounded-full', stat.bgColor)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Plan</CardTitle>
            <CardDescription>Distribution of users across subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.users.byPlan.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(plan.plan)}>{plan.plan}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {((plan.count / stats.users.total) * 100).toFixed(1)}% of users
                    </span>
                  </div>
                  <span className="font-semibold">{plan.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statements by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statements by Status</CardTitle>
            <CardDescription>Processing status of all statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.statements.byStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium">{status.status}</span>
                    <span className="text-sm text-muted-foreground">
                      {((status.count / stats.statements.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reports by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Type</CardTitle>
            <CardDescription>Types of reports generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.reports.byType.map((report) => (
                <div key={report.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{report.type.replace(/_/g, ' ')}</span>
                  <span className="font-semibold">{report.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Current active subscriptions by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subscriptions.byPlan.map((sub) => (
                <div key={sub.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(sub.plan)}>{sub.plan}</Badge>
                  </div>
                  <span className="font-semibold">{sub.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest users who signed up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.users.recent.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(user.plan)} className="text-xs">
                      {user.plan}
                    </Badge>
                    {user.role === 'SUPER_USER' && (
                      <Badge variant="default" className="text-xs bg-amber-500">Admin</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Statements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Statements</CardTitle>
            <CardDescription>Latest statements processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.statements.recent.map((statement) => (
                <div key={statement.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[150px]">{statement.fileName}</p>
                      <p className="text-xs text-muted-foreground">{statement.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(statement.status)}
                    <div className="text-right">
                      <p className="text-xs text-green-600">+{statement.totalIn.toLocaleString()}</p>
                      <p className="text-xs text-red-600">-{statement.totalOut.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
