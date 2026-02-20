import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamText } from 'ai'
import { groq, CHAT_MODEL } from '@/lib/groq'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `You are a helpful financial advisor for Kenyan small business owners. You help them understand their M-Pesa transaction data and provide actionable business advice.

Your role is to:
- Answer questions about their business finances in plain English
- Provide insights about their cash flow, customers, and expenses
- Give practical recommendations for improving their business
- Explain financial concepts in simple terms

Context about M-Pesa:
- M-Pesa is Kenya's leading mobile money platform
- Common transaction types: Paybill (business payments), Till (retail), Send Money (P2P)
- Business owners use it for receiving payments, paying suppliers, and managing cash flow

Always be helpful, concise, and focus on actionable advice. Use Kenyan context where relevant.`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { messages, statementId } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build context from statement if provided
    let contextPrompt = ''

    if (statementId) {
      const statement = await prisma.statement.findFirst({
        where: {
          id: statementId,
          userId: session.user.id,
        },
        include: {
          insight: true,
          transactions: {
            take: 50,
            orderBy: { date: 'desc' },
          },
        },
      })

      if (statement?.insight) {
        contextPrompt = `
Here is the context about the user's business based on their M-Pesa statement analysis:

Statement Period: ${statement.periodStart ? new Date(statement.periodStart).toLocaleDateString() : 'Unknown'} to ${statement.periodEnd ? new Date(statement.periodEnd).toLocaleDateString() : 'Unknown'}

Financial Summary:
- Total Revenue: KES ${statement.totalIn.toLocaleString()}
- Total Expenses: KES ${statement.totalOut.toLocaleString()}
- Net Cash Flow: KES ${statement.netFlow.toLocaleString()}
- Health Score: ${statement.insight.healthScore}/100

AI Summary: ${statement.insight.aiSummary}

Top Customers: ${JSON.stringify(statement.insight.topCustomers)}

Top Expenses: ${JSON.stringify(statement.insight.topExpenses)}

Peak Days: ${JSON.stringify(statement.insight.peakDays)}

Monthly Summary: ${JSON.stringify(statement.insight.monthlySummary)}

Recommendations: ${JSON.stringify(statement.insight.recommendations)}

Recent Transactions: ${JSON.stringify(statement.transactions.slice(0, 10).map(t => ({
  date: t.date,
  description: t.description,
  amount: t.amount,
  isIncoming: t.isIncoming,
  category: t.category,
})))}
`
      }
    }

    const result = streamText({
      model: groq(CHAT_MODEL),
      system: SYSTEM_PROMPT + (contextPrompt ? `\n\n${contextPrompt}` : ''),
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
