import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  publicId: string
  url: string
  secureUrl: string
  bytes: number
  format: string
  resourceType: string
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string
    filename?: string
    resourceType?: 'image' | 'video' | 'raw' | 'auto'
  }
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // For raw files, strip the extension from public_id since Cloudinary
    // appends the format automatically for raw resources
    let publicId = options.filename
    if (publicId && options.resourceType === 'raw') {
      // Remove extension from public_id to avoid double extensions
      publicId = publicId.replace(/\.[^.]+$/, '')
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: publicId,
        resource_type: options.resourceType || 'auto',
        // For raw files, don't use filename options as they can interfere with extensions
        use_filename: options.resourceType === 'raw' ? false : true,
        unique_filename: options.resourceType === 'raw' ? false : true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'))
          return
        }
        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type,
        })
      }
    )
    uploadStream.end(buffer)
  })
}

/**
 * Upload a PDF file to Cloudinary
 */
export async function uploadPdf(
  buffer: Buffer,
  userId: string,
  filename?: string
): Promise<UploadResult> {
  return uploadToCloudinary(buffer, {
    folder: `mpesa-statements/${userId}`,
    filename: filename?.replace('.pdf', ''),
    resourceType: 'raw',
  })
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    })
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

/**
 * Generate a signed URL for secure file access
 */
export function generateSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    resource_type: 'raw',
  })
}

export { cloudinary }
