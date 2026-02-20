import { prisma } from './prisma'
import type { Plan } from '@/types'

// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    statementsPerMonth: 1,
    kraExport: false,
    whatsappBot: false,
    aiChat: false,
  },
  BASIC: {
    statementsPerMonth: Infinity,
    kraExport: false,
    whatsappBot: false,
    aiChat: true,
  },
  PRO: {
    statementsPerMonth: Infinity,
    kraExport: true,
    whatsappBot: true,
    aiChat: true,
  },
} as const

/**
 * Check if a user can upload a new statement this month
 */
export async function canUploadStatement(userId: string): Promise<{
  allowed: boolean
  reason?: string
  currentCount: number
  limit: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  if (!user) {
    return { allowed: false, reason: 'User not found', currentCount: 0, limit: 0 }
  }

  const plan = user.plan as Plan
  const limit = PLAN_LIMITS[plan].statementsPerMonth

  // Get count of statements created this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const currentCount = await prisma.statement.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  })

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows ${limit === Infinity ? 'unlimited' : limit} statement${limit === 1 ? '' : 's'} per month. You've already uploaded ${currentCount} this month. Please upgrade to continue.`,
      currentCount,
      limit,
    }
  }

  return { allowed: true, currentCount, limit }
}

/**
 * Check if a user can access KRA export feature
 */
export async function canAccessKraExport(userId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  if (!user) {
    return { allowed: false, reason: 'User not found' }
  }

  const plan = user.plan as Plan

  if (!PLAN_LIMITS[plan].kraExport) {
    return {
      allowed: false,
      reason: 'KRA Export is only available on the Pro plan. Please upgrade to access this feature.',
    }
  }

  return { allowed: true }
}

/**
 * Check if a user can access WhatsApp bot
 */
export async function canAccessWhatsAppBot(userId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  if (!user) {
    return { allowed: false, reason: 'User not found' }
  }

  const plan = user.plan as Plan

  if (!PLAN_LIMITS[plan].whatsappBot) {
    return {
      allowed: false,
      reason: 'WhatsApp Bot is only available on the Pro plan. Please upgrade to access this feature.',
    }
  }

  return { allowed: true }
}

/**
 * Check if a user can access AI chat
 */
export async function canAccessAiChat(userId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  if (!user) {
    return { allowed: false, reason: 'User not found' }
  }

  const plan = user.plan as Plan

  if (!PLAN_LIMITS[plan].aiChat) {
    return {
      allowed: false,
      reason: 'AI Chat is only available on Basic and Pro plans. Please upgrade to access this feature.',
    }
  }

  return { allowed: true }
}

/**
 * Get user's current plan limits
 */
export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan]
}

/**
 * Check if plan is active (not expired)
 */
export async function isPlanActive(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  })

  if (!user) return false

  // FREE plan is always active
  if (user.plan === 'FREE') return true

  // Check if plan has expired
  if (user.planExpiresAt && user.planExpiresAt < new Date()) {
    return false
  }

  return true
}

/**
 * Downgrade expired plans to FREE
 */
export async function downgradeExpiredPlans(): Promise<number> {
  const result = await prisma.user.updateMany({
    where: {
      planExpiresAt: {
        lt: new Date(),
      },
      plan: {
        not: 'FREE',
      },
    },
    data: {
      plan: 'FREE',
    },
  })

  return result.count
}
