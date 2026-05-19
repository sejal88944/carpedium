/**
 * FREE image storage — Cloudinary Free Plan (25 credits/month).
 * Uses unsigned upload preset so the browser can upload directly without exposing API secret.
 * Falls back to local Object URL if Cloudinary not configured.
 */

export type UploadResult = {
  url: string
  publicId?: string
  width?: number
  height?: number
  isLocal?: boolean
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UNSIGNED_PRESET = 'aasha_unsigned'

export async function uploadImage(file: File): Promise<UploadResult> {
  if (!cloudName) {
    return { url: URL.createObjectURL(file), isLocal: true }
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UNSIGNED_PRESET)
  fd.append('folder', 'aasha-tees')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    return { url: URL.createObjectURL(file), isLocal: true }
  }
  const data = await res.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  }
}
