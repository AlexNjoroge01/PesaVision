import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SUPER_USER
    if (session.user.role !== 'SUPER_USER') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get users by plan
    const usersByPlan = await prisma.user.groupBy({
      by: ['plan'],
      _count: {
        id: true,
      },
    })

    // Get new users this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Get total statements analyzed
    const totalStatements = await prisma.statement.count()

    // Get statements by status
    const statementsByStatus = await prisma.statement.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    // Get statements processed this month
    const statementsThisMonth = await prisma.statement.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        status: 'DONE',
      },
    })

    // Get total reports generated
    const totalReports = await prisma.report.count()

    // Get reports by type
    const reportsByType = await prisma.report.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    })

    // Get reports generated this month
    const reportsThisMonth = await prisma.report.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Get total transactions processed
    const totalTransactions = await prisma.transaction.count()

    // Get total transaction volume
    const transactionVolume = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
    })

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
      },
    })

    // Get subscriptions by plan
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: {
        id: true,
      },
    })

    // Get recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        role: true,
        createdAt: true,
        businessName: true,
      },
    })

    // Get recent statements (last 5)
    const recentStatements = await prisma.statement.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        fileName: true,
        status: true,
        totalIn: true,
        totalOut: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Calculate revenue (based on subscription plans - estimated)
    const planPrices: Record<string, number> = {
      FREE: 0,
      BASIC: 499, // KES per month
      PRO: 999, // KES per month
    }

    const monthlyRecurringRevenue = usersByPlan.reduce((total: number, plan) => {
      return total + (plan._count.id * (planPrices[plan.plan] || 0))
    }, 0)

    // Get user growth data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const usersByMonth = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM users
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Get statements growth data (last 6 months)
    const statementsByMonth = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM statements
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        byPlan: usersByPlan.map((p) => ({
          plan: p.plan,
          count: p._count.id,
        })),
        recent: recentUsers,
        growth: usersByMonth.map((u) => ({
          month: u.month,
          count: Number(u.count),
        })),
      },
      statements: {
        total: totalStatements,
        thisMonth: statementsThisMonth,
        byStatus: statementsByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        recent: recentStatements,
        growth: statementsByMonth.map((s) => ({
          month: s.month,
          count: Number(s.count),
        })),
      },
      reports: {
        total: totalReports,
        thisMonth: reportsThisMonth,
        byType: reportsByType.map((r) => ({
          type: r.type,
          count: r._count.id,
        })),
      },
      transactions: {
        total: totalTransactions,
        volume: transactionVolume._sum.amount || 0,
      },
      subscriptions: {
        active: activeSubscriptions,
        byPlan: subscriptionsByPlan.map((s) => ({
          plan: s.plan,
          count: s._count.id,
        })),
      },
      revenue: {
        monthlyRecurring: monthlyRecurringRevenue,
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
