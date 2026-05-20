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
  transparentPng: string
  flatPrintPng: string
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
/** Long edge target before PDF embed (sharp text / logo / emoji). */
const PRINT_EXPORT_MIN_LONG_EDGE = 1800
const EXPORT_MULTIPLIER = 6

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

/** Union of all design objects (logo, text, emoji) on canvas. */
function unionObjectBounds(objects: FabricObject[], padding = 20): PrintRegion | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const o of objects) {
    o.setCoords()
    const r = o.getBoundingRect()
    if (!r.width || !r.height) continue
    minX = Math.min(minX, r.left)
    minY = Math.min(minY, r.top)
    maxX = Math.max(maxX, r.left + r.width)
    maxY = Math.max(maxY, r.top + r.height)
  }

  if (!Number.isFinite(minX)) return null

  return {
    left: minX - padding,
    top: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}

function intersectBounds(a: PrintRegion, b: PrintRegion): PrintRegion {
  const left = Math.max(a.left, b.left)
  const top = Math.max(a.top, b.top)
  const right = Math.min(a.left + a.width, b.left + b.width)
  const bottom = Math.min(a.top + a.height, b.top + b.height)
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  }
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
        const sx2 = Math.min(Math.max(0, sx), Math.max(0, capW - 1))
        const sy2 = Math.min(Math.max(0, sy), Math.max(0, capH - 1))
        const sw2 = Math.min(sw, capW - sx2)
        const sh2 = Math.min(sh, capH - sy2)
        const out = document.createElement('canvas')
        out.width = sw2
        out.height = sh2
        const ctx = out.getContext('2d')
        if (!ctx) return resolve({ dataUrl, widthPx: sw2, heightPx: sh2 })
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
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

/** Scale up so PDF page 2 shows large, sharp artwork. */
function upscaleForPrint(dataUrl: string, minLongEdge = PRINT_EXPORT_MIN_LONG_EDGE): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const iw = img.naturalWidth || img.width
        const ih = img.naturalHeight || img.height
        const long = Math.max(iw, ih)
        if (long >= minLongEdge) return resolve(dataUrl)
        const scale = minLongEdge / long
        const w = Math.max(1, Math.round(iw * scale))
        const h = Math.max(1, Math.round(ih * scale))
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d')
        if (!ctx) return resolve(dataUrl)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, w, h)
        resolve(c.toDataURL('image/png'))
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
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => resolve(pngDataUrl)
    img.src = pngDataUrl
  })
}

/**
 * Export logo + text + emoji — tight crop around objects, high resolution for PDF.
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

  const m = opts.multiplier ?? EXPORT_MULTIPLIER
  const visSnap: Array<{ o: FabricObject; vis: boolean }> = []
  const blendSnap: Array<{
    o: FabricObject
    gco: GlobalCompositeOperation
    opacity: number
  }> = []

  const userOnSide = canvas.getObjects().filter((o) => isUserDesignObject(o, opts.activeSide))
  if (userOnSide.length === 0) return null

  const rawBounds = unionObjectBounds(userOnSide, 24)
  const cropRegion = rawBounds
    ? intersectBounds(rawBounds, opts.printRegion)
    : opts.printRegion

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

  if (!transparentFull.startsWith('data:')) return null

  const transparentCrop = await cropDataUrl(transparentFull, cropRegion, m)
  const flatCrop = flatFull.startsWith('data:')
    ? await cropDataUrl(flatFull, cropRegion, m)
    : transparentCrop

  let transparentPng = await upscaleForPrint(transparentCrop.dataUrl)
  const flatPrintPng = await upscaleForPrint(flatCrop.dataUrl)
  const printSheetPng = await compositeOnBackground(transparentPng, '#ffffff')

  const trimmedImg = await new Promise<HTMLImageElement>((res) => {
    const im = new Image()
    im.onload = () => res(im)
    im.onerror = () => res(new Image())
    im.src = transparentPng
  })
  const tw = trimmedImg.naturalWidth || transparentCrop.widthPx
  const th = trimmedImg.naturalHeight || transparentCrop.heightPx

  const mmPerPx = CHEST_PRINT_WIDTH_MM / cropRegion.width
  const printWidthMm = Math.round(cropRegion.width * mmPerPx)
  const printHeightMm = Math.round(cropRegion.height * mmPerPx)

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

export function stashPrintArtworkForCartItem(cartItemId: string, dataUrl: string) {
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:')) return
  try {
    sessionStorage.setItem(`${PRINT_ARTWORK_SESSION_PREFIX}${cartItemId}`, dataUrl)
  } catch {
    /* quota */
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

/** PNG for cart — sharper than JPEG for signatures & emoji. */
export function compressArtworkForCartStorage(
  dataUrl: string,
  maxSide = 1400,
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:')) return resolve(dataUrl)
    const img = new Image()
    img.onload = () => {
      try {
        const iw = img.naturalWidth || img.width
        const ih = img.naturalHeight || img.height
        if (Math.max(iw, ih) <= maxSide) return resolve(dataUrl)
        const scale = maxSide / Math.max(iw, ih)
        const w = Math.max(1, Math.round(iw * scale))
        const h = Math.max(1, Math.round(ih * scale))
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d')
        if (!ctx) return resolve(dataUrl)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        resolve(c.toDataURL('image/png'))
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
