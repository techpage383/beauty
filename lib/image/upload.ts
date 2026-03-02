'use client'

const MAX_DIMENSION = 1600
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export class ImageValidationError extends Error {}

export async function processImage(file: File): Promise<Blob> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new ImageValidationError('画像は5MB以下にしてください')
  }
  if (!['image/jpeg', 'image/png', 'image/heic', 'image/webp'].includes(file.type)) {
    throw new ImageValidationError('対応形式: JPG / PNG / HEIC')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width  = Math.round(bitmap.width  * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('変換に失敗しました')),
      'image/webp',
      0.85
    )
  })
}

export async function processImages(files: FileList | File[]): Promise<Blob[]> {
  const arr = Array.from(files).slice(0, 5)
  return Promise.all(arr.map(processImage))
}

export function getPublicUrl(supabaseUrl: string, storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${storagePath}`
}
