import { generateText } from 'ai'
import { z } from 'zod'
import { groq, ANALYSIS_MODEL, MAX_TOKENS } from './groq'
import { RawTransaction, TopCustomer, TopExpense, PeakDay, MonthlySummary, Recommendation } from '@/types'

const VALID_CATEGORIES = [
  'SALES',
  'SUPPLIER_PAYMENT',
  'UTILITY',
  'SALARY',
  'WITHDRAWAL',
  'TRANSFER',
  'AIRTIME',
  'UNCATEGORIZED',
] as const

const CATEGORIZATION_SYSTEM = `You categorize M-Pesa transactions for Kenyan small businesses.
Return ONLY a JSON array. No markdown, no backticks, no explanation.
Each element: {"ref":"REFERENCE","cat":"CATEGORY","cp":"COUNTERPARTY_NAME_OR_NULL"}
Categories: SALES, SUPPLIER_PAYMENT, UTILITY, SALARY, WITHDRAWAL, TRANSFER, AIRTIME, UNCATEGORIZED
Extract counterparty names from descriptions (e.g. "Payment to 123 - JOHN SHOP" → cp:"JOHN SHOP").`

const INSIGHTS_SYSTEM = `You are a financial advisor for Kenyan small business owners analyzing M-Pesa transaction summaries.
Return ONLY a valid JSON object. No markdown, no backticks, no explanation.

Context for Kenyan SMEs:
- M-Pesa is the primary payment method
- Common types: Paybill, Till, Send Money
- KRA compliance matters for tax reporting

Health Score: 70-100 strong, 50-69 moderate, 0-49 poor

JSON keys required:
- topCustomers: [{name, totalAmount, transactionCount}] (top 10)
- topExpenses: [{category, amount, percentage}]
- peakDays: [{dayOfWeek, averageAmount}]
- monthlySummary: [{month, totalIn, totalOut, netFlow}]
- aiSummary: 2-3 sentence plain English summary
- recommendations: [{title, description, priority}] (priority: "high"|"medium"|"low")
- healthScore: 0-100`

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

// Zod schemas for each phase
const CategorizationSchema = z.array(
  z.object({
    ref: z.string().nullable(),
    cat: z.enum(VALID_CATEGORIES),
    cp: z.string().nullable().optional(),
  })
)

