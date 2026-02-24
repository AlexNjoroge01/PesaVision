import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canAccessWhatsAppBot } from '@/lib/plan-guard'
import { parseMpesaStatement, determineTransactionType } from '@/lib/pdf-parser'
import { analyzeTransactions, calculateTransactionStats } from '@/lib/mpesa-analyzer'
import type { TransactionType, Category } from '@/types'

// Twilio WhatsApp webhook handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string
    const numMedia = parseInt(formData.get('NumMedia') as string || '0', 10)

    // Extract phone number from WhatsApp format
    const phone = from?.replace('whatsapp:', '')

    if (!phone) {
      return new Response('Missing phone number', { status: 400 })
    }

    // Find user by phone
    const user = await prisma.user.findFirst({
      where: { phone },
    })

    if (!user) {
      return sendWhatsAppResponse(
        phone,
        'Welcome to M-Pesa Analytics! To use this WhatsApp bot, please create an account at our website and add this phone number to your profile.'
      )
    }

    // Check WhatsApp bot access
    const accessCheck = await canAccessWhatsAppBot(user.id)
    if (!accessCheck.allowed) {
      return sendWhatsAppResponse(phone, accessCheck.reason || 'WhatsApp bot access denied.')
    }

    // Handle media (PDF) messages
    if (numMedia > 0) {
      const mediaUrl = formData.get('MediaUrl0') as string
      const mediaType = formData.get('MediaContentType0') as string

      if (mediaType !== 'application/pdf') {
        return sendWhatsAppResponse(
          phone,
          'Please send a PDF file. Only M-Pesa statement PDFs are supported.'
        )
      }

      // Process PDF in background
      processWhatsAppPdf(user.id, mediaUrl, phone).catch((error) => {
        console.error('WhatsApp PDF processing error:', error)
        sendWhatsAppResponse(
          phone,
          'Sorry, there was an error processing your statement. Please try again later.'
        )
      })

      return sendWhatsAppResponse(
        phone,
        '📄 Received your M-Pesa statement! Analyzing your transactions... This may take a minute. I\'ll send you the results shortly.'
      )
    }

    // Handle text messages
    const message = body?.toLowerCase().trim()

    if (message === 'help' || message === 'hi' || message === 'hello') {
      return sendWhatsAppResponse(
        phone,
        `👋 Hello! I'm your M-Pesa Analytics assistant.

*What I can do:*
• Send me an M-Pesa statement PDF and I'll analyze it
• Get instant insights about your business

*How to use:*
1. Download your M-Pesa statement PDF
2. Send it to me here
3. Get your business analysis!

*Commands:*
• HELP - Show this message
• STATUS - Check your subscription status`
      )
    }

    if (message === 'status') {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      })

      return sendWhatsAppResponse(
        phone,
        `📊 *Your Subscription Status*

Plan: ${user.plan}
Status: ${subscription?.status || 'N/A'}
${subscription?.currentPeriodEnd ? `Expires: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : ''}

Upgrade at our website for more features!`
      )
    }

    // Default response
    return sendWhatsAppResponse(
      phone,
      `Send me an M-Pesa statement PDF to get started, or reply with HELP for more options.`
    )
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return new Response('Error processing message', { status: 500 })
  }
}

/**
 * Send a WhatsApp response via Twilio
 */
function sendWhatsAppResponse(to: string, message: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message from="whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}" to="whatsapp:${to}">${message}</Message>
</Response>`

  return new Response(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}

/**
 * Process PDF from WhatsApp
 */
async function processWhatsAppPdf(userId: string, mediaUrl: string, phone: string) {
  try {
    // Download PDF from Twilio media URL
    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download PDF from Twilio')
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const parseResult = await parseMpesaStatement(buffer)

    if (parseResult.transactions.length === 0) {
      return sendWhatsAppResponse(phone, 'No transactions found in the PDF. Please send a valid M-Pesa statement.')
    }

    // Analyze transactions
    const analysis = await analyzeTransactions(parseResult.transactions)
    const stats = calculateTransactionStats(parseResult.transactions)

    // Create statement record
    const statement = await prisma.statement.create({
      data: {
        userId,
        fileName: `whatsapp-${Date.now()}.pdf`,
        fileUrl: mediaUrl,
        status: 'DONE',
        totalIn: stats.totalIn,
        totalOut: stats.totalOut,
        netFlow: stats.netFlow,
        periodStart: parseResult.periodStart,
        periodEnd: parseResult.periodEnd,
      },
    })

    // Create insight record
    await prisma.insight.create({
      data: {
        statementId: statement.id,
        topCustomers: JSON.parse(JSON.stringify(analysis.topCustomers)),
        topExpenses: JSON.parse(JSON.stringify(analysis.topExpenses)),
        peakDays: JSON.parse(JSON.stringify(analysis.peakDays)),
        monthlySummary: JSON.parse(JSON.stringify(analysis.monthlySummary)),
        aiSummary: analysis.aiSummary,
        recommendations: JSON.parse(JSON.stringify(analysis.recommendations)),
        healthScore: analysis.healthScore,
      },
    })

    // Send analysis summary
    const summaryMessage = `📊 *Analysis Complete!*

💰 *Financial Summary*
• Revenue: KES ${stats.totalIn.toLocaleString()}
• Expenses: KES ${stats.totalOut.toLocaleString()}
• Net Flow: KES ${stats.netFlow.toLocaleString()}

📈 *Health Score: ${analysis.healthScore}/100*

${analysis.aiSummary}

*Top Recommendations:*
${analysis.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.title}`).join('\n')}

View full analysis on your dashboard!`

    return sendWhatsAppResponse(phone, summaryMessage)
  } catch (error) {
    console.error('PDF processing error:', error)
    return sendWhatsAppResponse(
      phone,
      'Sorry, there was an error analyzing your statement. Please make sure it\'s a valid M-Pesa PDF and try again.'
    )
  }
}
