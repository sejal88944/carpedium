import { isDarkTeeHex } from '@/lib/teeShape'

export const TEE_MOCKUP_SRC = '/mockups/tee-front-base.png'
export { TEE_MOCKUP_SIZE } from '@/lib/teeShape'
let baseImage: HTMLImageElement | null = null
/** Keys: `front:${hex}` tinted PNG, `back:${hex}` horizontally flipped from front */
const tintCache = new Map<string, string>()

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function loadTeeBaseImage(): Promise<HTMLImageElement> {
  if (baseImage) return Promise.resolve(baseImage)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      baseImage = img
      resolve(img)
    }
    img.onerror = () => reject(new Error('tee_mockup_load_failed'))
    img.src = TEE_MOCKUP_SRC
  })
}

function flipDataUrlHorizontally(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => {
      const c = document.createElement('canvas')
      c.width = im.width
      c.height = im.height
      const x = c.getContext('2d')
      if (!x) {
        reject(new Error('canvas_failed'))
        return
      }
      x.translate(c.width, 0)
      x.scale(-1, 1)
      x.drawImage(im, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    im.onerror = () => reject(new Error('tee_flip_failed'))
    im.src = dataUrl
  })
}

/** Recolor realistic mockup; `back` mirrors the front asset (no separate PNG). */
export async function tintTeeMockup(hex: string, side: 'front' | 'back' = 'front'): Promise<string> {
  const cacheKey = `${side}:${hex}`
  const cached = tintCache.get(cacheKey)
  if (cached) return cached

  const img = await loadTeeBaseImage()
  const { r: tr, g: tg, b: tb } = hexToRgb(hex)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas_failed')

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const lift = isDarkTeeHex(hex) ? 1.02 : 1.14

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // White background → transparent
    if (r > 238 && g > 238 && b > 238) {
      data[i + 3] = 0
      continue
    }

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const shade = Math.pow(Math.min(1, lum * lift), 0.88)
    data[i] = Math.min(255, Math.round(tr * shade))
    data[i + 1] = Math.min(255, Math.round(tg * shade))
    data[i + 2] = Math.min(255, Math.round(tb * shade))
    data[i + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)
  let url = canvas.toDataURL('image/png')
  tintCache.set(`front:${hex}`, url)

  if (side === 'back') {
    url = await flipDataUrlHorizontally(url)
    tintCache.set(cacheKey, url)
    return url
  }

  tintCache.set(cacheKey, url)
  return url
}
