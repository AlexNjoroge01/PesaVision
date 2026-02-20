import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the report and verify ownership
    const report = await prisma.report.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        statement: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (!report.fileUrl) {
      return NextResponse.json({ error: 'Report file not available' }, { status: 404 })
    }

    // Determine content type and filename based on report type
    let contentType: string
    let extension: string

    switch (report.type) {
      case 'KRA_EXPORT':
        contentType = 'text/csv'
        extension = 'csv'
        break
      case 'MONTHLY_SUMMARY':
      case 'CASH_FLOW':
        contentType = 'application/pdf'
        extension = 'pdf'
        break
      default:
        contentType = 'application/octet-stream'
        extension = 'bin'
    }

    // Generate filename with proper extension
    const filename = `${report.type.toLowerCase().replace(/_/g, '-')}-${report.statement.id}.${extension}`

    // Fetch the file from Cloudinary with proper headers
    console.log(`Fetching report from: ${report.fileUrl}`)
    const response = await fetch(report.fileUrl, {
      headers: {
        'Accept': '*/*',
      },
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch from Cloudinary: ${response.status} ${response.statusText}`)
      console.error(`URL: ${report.fileUrl}`)
      return NextResponse.json({ error: 'Failed to fetch report file' }, { status: 500 })
    }

    // Get the file as ArrayBuffer and convert to Buffer for proper handling
    const arrayBuffer = await response.arrayBuffer()
    
    // Validate we got actual content
    if (arrayBuffer.byteLength === 0) {
      console.error('Empty file received from Cloudinary')
      return NextResponse.json({ error: 'Empty report file' }, { status: 500 })
    }
    
    console.log(`Downloaded file size: ${arrayBuffer.byteLength} bytes`)
    const fileBuffer = Buffer.from(arrayBuffer)

    // Validate PDF files have correct header
    if (extension === 'pdf') {
      const header = fileBuffer.subarray(0, 5).toString('ascii')
      if (header !== '%PDF-') {
        console.error(`Invalid PDF header: "${header}" (first 50 bytes: ${fileBuffer.subarray(0, 50).toString('utf-8')})`)
        return NextResponse.json({ error: 'The report file is corrupted. Please regenerate the report.' }, { status: 500 })
      }
    }

    // Return file with proper headers for download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error downloading report:', error)
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    )
  }
}
