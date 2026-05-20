import type { Canvas, FabricObject } from 'fabric'

export type PrintRegion = { left: number; top: number; width: number; height: number }

export type DesignLayerJson = {
  version: 1
  exportedAt: string
  side: 'front' | 'back'
  canvas: { width: number; height: number }
  printArea: PrintRegion
  teeColorHex?: string
  objects: Array<Record<string, unknown>>
}

export type ArtworkExportResult = {
  /** Transparent PNG — artwork only. */
  transparentPng: string
  /** Tee-colour fill behind artwork (same crop). */
  flatPrintPng: string
  /** White background — clearest for PDF page 2 & office printers. */
  printSheetPng: string
  widthPx: number
  heightPx: number
  printWidthMm: number
  printHeightMm: number
  aspectRatio: number
  designJson: DesignLayerJson
  hasArtwork: boolean
}

const CHEST_PRINT_WIDTH_MM = 300

type UserObj = FabricObject & { meta?: string; printSide?: 'front' | 'back' }

function isHelper(meta?: string) {
  return meta === '__tee' || meta === '__grid' || meta === 'label'
}

function isUserDesignObject(o: FabricObject, activeSide: 'front' | 'back') {
  const meta = (o as UserObj).meta
  if (isHelper(meta)) return false
  const ps = (o as UserObj).printSide
  return !ps || ps === activeSide
}

function cropDataUrl(
  dataUrl: string,
  region: PrintRegion,
  multiplier: number,
): Promise<{ dataUrl: string; widthPx: number; heightPx: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const sx = Math.round(region.left * multiplier)
        const sy = Math.round(region.top * multiplier)
        const sw = Math.max(1, Math.round(region.width * multiplier))
        const sh = Math.max(1, Math.round(region.height * multiplier))
        const capW = img.naturalWidth || img.width
        const capH = img.naturalHeight || img.height
        const sx2 = Math.min(sx, Math.max(0, capW - 1))
        const sy2 = Math.min(sy, Math.max(0, capH - 1))
        const sw2 = Math.min(sw, capW - sx2)
        const sh2 = Math.min(sh, capH - sy2)
        const out = document.createElement('canvas')
        out.width = sw2
        out.height = sh2
        const ctx = out.getContext('2d')
        if (!ctx) return resolve({ dataUrl, widthPx: sw2, heightPx: sh2 })
        ctx.drawImage(img, sx2, sy2, sw2, sh2, 0, 0, sw2, sh2)
        resolve({ dataUrl: out.toDataURL('image/png'), widthPx: sw2, heightPx: sh2 })
      } catch {
        resolve({ dataUrl, widthPx: 0, heightPx: 0 })
      }
    }
    img.onerror = () => resolve({ dataUrl, widthPx: 0, heightPx: 0 })
    img.src = dataUrl
  })
}

/** Crop to pixels that have visible ink — design fills page 2 larger & clearer. */
function trimToContentBounds(dataUrl: string, paddingPx = 12): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width
        const h = img.naturalHeight || img.height
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return resolve(dataUrl)
        ctx.drawImage(img, 0, 0)
        const { data } = ctx.getImageData(0, 0, w, h)
        let minX = w
        let minY = h
        let maxX = 0
        let maxY = 0
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const a = data[(y * w + x) * 4 + 3]
            if (a > 12) {
              if (x < minX) minX = x
              if (y < minY) minY = y
              if (x > maxX) maxX = x
              if (y > maxY) maxY = y
            }
          }
        }
        if (maxX <= minX || maxY <= minY) return resolve(dataUrl)
        const pad = paddingPx
        minX = Math.max(0, minX - pad)
        minY = Math.max(0, minY - pad)
        maxX = Math.min(w - 1, maxX + pad)
        maxY = Math.min(h - 1, maxY + pad)
        const tw = maxX - minX + 1
        const th = maxY - minY + 1
        const out = document.createElement('canvas')
        out.width = tw
        out.height = th
        const octx = out.getContext('2d')
        if (!octx) return resolve(dataUrl)
        octx.drawImage(c, minX, minY, tw, th, 0, 0, tw, th)
        resolve(out.toDataURL('image/png'))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function compositeOnBackground(pngDataUrl: string, bgHex: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return resolve(pngDataUrl)
      ctx.fillStyle = bgHex
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => resolve(pngDataUrl)
    img.src = pngDataUrl
  })
}

/**
 * Export logo + text + emoji exactly as placed on the tee (no mockup).
 * Resets blend modes so PDF/PNG match what the user sees.
 */
