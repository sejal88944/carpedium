export const TEE_MOCKUP_SIZE = { width: 256, height: 266 } as const
export const TEE_VIEWBOX = TEE_MOCKUP_SIZE
export type TeeLayout = {
  scale: number
  left: number
  top: number
  width: number
  height: number
}

export function getTeeLayout(canvasW: number, canvasH: number): TeeLayout {
  const scale = Math.min(
    (canvasW * 0.62) / TEE_MOCKUP_SIZE.width,
    (canvasH * 0.78) / TEE_MOCKUP_SIZE.height,
  )
  const width = TEE_MOCKUP_SIZE.width * scale
  const height = TEE_MOCKUP_SIZE.height * scale
  const left = (canvasW - width) / 2
  const top = (canvasH - height) / 2 - 6
  return { scale, left, top, width, height }
}

/** Chest print zone on the photo mockup */
export function getPrintArea(layout: TeeLayout) {
  return {
    left: layout.left + layout.width * 0.2,
    top: layout.top + layout.height * 0.24,
    width: layout.width * 0.6,
    height: layout.height * 0.36,
  }
}

export function getTeeBounds(layout: TeeLayout) {
  return {
    left: layout.left + layout.width * 0.06,
    top: layout.top + layout.height * 0.1,
    width: layout.width * 0.88,
    height: layout.height * 0.86,
  }
}

export function darkenHex(hex: string, amount = 0.22): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = Math.max(0, Math.round(parseInt(full.slice(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(full.slice(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(full.slice(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function isDarkTeeHex(hex: string) {
  const clean = hex.replace('#', '')
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
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45
}
