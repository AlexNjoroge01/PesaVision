import { generateText } from 'ai'
import { z } from 'zod'
import { groq, ANALYSIS_MODEL } from './groq'
import { RawTransaction, Insight, TopCustomer, TopExpense, PeakDay, MonthlySummary, Recommendation } from '@/types'

// Zod schema for AI response validation
const InsightSchema = z.object({
  transactions: z.array(
    z.object({
      reference: z.string().nullable(),
      category: z.enum([
        'SALES',
        'SUPPLIER_PAYMENT',
        'UTILITY',
        'SALARY',
        'WITHDRAWAL',
        'TRANSFER',
        'AIRTIME',
        'UNCATEGORIZED',
      ]),
      counterparty: z.string().nullable(),
    })
  ),
  topCustomers: z.array(
    z.object({
      name: z.string(),
      totalAmount: z.number(),
      transactionCount: z.number(),
    })
  ),
  topExpenses: z.array(
    z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
    })
  ),
  peakDays: z.array(
    z.object({
      dayOfWeek: z.string(),
      averageAmount: z.number(),
    })
  ),
  monthlySummary: z.array(
    z.object({
      month: z.string(),
      totalIn: z.number(),
      totalOut: z.number(),
      netFlow: z.number(),
    })
  ),
  aiSummary: z.string(),
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  healthScore: z.number().min(0).max(100),
})

const SYSTEM_PROMPT = `You are a financial advisor for Kenyan small business owners analyzing M-Pesa transactions.

Your role is to:
1. Categorize each transaction into appropriate categories
2. Identify top customers by revenue (incoming transactions)
3. Analyze expense patterns by category
4. Identify peak business days
5. Generate monthly summaries
6. Provide a plain-English business summary that a non-accountant can understand
7. Give actionable recommendations with priority levels
8. Calculate a business health score (0-100)

Context for Kenyan SMEs:
- M-Pesa is the primary payment method for most small businesses
- Common transaction types: Paybill (business payments), Till (retail purchases), Send Money (P2P)
- KRA compliance is important for tax reporting
- Common business types: retail shops, restaurants, service providers, freelancers

Health Score Guidelines:
- 70-100: Strong positive cash flow, consistent revenue, manageable expenses
- 50-69: Moderate health, some cash flow concerns or irregular income
- 0-49: Poor health, negative cash flow, high expenses, or irregular patterns

CRITICAL Output Rules:
- Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation
- The transaction array key MUST be named "transactions", not "categorizedTransactions"
- Categories MUST be exactly one of: SALES, SUPPLIER_PAYMENT, UTILITY, SALARY, WITHDRAWAL, TRANSFER, AIRTIME, UNCATEGORIZED — no other values allowed
- topCustomers MUST be an array of objects with: name (string), totalAmount (number), transactionCount (number)
- topExpenses MUST be an array of objects with: category (string), amount (number), percentage (number)
- peakDays MUST be an array of objects with: dayOfWeek (string), averageAmount (number)
- monthlySummary MUST be an array of objects with: month (string), totalIn (number), totalOut (number), netFlow (number)
- recommendations MUST be an array of objects with: title (string), description (string), priority ("high" or "medium" or "low")
- aiSummary should be 2-3 sentences in plain English
- healthScore should be a number between 0 and 100
- counterparty names should be extracted from transaction descriptions`

interface AnalysisResult {
  transactions: Array<{
    reference: string | null
    category: string
    counterparty: string | null
  }>
  topCustomers: TopCustomer[]
  topExpenses: TopExpense[]
  peakDays: PeakDay[]
  monthlySummary: MonthlySummary[]
  aiSummary: string
  recommendations: Recommendation[]
  healthScore: number
}

/**
 * Analyze transactions using Groq AI
 */