const InsightsResponseSchema = z.object({
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

/**
 * Attempt to repair truncated JSON by closing open brackets/braces
 */
function repairTruncatedJson(text: string): string {
  try {
    JSON.parse(text)
    return text
  } catch {
    // Continue with repair
  }

  let repaired = text.replace(/,\s*"[^"]*$/, '')
  repaired = repaired.replace(/,\s*"[^"]*":\s*"[^"]*$/, '')
  repaired = repaired.replace(/,\s*"[^"]*":\s*$/, '')
  repaired = repaired.replace(/,\s*\{[^}]*$/, '')
  repaired = repaired.replace(/,\s*$/, '')

  let openBraces = 0
  let openBrackets = 0
  let inString = false
  let escaped = false

  for (const char of repaired) {
    if (escaped) { escaped = false; continue }
    if (char === '\\') { escaped = true; continue }
    if (char === '"') { inString = !inString; continue }
    if (inString) continue
    if (char === '{') openBraces++
    else if (char === '}') openBraces--
    else if (char === '[') openBrackets++
    else if (char === ']') openBrackets--
  }

  while (openBrackets > 0) { repaired += ']'; openBrackets-- }
  while (openBraces > 0) { repaired += '}'; openBraces-- }

  return repaired
}

function parseJsonSafe(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    console.log('[ANALYZER] JSON parse failed, attempting repair...')
    const repaired = repairTruncatedJson(cleaned)
    return JSON.parse(repaired)
  }
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Categorize a batch of transactions using AI
 */
async function categorizeBatch(
  batch: RawTransaction[]
): Promise<Array<{ ref: string | null; cat: string; cp: string | null }>> {
  const compact = batch.map((t) => `${t.reference}|${t.description}|${t.amount}|${t.isIncoming ? 'IN' : 'OUT'}`)

  const { text } = await generateText({
    model: groq(ANALYSIS_MODEL),
    maxOutputTokens: 4000,
    system: CATEGORIZATION_SYSTEM,
    prompt: `Categorize these M-Pesa transactions (format: ref|description|amount|direction):\n${compact.join('\n')}`,
  })

  const parsed = parseJsonSafe(text)
  return CategorizationSchema.parse(parsed).map((t) => ({
    ref: t.ref,
    cat: t.cat,
    cp: t.cp ?? null,
  }))
}

/**
 * Generate business insights from pre-categorized transaction summary
 */
async function generateInsights(
  transactions: RawTransaction[],
  categorized: Array<{ ref: string | null; cat: string; cp: string | null }>
): Promise<Omit<AnalysisResult, 'transactions'>> {
  // Build a compact summary instead of sending all transactions
  const categoryMap = new Map<string, { ref: string | null; cat: string; cp: string | null }>()
  for (const c of categorized) {
    if (c.ref) categoryMap.set(c.ref, c)
  }

  const totalIn = transactions.filter((t) => t.isIncoming).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter((t) => !t.isIncoming).reduce((s, t) => s + t.amount, 0)

  // Group by category
  const catSummary: Record<string, { count: number; totalIn: number; totalOut: number }> = {}
  for (const t of transactions) {
    const cat = (t.reference && categoryMap.get(t.reference)?.cat) || 'UNCATEGORIZED'
    if (!catSummary[cat]) catSummary[cat] = { count: 0, totalIn: 0, totalOut: 0 }
    catSummary[cat].count++
    if (t.isIncoming) catSummary[cat].totalIn += t.amount
    else catSummary[cat].totalOut += t.amount
  }

  // Group by month
  const monthSummary: Record<string, { totalIn: number; totalOut: number }> = {}
  for (const t of transactions) {
    const month = t.date.toISOString().slice(0, 7)
    if (!monthSummary[month]) monthSummary[month] = { totalIn: 0, totalOut: 0 }
    if (t.isIncoming) monthSummary[month].totalIn += t.amount
    else monthSummary[month].totalOut += t.amount
  }

  // Top counterparties (incoming = customers)
  const cpMap = new Map<string, { total: number; count: number }>()
  for (const t of transactions.filter((tx) => tx.isIncoming)) {
    const cp = (t.reference && categoryMap.get(t.reference)?.cp) || t.counterparty
    if (cp) {
      const existing = cpMap.get(cp) || { total: 0, count: 0 }
      cpMap.set(cp, { total: existing.total + t.amount, count: existing.count + 1 })
    }
  }

  // Day of week summary
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayTotals: Record<string, { total: number; count: number }> = {}
  for (const t of transactions) {
    const day = dayNames[t.date.getDay()]
    if (!dayTotals[day]) dayTotals[day] = { total: 0, count: 0 }
    dayTotals[day].total += t.amount
    dayTotals[day].count++
  }

  const summaryData = {
    totalTransactions: transactions.length,
    totalIn: Math.round(totalIn),
    totalOut: Math.round(totalOut),
    netFlow: Math.round(totalIn - totalOut),
    categories: catSummary,
    months: monthSummary,
    topCounterparties: Array.from(cpMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([name, data]) => ({ name, total: Math.round(data.total), count: data.count })),
    dayOfWeek: dayTotals,
  }

  const { text } = await generateText({
    model: groq(ANALYSIS_MODEL),
    maxOutputTokens: MAX_TOKENS,
    system: INSIGHTS_SYSTEM,
    prompt: `Generate business insights from this M-Pesa transaction summary:\n${JSON.stringify(summaryData)}`,
  })

  const parsed = parseJsonSafe(text)
  return InsightsResponseSchema.parse(parsed)
}

/**
 * Analyze transactions using Groq AI (two-phase: categorize then insights)
 */
export async function analyzeTransactions(
  transactions: RawTransaction[]
): Promise<AnalysisResult> {
  // Phase 1: Categorize transactions in batches
  // Keep batches small to stay within Groq's 12K TPM free tier limit
  const BATCH_SIZE = 30
  const allCategorized: Array<{ ref: string | null; cat: string; cp: string | null }> = []

  console.log(`[ANALYZER] Phase 1: Categorizing ${transactions.length} transactions in batches of ${BATCH_SIZE}`)

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(transactions.length / BATCH_SIZE)

    console.log(`[ANALYZER] Categorizing batch ${batchNum}/${totalBatches} (${batch.length} transactions)`)

    let success = false
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Rate limit: wait between batches (Groq free tier is per-minute)
        if (i > 0) {
          const waitMs = 8000 // 8 seconds between batches to stay under TPM
          console.log(`[ANALYZER] Rate limit: waiting ${waitMs}ms...`)
          await delay(waitMs)
        }

        const result = await categorizeBatch(batch)
        allCategorized.push(...result)
        success = true
        break
      } catch (error) {
        console.error(`[ANALYZER] Batch ${batchNum} attempt ${attempt + 1} failed:`, error)
        if (attempt < 2) {
          // Wait longer on retry (rate limit backoff)
          await delay(15000)
        }
      }
    }

    if (!success) {
      // If categorization fails for a batch, use UNCATEGORIZED as fallback
      console.log(`[ANALYZER] Batch ${batchNum} failed all retries, using UNCATEGORIZED fallback`)
      for (const t of batch) {
        allCategorized.push({ ref: t.reference, cat: 'UNCATEGORIZED', cp: t.counterparty })
      }
    }
  }

  console.log(`[ANALYZER] Phase 1 complete: ${allCategorized.length} transactions categorized`)

  // Phase 2: Generate insights from the categorized summary
  console.log('[ANALYZER] Phase 2: Generating business insights')

  // Wait before insights call to respect rate limits
  await delay(10000)

  let insights: Omit<AnalysisResult, 'transactions'>
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      insights = await generateInsights(transactions, allCategorized)

      return {
        transactions: allCategorized.map((t) => ({
          reference: t.ref,
          category: t.cat,
          counterparty: t.cp,
        })),
        ...insights,
      }
    } catch (error) {
      console.error(`[ANALYZER] Insights attempt ${attempt + 1} failed:`, error)
      if (attempt < 2) {
        await delay(15000)
      }
    }
  }

  // If insights generation fails, return categorized data with computed insights
  console.log('[ANALYZER] Insights generation failed, computing locally')
  return buildFallbackInsights(transactions, allCategorized)
}

