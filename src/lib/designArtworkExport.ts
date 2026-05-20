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
  /** Transparent PNG — user artwork only (no mockup). */
  transparentPng: string
  /** Same region with tee tint behind artwork (PDF / preview). */
  flatPrintPng: string
  widthPx: number
  heightPx: number
  printWidthMm: number
  printHeightMm: number
  aspectRatio: number
  designJson: DesignLayerJson
}

const CHEST_PRINT_WIDTH_MM = 300

type UserObj = FabricObject & { meta?: string; printSide?: 'front' | 'back' }

function isHelper(meta?: string) {
  return meta === '__tee' || meta === '__grid' || meta === 'label'
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

/**
 * Export only the customer's design layer from Fabric (logo + text combined as placed).
 * Uses transparent background for print-shop extraction.
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
  const snapshot: Array<{ o: FabricObject; vis: boolean }> = []

  canvas.getObjects().forEach((o) => {
    const meta = (o as UserObj).meta
    if (isHelper(meta)) {
      snapshot.push({ o, vis: o.visible })
      o.set('visible', false)
      return
    }
    const ps = (o as UserObj).printSide
    if (ps && ps !== opts.activeSide) {
      snapshot.push({ o, vis: o.visible })
      o.set('visible', false)
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
  if (opts.teeColorHex) {
    canvas.backgroundColor = opts.teeColorHex
    canvas.requestRenderAll()
    try {
      flatFull = canvas.toDataURL({ format: 'png', multiplier: m })
    } catch {
      flatFull = transparentFull
    }
  }

  snapshot.forEach(({ o, vis }) => o.set('visible', vis))
  canvas.backgroundColor = prevBg
  canvas.requestRenderAll()

  if (!transparentFull.startsWith('data:')) return null

  const transparent = await cropDataUrl(transparentFull, opts.printRegion, m)
  const flat = flatFull.startsWith('data:')
    ? await cropDataUrl(flatFull, opts.printRegion, m)
    : transparent

  const mmPerPx = CHEST_PRINT_WIDTH_MM / opts.printRegion.width
  const printWidthMm = Math.round(opts.printRegion.width * mmPerPx)
  const printHeightMm = Math.round(opts.printRegion.height * mmPerPx)

  const userObjects = canvas.getObjects().filter((o) => {
    const meta = (o as UserObj).meta
    if (isHelper(meta)) return false
    const ps = (o as UserObj).printSide
    return !ps || ps === opts.activeSide
  })

  const objects: Array<Record<string, unknown>> = []
  for (const o of userObjects) {
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
    transparentPng: transparent.dataUrl,
    flatPrintPng: flat.dataUrl,
    widthPx: transparent.widthPx,
    heightPx: transparent.heightPx,
    printWidthMm,
    printHeightMm,
    aspectRatio: opts.printRegion.width / opts.printRegion.height,
    designJson,
  }
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
