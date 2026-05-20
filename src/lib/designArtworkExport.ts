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

function isLightFill(fill: unknown): boolean {
  if (typeof fill !== 'string' || !fill.startsWith('#')) return false
  const clean = fill.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.72
}

function splitTrailingEmoji(text: string): { body: string; emoji: string } {
  const m = text.match(/^([\s\S]*?)(\p{Extended_Pictographic}+)$/u)
  if (m && m[1].trim().length > 0) return { body: m[1].trimEnd(), emoji: m[2] }
  return { body: text, emoji: '' }
}

function cropPieceFromFull(
  fullImg: HTMLImageElement,
  multiplier: number,
  left: number,
  top: number,
  width: number,
  height: number,
): Promise<{ img: HTMLImageElement; w: number; h: number } | null> {
  const sx = Math.round(left * multiplier)
  const sy = Math.round(top * multiplier)
  const sw = Math.max(1, Math.round(width * multiplier))
  const sh = Math.max(1, Math.round(height * multiplier))
  const piece = document.createElement('canvas')
  piece.width = sw
  piece.height = sh
  const pctx = piece.getContext('2d')
  if (!pctx) return Promise.resolve(null)
  pctx.drawImage(fullImg, sx, sy, sw, sh, 0, 0, sw, sh)
  return loadImage(piece.toDataURL('image/png')).then((loaded) => ({
    img: loaded,
    w: loaded.naturalWidth,
    h: loaded.naturalHeight,
  }))
}

function sortObjectsForPrintRow(objects: FabricObject[]): FabricObject[] {
  const images: FabricObject[] = []
  const texts: FabricObject[] = []
  for (const o of objects) {
    const meta = (o as UserObj).meta
    if (meta === 'print') images.push(o)
    else if (meta === 'user-text' || o.type === 'i-text' || o.type === 'text') texts.push(o)
    else images.push(o)
  }
  const byLeft = (a: FabricObject, b: FabricObject) => {
    a.setCoords()
    b.setCoords()
    return a.getBoundingRect().left - b.getBoundingRect().left
  }
  images.sort(byLeft)
  texts.sort(byLeft)
  return [...images, ...texts]
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('img_load_failed'))
    img.src = dataUrl
  })
}

/**
 * Page 2 print sheet: image · text · emoji in one horizontal row, vertically centred (like print banner).
 */
async function composePrintRowSection(
  fullDataUrl: string,
  objects: FabricObject[],
  multiplier: number,
): Promise<{ dataUrl: string; widthPx: number; heightPx: number } | null> {
  if (!fullDataUrl.startsWith('data:') || objects.length === 0) return null

  const fullImg = await loadImage(fullDataUrl)
  const gap = Math.round(40 * (multiplier / 4))
  const maxRowH = Math.round(380 * (multiplier / 4))
  const pad = Math.round(40 * (multiplier / 4))
  const raw: Array<{ img: HTMLImageElement; w: number; h: number }> = []

  for (const o of sortObjectsForPrintRow(objects)) {
    o.setCoords()
    const r = o.getBoundingRect()
    if (r.width < 2 || r.height < 2) continue

    const meta = (o as UserObj).meta
    const isText =
      meta === 'user-text' || o.type === 'i-text' || o.type === 'text' || o.type === 'textbox'
    const textContent =
      isText && typeof (o as { text?: string }).text === 'string'
        ? (o as { text: string }).text
        : ''

    if (isText && textContent) {
      const { body, emoji } = splitTrailingEmoji(textContent)
      if (emoji && body) {
        const emojiFrac = Math.min(0.32, 0.1 * emoji.length + 0.12)
        const emojiW = r.width * emojiFrac
        const textW = r.width - emojiW
        const textPiece = await cropPieceFromFull(
          fullImg,
          multiplier,
          r.left,
          r.top,
          textW,
          r.height,
        )
        const emojiPiece = await cropPieceFromFull(
          fullImg,
          multiplier,
          r.left + textW,
          r.top,
          emojiW,
          r.height,
        )
        if (textPiece) raw.push(textPiece)
        if (emojiPiece) raw.push(emojiPiece)
        continue
      }
    }

    const piece = await cropPieceFromFull(fullImg, multiplier, r.left, r.top, r.width, r.height)
    if (piece) raw.push(piece)
  }

  if (raw.length === 0) return null

  // Same row height for every piece — logo, text and emoji align on one line.
  let rowH = Math.max(...raw.map((p) => p.h))
  if (rowH > maxRowH) rowH = maxRowH

  const pieces = raw.map((p) => {
    const scale = rowH / p.h
    return {
      img: p.img,
      w: Math.max(1, Math.round(p.w * scale)),
      h: rowH,
    }
  })

  const rowW = pieces.reduce((s, p, i) => s + p.w + (i ? gap : 0), 0)
  const outW = rowW + pad * 2
  const outH = rowH + pad * 2

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH
  const ctx = out.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.strokeRect(1.5, 1.5, outW - 3, outH - 3)
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 0.75
  ctx.strokeRect(4, 4, outW - 8, outH - 8)

  let x = pad
  const midY = outH / 2
  for (const p of pieces) {
    const y = midY - p.h / 2
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(p.img, x, y, p.w, p.h)
    x += p.w + gap
  }

  const dataUrl = out.toDataURL('image/png')
  return { dataUrl, widthPx: outW, heightPx: outH }
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
    fill?: unknown
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
    const prevFill = (o as { fill?: unknown }).fill
    blendSnap.push({
      o,
      gco: (o.globalCompositeOperation as GlobalCompositeOperation) || 'source-over',
      opacity: typeof o.opacity === 'number' ? o.opacity : 1,
      fill: prevFill,
    })
    o.set({ globalCompositeOperation: 'source-over', opacity: 1 })
    if (meta === 'user-text' && isLightFill(prevFill)) {
      o.set({ fill: '#0f172a' })
    }
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

  blendSnap.forEach(({ o, gco, opacity, fill }) => {
    const patch: { globalCompositeOperation: GlobalCompositeOperation; opacity: number; fill?: unknown } = {
      globalCompositeOperation: gco,
      opacity,
    }
    if (fill !== undefined) patch.fill = fill
    o.set(patch)
  })
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

  const rowSection = await composePrintRowSection(transparentFull, userOnSide, m)
  let printSheetPng = rowSection
    ? await upscaleForPrint(rowSection.dataUrl)
    : await compositeOnBackground(transparentPng, '#ffffff')

  const sheetImg = await loadImage(printSheetPng).catch(() => null)
  const tw = sheetImg?.naturalWidth || rowSection?.widthPx || transparentCrop.widthPx
  const th = sheetImg?.naturalHeight || rowSection?.heightPx || transparentCrop.heightPx

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
    aspectRatio:
      rowSection && rowSection.widthPx > 0
        ? rowSection.widthPx / rowSection.heightPx
        : tw / Math.max(1, th),
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
