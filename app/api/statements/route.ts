import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const statements = await prisma.statement.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        insight: {
          select: {
            healthScore: true,
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
    })

    return NextResponse.json(statements)
  } catch (error) {
    console.error('Error fetching statements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statements' },
      { status: 500 }
    )
  }
}
