import { NextRequest, NextResponse } from 'next/server'
import { analyzeStatement } from '@/lib/statement-analyzer'

/**
 * API endpoint for analyzing statements.
 * This endpoint is kept for backwards compatibility and manual triggers.
 * The /api/upload route now calls analyzeStatement() directly to avoid
 * authentication issues with Vercel deployment protection.
 */
export async function POST(request: NextRequest) {
  console.log('[ANALYZE API] Starting analysis request')
  try {
    const body = await request.json()
    const { statementId, fileBuffer } = body

    console.log('[ANALYZE API] Request body - statementId:', statementId, 'fileBuffer length:', fileBuffer?.length)

    if (!statementId || !fileBuffer) {
      console.error('[ANALYZE API] Missing statementId or fileBuffer')
      return NextResponse.json(
        { error: 'Missing statementId or fileBuffer' },
        { status: 400 }
      )
    }

    // Decode base64 buffer
    console.log('[ANALYZE API] Decoding base64 buffer')
    const buffer = Buffer.from(fileBuffer, 'base64')
    console.log('[ANALYZE API] Buffer size:', buffer.length, 'bytes')

    // Call the shared analysis function
    const result = await analyzeStatement({
      statementId,
      fileBuffer: buffer,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Analysis failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      statementId: result.statementId,
      transactionCount: result.transactionCount,
      healthScore: result.healthScore,
    })
  } catch (error) {
    console.error('[ANALYZE API] Error:', error)
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
