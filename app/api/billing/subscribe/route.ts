import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { initializeTransaction, PLAN_PRICES } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body as { plan: 'BASIC' | 'PRO' }

    if (!plan || !['BASIC', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose BASIC or PRO.' },
        { status: 400 }
      )
    }

    const amount = PLAN_PRICES[plan]
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    // Initialize Paystack transaction
    const result = await initializeTransaction({
      email: session.user.email,
      amount,
      plan,
      userId: session.user.id,
      callbackUrl: `${baseUrl}/settings?payment=success`,
    })

    if (!result.status) {
      return NextResponse.json(
        { error: result.message || 'Failed to initialize payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize subscription' },
      { status: 500 }
    )
  }
}
