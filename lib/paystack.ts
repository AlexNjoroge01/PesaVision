import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

// Plan prices in KES (in pesewas - smallest currency unit)
export const PLAN_PRICES = {
  BASIC: 49900, // Ksh 499
  PRO: 149900, // Ksh 1,499
} as const

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: {
      plan: string
      userId: string
    }
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
    }
  }
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    reference: string
    amount: number
    status: string
    currency: string
    paid_at: string
    created_at: string
    channel: string
    customer: {
      id: number
      email: string
    }
    metadata?: {
      plan?: string
      userId?: string
    }
    subscription?: {
      id: number
      subscription_code: string
      email_token: string
    }
  }
}

/**
 * Initialize a Paystack transaction
 */
export async function initializeTransaction(options: {
  email: string
  amount: number
  plan: 'BASIC' | 'PRO'
  userId: string
  callbackUrl: string
}): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: options.email,
      amount: options.amount,
      callback_url: options.callbackUrl,
      metadata: {
        plan: options.plan,
        userId: options.userId,
      },
      currency: 'KES',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paystack initialization failed: ${error}`)
  }

  return response.json()
}

/**
 * Verify a Paystack transaction
 */
export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paystack verification failed: ${error}`)
  }

  return response.json()
}

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest('hex')

  return hash === signature
}

/**
 * Create a subscription plan in Paystack
 */
export async function createPlan(options: {
  name: string
  amount: number
  interval: 'monthly' | 'yearly'
}): Promise<{ data: { plan_code: string } }> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: options.name,
      amount: options.amount,
      interval: options.interval,
      currency: 'KES',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paystack plan creation failed: ${error}`)
  }

  return response.json()
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionCode: string): Promise<void> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/subscription/${subscriptionCode}/disable`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paystack subscription cancellation failed: ${error}`)
  }
}

/**
 * Format amount to KES currency string
 */
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
