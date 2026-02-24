import type { ReactElement } from 'react'

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
}

/**
 * Send an email using Resend
 * Uses dynamic imports to avoid build-time errors when env vars aren't available
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return null
  }

  // Dynamic imports to avoid build-time evaluation
  const { Resend } = await import('resend')
  const { render } = await import('@react-email/render')
  
  const resend = new Resend(apiKey)
  const html = await render(react)
  
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Error sending email:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  businessName?: string
) {
  const { WelcomeEmail } = await import('@/emails/Welcome')
  return sendEmail({
    to: email,
    subject: 'Welcome to M-Pesa Analytics 🎉',
    react: WelcomeEmail({ name, businessName }),
  })
}

/**
 * Send a statement ready email
 */
export async function sendStatementReadyEmail(
  email: string,
  statementId: string,
  healthScore: number,
  aiSummary: string
) {
  const { StatementReadyEmail } = await import('@/emails/StatementReady')
  return sendEmail({
    to: email,
    subject: 'Your M-Pesa analysis is ready 📊',
    react: StatementReadyEmail({ statementId, healthScore, aiSummary }),
  })
}

/**
 * Send a subscription confirmed email
 */
export async function sendSubscriptionConfirmedEmail(
  email: string,
  name: string,
  plan: string,
  nextBillingDate: Date
) {
  const { SubscriptionConfirmedEmail } = await import('@/emails/SubscriptionConfirmed')
  return sendEmail({
    to: email,
    subject: `You're now on the ${plan} plan ✅`,
    react: SubscriptionConfirmedEmail({ name, plan, nextBillingDate }),
  })
}

/**
 * Send a monthly summary email
 */
export async function sendMonthlySummaryEmail(
  email: string,
  name: string,
  month: string,
  totalIn: number,
  totalOut: number,
  netFlow: number,
  topCustomer: string,
  healthScore: number
) {
  const { MonthlySummaryEmail } = await import('@/emails/MonthlySummary')
  return sendEmail({
    to: email,
    subject: `📈 Your ${month} business summary`,
    react: MonthlySummaryEmail({
      name,
      month,
      totalIn,
      totalOut,
      netFlow,
      topCustomer,
      healthScore,
    }),
  })
}