/**
 * Build fallback insights locally when AI insights generation fails
 */
function buildFallbackInsights(
  transactions: RawTransaction[],
  categorized: Array<{ ref: string | null; cat: string; cp: string | null }>
): AnalysisResult {
  const categoryMap = new Map<string, { ref: string | null; cat: string; cp: string | null }>()
  for (const c of categorized) {
    if (c.ref) categoryMap.set(c.ref, c)
  }

  const totalIn = transactions.filter((t) => t.isIncoming).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter((t) => !t.isIncoming).reduce((s, t) => s + t.amount, 0)

  // Top customers
  const cpMap = new Map<string, { total: number; count: number }>()
  for (const t of transactions.filter((tx) => tx.isIncoming)) {
    const cp = (t.reference && categoryMap.get(t.reference)?.cp) || t.counterparty
    if (cp) {
      const existing = cpMap.get(cp) || { total: 0, count: 0 }
      cpMap.set(cp, { total: existing.total + t.amount, count: existing.count + 1 })
    }
  }

  // Expense categories
  const expenseMap = new Map<string, number>()
  for (const t of transactions.filter((tx) => !tx.isIncoming)) {
    const cat = (t.reference && categoryMap.get(t.reference)?.cat) || 'UNCATEGORIZED'
    expenseMap.set(cat, (expenseMap.get(cat) || 0) + t.amount)
  }

  // Monthly summary
  const monthMap = new Map<string, { totalIn: number; totalOut: number }>()
  for (const t of transactions) {
    const month = t.date.toISOString().slice(0, 7)
    const existing = monthMap.get(month) || { totalIn: 0, totalOut: 0 }
    if (t.isIncoming) existing.totalIn += t.amount
    else existing.totalOut += t.amount
    monthMap.set(month, existing)
  }

  // Peak days
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayTotals = new Map<string, { total: number; count: number }>()
  for (const t of transactions) {
    const day = dayNames[t.date.getDay()]
    const existing = dayTotals.get(day) || { total: 0, count: 0 }
    dayTotals.set(day, { total: existing.total + t.amount, count: existing.count + 1 })
  }

  const healthScore = totalIn > totalOut ? Math.min(80, Math.round((totalIn / (totalIn + totalOut)) * 100)) : Math.max(20, Math.round((totalIn / (totalIn + totalOut)) * 100))

  return {
    transactions: categorized.map((t) => ({
      reference: t.ref,
      category: t.cat,
      counterparty: t.cp,
    })),
    topCustomers: Array.from(cpMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([name, data]) => ({ name, totalAmount: data.total, transactionCount: data.count })),
    topExpenses: Array.from(expenseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount, percentage: Math.round((amount / totalOut) * 100) })),
    peakDays: Array.from(dayTotals.entries())
      .map(([dayOfWeek, data]) => ({ dayOfWeek, averageAmount: data.total / data.count }))
      .sort((a, b) => b.averageAmount - a.averageAmount),
    monthlySummary: Array.from(monthMap.entries())
      .sort()
      .map(([month, data]) => ({ month, totalIn: data.totalIn, totalOut: data.totalOut, netFlow: data.totalIn - data.totalOut })),
    aiSummary: `This business processed ${transactions.length} transactions with KES ${Math.round(totalIn).toLocaleString()} incoming and KES ${Math.round(totalOut).toLocaleString()} outgoing. Net cash flow is KES ${Math.round(totalIn - totalOut).toLocaleString()}.`,
    recommendations: [
      { title: 'Track your expenses', description: 'Monitor your spending categories to identify areas for cost reduction.', priority: 'medium' as const },
      { title: 'Build cash reserves', description: 'Aim to maintain at least 3 months of operating expenses as reserves.', priority: 'high' as const },
    ],
    healthScore,
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