export async function exportArtworkFromFabric(
  canvas: Canvas,
  opts: {
    printRegion: PrintRegion
    activeSide: 'front' | 'back'
    teeColorHex?: string
    canvasWidth: number
    canvasHeight: number
    multiplier?: number
  },
): Promise<ArtworkExportResult | null> {
  if (typeof document === 'undefined') return null

  const m = opts.multiplier ?? 4
  const visSnap: Array<{ o: FabricObject; vis: boolean }> = []
  const blendSnap: Array<{
    o: FabricObject
    gco: GlobalCompositeOperation
    opacity: number
  }> = []

  const userOnSide = canvas.getObjects().filter((o) => isUserDesignObject(o, opts.activeSide))
  const hasArtwork = userOnSide.length > 0

  canvas.getObjects().forEach((o) => {
    const meta = (o as UserObj).meta
    if (isHelper(meta)) {
      visSnap.push({ o, vis: o.visible })
      o.set('visible', false)
      return
    }
    if (!isUserDesignObject(o, opts.activeSide)) {
      visSnap.push({ o, vis: o.visible })
      o.set('visible', false)
      return
    }
    blendSnap.push({
      o,
      gco: (o.globalCompositeOperation as GlobalCompositeOperation) || 'source-over',
      opacity: typeof o.opacity === 'number' ? o.opacity : 1,
    })
    o.set({ globalCompositeOperation: 'source-over', opacity: 1 })
  })

  const prevBg = canvas.backgroundColor ?? 'transparent'
  canvas.backgroundColor = 'transparent'
  canvas.requestRenderAll()

  let transparentFull = ''
  try {
    transparentFull = canvas.toDataURL({ format: 'png', multiplier: m })
  } catch {
    transparentFull = ''
  }

  let flatFull = transparentFull
  if (opts.teeColorHex && transparentFull.startsWith('data:')) {
    canvas.backgroundColor = opts.teeColorHex
    canvas.requestRenderAll()
    try {
      flatFull = canvas.toDataURL({ format: 'png', multiplier: m })
    } catch {
      flatFull = transparentFull
    }
  }

  blendSnap.forEach(({ o, gco, opacity }) => o.set({ globalCompositeOperation: gco, opacity }))
  visSnap.forEach(({ o, vis }) => o.set('visible', vis))
  canvas.backgroundColor = prevBg
  canvas.requestRenderAll()

  if (!transparentFull.startsWith('data:') || !hasArtwork) return null

  const transparentCrop = await cropDataUrl(transparentFull, opts.printRegion, m)
  const flatCrop = flatFull.startsWith('data:')
    ? await cropDataUrl(flatFull, opts.printRegion, m)
    : transparentCrop

  let transparentPng = await trimToContentBounds(transparentCrop.dataUrl, 16)
  const flatPrintPng = await trimToContentBounds(flatCrop.dataUrl, 16)
  const printSheetPng = await compositeOnBackground(transparentPng, '#ffffff')

  const trimmedImg = await new Promise<HTMLImageElement>((res) => {
    const im = new Image()
    im.onload = () => res(im)
    im.onerror = () => res(new Image())
    im.src = transparentPng
  })
  const tw = trimmedImg.naturalWidth || transparentCrop.widthPx
  const th = trimmedImg.naturalHeight || transparentCrop.heightPx

  const mmPerPx = CHEST_PRINT_WIDTH_MM / opts.printRegion.width
  const printWidthMm = Math.round(opts.printRegion.width * mmPerPx)
  const printHeightMm = Math.round(opts.printRegion.height * mmPerPx)

  const objects: Array<Record<string, unknown>> = []
  for (const o of userOnSide) {
    try {
      objects.push(
        typeof o.toObject === 'function'
          ? (o.toObject() as Record<string, unknown>)
          : { type: o.type },
      )
    } catch {
      objects.push({ type: o.type })
    }
  }

  const designJson: DesignLayerJson = {
    version: 1,
    exportedAt: new Date().toISOString(),
    side: opts.activeSide,
    canvas: { width: opts.canvasWidth, height: opts.canvasHeight },
    printArea: opts.printRegion,
    teeColorHex: opts.teeColorHex,
    objects,
  }

  return {
    transparentPng,
    flatPrintPng,
    printSheetPng,
    widthPx: tw,
    heightPx: th,
    printWidthMm,
    printHeightMm,
    aspectRatio: tw / Math.max(1, th),
    designJson,
    hasArtwork: true,
  }
}

const PRINT_ARTWORK_SESSION_PREFIX = 'aasha-print-artwork:'

/** Full-quality artwork for cart PDF (same browser session). */
export function stashPrintArtworkForCartItem(cartItemId: string, dataUrl: string) {
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:')) return
  try {
    sessionStorage.setItem(`${PRINT_ARTWORK_SESSION_PREFIX}${cartItemId}`, dataUrl)
  } catch {
    /* quota — cart item may still carry compressed printArtwork */
  }
}

export function readPrintArtworkForCartItem(cartItemId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const s = sessionStorage.getItem(`${PRINT_ARTWORK_SESSION_PREFIX}${cartItemId}`)
    return s?.startsWith('data:') ? s : null
  } catch {
    return null
  }
}

/** JPEG downscale for cart localStorage (keeps print readable in PDF page 2). */
export function compressArtworkForCartStorage(
  dataUrl: string,
  maxSide = 900,
  quality = 0.88,
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:')) return resolve(dataUrl)
    const img = new Image()
    img.onload = () => {
      try {
        const iw = img.naturalWidth || img.width
        const ih = img.naturalHeight || img.height
        const scale = Math.min(1, maxSide / Math.max(iw, ih))
        const w = Math.max(1, Math.round(iw * scale))
        const h = Math.max(1, Math.round(ih * scale))
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d')
        if (!ctx) return resolve(dataUrl)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        resolve(c.toDataURL('image/jpeg', quality))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  if (typeof document === 'undefined') return
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  downloadDataUrl(url, filename)
  URL.revokeObjectURL(url)
}
