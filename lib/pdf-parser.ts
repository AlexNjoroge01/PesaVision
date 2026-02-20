import { RawTransaction } from '@/types'

interface ParseResult {
  transactions: RawTransaction[]
  periodStart: Date | null
  periodEnd: Date | null
  accountHolder: string | null
}

// Keywords to identify incoming vs outgoing transactions
const INCOMING_KEYWORDS = [
  'received',
  'paid to you',
  'deposit',
  'reversal',
  'refund',
  'funds received',
  'from',
  'incoming',
]

const OUTGOING_KEYWORDS = [
  'sent',
  'payment to',
  'withdraw',
  'airtime',
  'buy goods',
  'pay bill',
  'till',
  'transfer',
  'outgoing',
  'purchase',
]

/**
 * Parse an M-Pesa statement PDF buffer
 */
export async function parseMpesaStatement(buffer: Buffer): Promise<ParseResult> {
  console.log('[PDF-PARSER] Starting PDF parsing, buffer size:', buffer.length)
  try {
    // Extract raw text from PDF
    // Use dynamic require to avoid the test file import issue on Windows
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js')
    console.log('[PDF-PARSER] Calling pdfParse...')
    const data = await pdfParse(buffer)
    console.log('[PDF-PARSER] pdfParse complete, text length:', data.text?.length || 0)
    console.log('[PDF-PARSER] Raw text sample (first 1000 chars):', data.text?.substring(0, 1000))
    console.log('[PDF-PARSER] Raw text sample (last 500 chars):', data.text?.substring(data.text.length - 500))
    const text = data.text

    // Extract statement period
    console.log('[PDF-PARSER] Extracting statement period')
    const periodResult = extractStatementPeriod(text)

    // Extract account holder name
    console.log('[PDF-PARSER] Extracting account holder')
    const accountHolder = extractAccountHolder(text)

    // Extract transactions
    console.log('[PDF-PARSER] Extracting transactions')
    const transactions = extractTransactions(text)
    console.log('[PDF-PARSER] Found', transactions.length, 'transactions')

    if (transactions.length === 0) {
      console.error('[PDF-PARSER] No transactions found in PDF')
      throw new Error('No transactions found in the PDF statement')
    }

    console.log('[PDF-PARSER] Parsing complete successfully')
    return {
      transactions,
      periodStart: periodResult.start,
      periodEnd: periodResult.end,
      accountHolder,
    }
  } catch (error) {
    console.error('[PDF-PARSER] Error parsing M-Pesa statement:', error)
    throw new Error(
      `Failed to parse M-Pesa statement: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Extract statement period from text
 */
function extractStatementPeriod(text: string): { start: Date | null; end: Date | null } {
  // Try different patterns for statement period
  const patterns = [
    // Format: 01st Feb 2026 - 07th Feb 2026
    /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[-–]\s*(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
    /Statement\s*Period\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*to\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /Period\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–]\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /From\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*To\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]

  // Try the new format first (01st Feb 2026 - 07th Feb 2026)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const match = text.match(patterns[0])
  if (match) {
    const startDay = parseInt(match[1], 10)
    const startMonth = monthNames.findIndex(m => m.toLowerCase() === match[2].toLowerCase())
    const startYear = parseInt(match[3], 10)
    const endDay = parseInt(match[4], 10)
    const endMonth = monthNames.findIndex(m => m.toLowerCase() === match[5].toLowerCase())
    const endYear = parseInt(match[6], 10)

    return {
      start: startMonth >= 0 ? new Date(startYear, startMonth, startDay) : null,
      end: endMonth >= 0 ? new Date(endYear, endMonth, endDay) : null,
    }
  }

  // Try other patterns
  for (let i = 1; i < patterns.length; i++) {
    const match = text.match(patterns[i])
    if (match) {
      return {
        start: parseDate(match[1]),
        end: parseDate(match[2]),
      }
    }
  }

  return { start: null, end: null }
}

/**
 * Extract account holder name from text
 */
function extractAccountHolder(text: string): string | null {
  const patterns = [
    /Account\s*Name\s*:\s*([A-Za-z\s]+)/i,
    /Customer\s*Name\s*:\s*([A-Za-z\s]+)/i,
    /Name\s*:\s*([A-Za-z\s]+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return null
}

/**
 * Extract transactions from text
 */
function extractTransactions(text: string): RawTransaction[] {
  const transactions: RawTransaction[] = []

  // Pattern for M-Pesa transaction lines (new format)
  // Format: ReceiptNo + YYYY-MM-DD HH:MM:SS + Description + COMPLETED + PaidIn + Withdrawn + Balance
  // Numbers are concatenated without spaces: COMPLETED0.00330.009.06 means 0.00, 330.00, 9.06
  // All amounts have exactly 2 decimal places
  const transactionPattern =
    /([A-Z0-9]{10,12})(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})([\s\S]*?)COMPLETED(\d+\.\d{2})(\d+\.\d{2})(\d+\.\d{2})/g

  let match
  while ((match = transactionPattern.exec(text)) !== null) {
    const reference = match[1]
    const dateTimeStr = match[2]
    const description = match[3].trim().replace(/\s+/g, ' ')
    const paidInStr = match[4].replace(/,/g, '')
    const withdrawnStr = match[5].replace(/,/g, '')
    const balanceStr = match[6].replace(/,/g, '')

    const paidIn = parseFloat(paidInStr) || 0
    const withdrawn = parseFloat(withdrawnStr) || 0
    const balance = parseFloat(balanceStr)
    const amount = paidIn > 0 ? paidIn : withdrawn
    const isIncoming = paidIn > 0

    if (amount === 0) continue

    const date = parseIsoDateTime(dateTimeStr)
    const counterparty = extractCounterparty(description, isIncoming)

    transactions.push({
      date,
      description,
      amount,
      balance: isNaN(balance) ? null : balance,
      isIncoming,
      reference,
      counterparty,
    })
  }

  // If no transactions found with the main pattern, try alternative patterns
  if (transactions.length === 0) {
    return extractTransactionsAlternative(text)
  }

  return transactions
}

/**
 * Alternative transaction extraction for different M-Pesa statement formats
 */
function extractTransactionsAlternative(text: string): RawTransaction[] {
  const transactions: RawTransaction[] = []

  // Split text into lines and process each line
  const lines = text.split('\n')

  for (const line of lines) {
    // Try to find lines that look like transactions
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)
    if (!dateMatch) continue

    // Look for amount patterns
    const amountMatch = line.match(/([\d,]+\.?\d*)\s*$/)
    if (!amountMatch) continue

    const dateStr = dateMatch[1]
    const amountStr = amountMatch[1].replace(/,/g, '')
    const amount = parseFloat(amountStr)

    if (isNaN(amount) || amount === 0) continue

    const date = parseDate(dateStr)
    if (!date) continue // Skip if date is invalid

    const description = line
      .replace(dateMatch[0], '')
      .replace(amountMatch[0], '')
      .trim()

    const isIncoming = determineTransactionDirection(description)
    const reference = extractReference(description)
    const counterparty = extractCounterparty(description, isIncoming)

    transactions.push({
      date,
      description,
      amount,
      balance: null,
      isIncoming,
      reference,
      counterparty,
    })
  }

  return transactions
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)

  const date = new Date(year, month, day)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Parse ISO date and time string to Date object
 * Format: YYYY-MM-DD HH:MM:SS
 */
function parseIsoDateTime(dateTimeStr: string): Date {
  const [datePart, timePart] = dateTimeStr.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes, seconds)
}

/**
 * Parse date and time string to Date object
 */
function parseDateTime(dateStr: string, timeStr: string): Date {
  const dateParts = dateStr.split('/')
  const timeParts = timeStr.split(':')

  const day = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1
  const year = parseInt(dateParts[2], 10)
  const hours = parseInt(timeParts[0], 10)
  const minutes = parseInt(timeParts[1], 10)
  const seconds = parseInt(timeParts[2], 10)

  return new Date(year, month, day, hours, minutes, seconds)
}

/**
 * Determine if a transaction is incoming or outgoing based on description
 */
function determineTransactionDirection(description: string): boolean {
  const lowerDesc = description.toLowerCase()

  // Check for incoming keywords first
  for (const keyword of INCOMING_KEYWORDS) {
    if (lowerDesc.includes(keyword)) {
      return true
    }
  }

  // Check for outgoing keywords
  for (const keyword of OUTGOING_KEYWORDS) {
    if (lowerDesc.includes(keyword)) {
      return false
    }
  }

  // Default: check for common M-Pesa patterns
  // "From" usually indicates incoming
  if (lowerDesc.includes('from') && !lowerDesc.includes('transfer from')) {
    return true
  }

  // "To" usually indicates outgoing
  if (lowerDesc.includes('to') && !lowerDesc.includes('paid to you')) {
    return false
  }

  // If still unclear, check for amount sign indicators
  if (description.includes('CR') || description.includes('Credit')) {
    return true
  }
  if (description.includes('DR') || description.includes('Debit')) {
    return false
  }

  // Default to outgoing (more conservative)
  return false
}

/**
 * Extract reference number from description
 */
function extractReference(description: string): string | null {
  // M-Pesa references are typically alphanumeric, 8-12 characters
  const refPatterns = [
    /([A-Z0-9]{8,12})/i,
    /Ref[:\s]*([A-Z0-9]+)/i,
    /Reference[:\s]*([A-Z0-9]+)/i,
  ]

  for (const pattern of refPatterns) {
    const match = description.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Extract counterparty name from description
 */
function extractCounterparty(description: string, isIncoming: boolean): string | null {
  // Try to extract counterparty based on common patterns
  const patterns = [
    // "From John Doe" or "To Jane Smith"
    isIncoming
      ? /from\s+([A-Za-z\s]+?)(?:\s+\d|\s+Ref|\s*$)/i
      : /to\s+([A-Za-z\s]+?)(?:\s+\d|\s+Ref|\s*$)/i,
    // "Payment from Company Ltd"
    /payment\s+(?:from|to)\s+([A-Za-z\s]+?)(?:\s+\d|\s+Ref|\s*$)/i,
    // "Paybill 123456 - Company Name"
    /paybill\s+\d+\s*[-–]\s*([A-Za-z\s]+)/i,
    // "Till 123456 - Shop Name"
    /till\s+\d+\s*[-–]\s*([A-Za-z\s]+)/i,
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      const name = match[1].trim()
      // Filter out common non-name words
      if (name.length > 2 && !/^(M-Pesa|Safaricom|KPLC|KRA)$/i.test(name)) {
        return name
      }
    }
  }

  return null
}

/**
 * Determine transaction type from description
 */
export function determineTransactionType(description: string): string {
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes('paybill') || lowerDesc.includes('pay bill')) {
    return 'PAYBILL'
  }
  if (lowerDesc.includes('till') || lowerDesc.includes('buy goods')) {
    return 'TILL'
  }
  if (lowerDesc.includes('send money') || lowerDesc.includes('sent')) {
    return 'SEND_MONEY'
  }
  if (lowerDesc.includes('receive') || lowerDesc.includes('received')) {
    return 'RECEIVE_MONEY'
  }
  if (lowerDesc.includes('withdraw')) {
    return 'WITHDRAWAL'
  }
  if (lowerDesc.includes('deposit')) {
    return 'DEPOSIT'
  }
  if (lowerDesc.includes('airtime')) {
    return 'AIRTIME'
  }

  return 'OTHER'
}
