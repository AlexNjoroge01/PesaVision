import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/paystack'
import { sendSubscriptionConfirmedEmail } from '@/lib/resend'
import type { PaystackWebhookEvent } from '@/lib/paystack'
import type { Plan } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const payload = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature || !verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Return 200 immediately (Paystack requires fast response)
    const event: PaystackWebhookEvent = JSON.parse(payload)

    // Process in background
    processWebhookEvent(event).catch((error) => {
      console.error('Webhook processing error:', error)
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function processWebhookEvent(event: PaystackWebhookEvent) {
  switch (event.event) {
    case 'charge.success':
      await handleChargeSuccess(event)
      break
    case 'subscription.disable':
      await handleSubscriptionDisable(event)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event)
      break
    default:
      console.log(`Unhandled event: ${event.event}`)
  }
}

async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { data } = event
  const userId = data.metadata?.userId
  const plan = data.metadata?.plan as Plan | undefined

  if (!userId || !plan) {
    console.error('Missing userId or plan in webhook metadata')
    return
  }

  // Update user plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  // Create or update subscription record
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        plan,
        status: 'ACTIVE',
        paystackSubId: data.subscription?.subscription_code,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        paystackSubId: data.subscription?.subscription_code,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Send confirmation email
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (user?.email) {
    try {
      await sendSubscriptionConfirmedEmail(
        user.email,
        user.name || 'User',
        plan,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      )
    } catch (emailError) {
      console.error('Failed to send subscription email:', emailError)
    }
  }
}

async function handleSubscriptionDisable(event: PaystackWebhookEvent) {
  const { data } = event
  const subscriptionCode = data.subscription?.subscription_code

  if (!subscriptionCode) {
    console.error('Missing subscription code in disable event')
    return
  }

  // Find subscription by Paystack ID
  const subscription = await prisma.subscription.findFirst({
    where: { paystackSubId: subscriptionCode },
  })

  if (!subscription) {
    console.error('Subscription not found for disable event')
    return
  }

  // Downgrade user to FREE
  await prisma.user.update({
    where: { id: subscription.userId },
    data: {
      plan: 'FREE',
      planExpiresAt: null,
    },
  })

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
    },
  })
}

async function handlePaymentFailed(event: PaystackWebhookEvent) {
  const { data } = event
  const subscriptionCode = data.subscription?.subscription_code

  if (!subscriptionCode) {
    return
  }

  // Find subscription by Paystack ID
  const subscription = await prisma.subscription.findFirst({
    where: { paystackSubId: subscriptionCode },
  })

  if (!subscription) {
    return
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'PAST_DUE',
    },
  })
}