export async function analyzeTransactions(
  transactions: RawTransaction[]
): Promise<AnalysisResult> {
  // Handle large transaction sets by batching
  const BATCH_SIZE = 200
  let transactionsToAnalyze = transactions

  if (transactions.length > BATCH_SIZE) {
    // For large datasets, analyze first batch and aggregate the rest
    transactionsToAnalyze = transactions.slice(0, BATCH_SIZE)
  }

  // Format transactions for AI
  const formattedTransactions = transactionsToAnalyze.map((t) => ({
    date: t.date.toISOString(),
    description: t.description,
    amount: t.amount,
    isIncoming: t.isIncoming,
    reference: t.reference,
    counterparty: t.counterparty,
  }))

  try {
    const { text } = await generateText({
      model: groq(ANALYSIS_MODEL),
      system: SYSTEM_PROMPT + '\n\nReturn ONLY a valid JSON object. No markdown, no backticks, no explanation.',
      prompt: `Analyze these M-Pesa transactions and provide business insights:

${JSON.stringify(formattedTransactions, null, 2)}

Total transactions: ${transactions.length}
${transactions.length > BATCH_SIZE ? `Note: Showing first ${BATCH_SIZE} of ${transactions.length} transactions for analysis.` : ''}

Provide:
1. Category for each transaction
2. Top 10 customers by revenue
3. Top expense categories
4. Peak business days
5. Monthly summary
6. Business summary in plain English
7. Actionable recommendations
8. Health score (0-100)`,
    })

    // Parse the response - clean up any markdown formatting
    const cleaned = text.replace(/```json|```/g, '').trim()
    console.log('[ANALYZER] Raw AI response:', cleaned.substring(0, 2000))
    const object = InsightSchema.parse(JSON.parse(cleaned))

    return object as AnalysisResult
  } catch (error) {
    console.error('Error analyzing transactions:', error)
    throw new Error(
      `Failed to analyze transactions: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Calculate basic statistics from transactions
 */
export function calculateTransactionStats(transactions: RawTransaction[]): {
  totalIn: number
  totalOut: number
  netFlow: number
  transactionCount: number
} {
  const totalIn = transactions
    .filter((t) => t.isIncoming)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = transactions
    .filter((t) => !t.isIncoming)
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIn,
    totalOut,
    netFlow: totalIn - totalOut,
    transactionCount: transactions.length,
  }
}

/**
 * Group transactions by month
 */
export function groupByMonth(
  transactions: RawTransaction[]
): Map<string, RawTransaction[]> {
  const grouped = new Map<string, RawTransaction[]>()

  for (const transaction of transactions) {
    const monthKey = transaction.date.toISOString().slice(0, 7) // YYYY-MM
    const existing = grouped.get(monthKey) || []
    existing.push(transaction)
    grouped.set(monthKey, existing)
  }

  return grouped
}

/**
 * Get top counterparties by transaction volume
 */
export function getTopCounterparties(
  transactions: RawTransaction[],
  isIncoming: boolean,
  limit: number = 10
): TopCustomer[] {
  const counterpartyMap = new Map<string, { total: number; count: number }>()

  for (const t of transactions.filter((tx) => tx.isIncoming === isIncoming)) {
    if (t.counterparty) {
      const existing = counterpartyMap.get(t.counterparty) || { total: 0, count: 0 }
      counterpartyMap.set(t.counterparty, {
        total: existing.total + t.amount,
        count: existing.count + 1,
      })
    }
  }

  return Array.from(counterpartyMap.entries())
    .map(([name, data]) => ({
      name,
      totalAmount: data.total,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
}

/**
 * Calculate daily averages by day of week
 */
export function calculatePeakDays(transactions: RawTransaction[]): PeakDay[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayTotals = new Map<number, { total: number; count: number }>()

  for (const t of transactions) {
    const dayOfWeek = t.date.getDay()
    const existing = dayTotals.get(dayOfWeek) || { total: 0, count: 0 }
    dayTotals.set(dayOfWeek, {
      total: existing.total + t.amount,
      count: existing.count + 1,
    })
  }

  return Array.from(dayTotals.entries())
    .map(([day, data]) => ({
      dayOfWeek: dayNames[day],
      averageAmount: data.total / data.count,
    }))
    .sort((a, b) => b.averageAmount - a.averageAmount)
}
