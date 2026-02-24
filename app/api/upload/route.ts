import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadPdf } from '@/lib/cloudinary'
import { canUploadStatement } from '@/lib/plan-guard'
import { analyzeStatement } from '@/lib/statement-analyzer'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check plan limits
    const uploadCheck = await canUploadStatement(session.user.id)
    if (!uploadCheck.allowed) {
      return NextResponse.json(
        { error: uploadCheck.reason, currentCount: uploadCheck.currentCount, limit: uploadCheck.limit },
        { status: 403 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are accepted.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await uploadPdf(buffer, session.user.id, file.name)

    // Create statement record
    const statement = await prisma.statement.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: uploadResult.secureUrl,
        status: 'PENDING',
      },
    })

    // Trigger analysis in background (fire-and-forget)
    // Call the analysis function directly instead of making an HTTP request
    // This avoids authentication issues with Vercel deployment protection
    console.log('[UPLOAD] Triggering analysis for statement:', statement.id)

    analyzeStatement({
      statementId: statement.id,
      fileBuffer: buffer,
    }).then((result) => {
      console.log('[UPLOAD] Analysis result:', result)
    }).catch((error) => {
      console.error('[UPLOAD] Failed to analyze statement:', error)
    })

    return NextResponse.json({
      statementId: statement.id,
      status: statement.status,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    )
  }
}
