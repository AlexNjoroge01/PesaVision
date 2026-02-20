import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMonthlySummaryEmail } from '@/lib/resend'

export async function GET(request: NextRequest) {
  try {
    // Validate cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with BASIC or PRO plans
    const users = await prisma.user.findMany({
      where: {
        plan: {
          in: ['BASIC', 'PRO'],
        },
      },
      include: {
        statements: {
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
          include: {
            insight: true,
          },
        },
      },
    })

    let sent = 0
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const lastMonth = monthNames[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1]

    for (const user of users) {
      if (!user.email || user.statements.length === 0) continue

      // Aggregate data from all statements
      const totalIn = user.statements.reduce((sum, s) => sum + s.totalIn, 0)
      const totalOut = user.statements.reduce((sum, s) => sum + s.totalOut, 0)
      const netFlow = user.statements.reduce((sum, s) => sum + s.netFlow, 0)

      // Get top customer from insights
      const allTopCustomers = user.statements
        .filter(s => s.insight?.topCustomers)
        .flatMap(s => s.insight!.topCustomers as Array<{ name: string; totalAmount: number }>)

      const topCustomer = allTopCustomers.length > 0
        ? allTopCustomers.sort((a, b) => b.totalAmount - a.totalAmount)[0].name
        : 'N/A'

      // Get average health score
      const healthScores = user.statements
        .filter(s => s.insight?.healthScore)
        .map(s => s.insight!.healthScore)
      const avgHealthScore = healthScores.length > 0
        ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
        : 0

      try {
        await sendMonthlySummaryEmail(
          user.email,
          user.name || 'User',
          lastMonth,
          totalIn,
          totalOut,
          netFlow,
          topCustomer,
          avgHealthScore
        )
        sent++
      } catch (emailError) {
        console.error(`Failed to send monthly email to ${user.email}:`, emailError)
      }
    }

    return NextResponse.json({ sent })
  } catch (error) {
    console.error('Monthly reports cron error:', error)
    return NextResponse.json(
      { error: 'Failed to send monthly reports' },
      { status: 500 }
    )
  }
}
