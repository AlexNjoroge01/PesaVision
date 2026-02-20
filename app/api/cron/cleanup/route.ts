import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Validate cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find statements stuck in PENDING or PROCESSING for more than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

    const result = await prisma.statement.updateMany({
      where: {
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
        updatedAt: {
          lt: fifteenMinutesAgo,
        },
      },
      data: {
        status: 'FAILED',
      },
    })

    return NextResponse.json({ cleaned: result.count })
  } catch (error) {
    console.error('Cleanup cron error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup stuck statements' },
      { status: 500 }
    )
  }
}
