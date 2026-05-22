'use client'

import { useEffect, type RefObject } from 'react'
import type { Canvas } from 'fabric'

const BASE_W = 560
const BASE_H = 700

/**
 * Fit Fabric canvas to its container width on phones/tablets without changing design coordinates.
 */
export function useDebouncedCanvasFit(
  wrapRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<Canvas | null>,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    let timer: ReturnType<typeof setTimeout>

    const fit = () => {
      const w = wrap.clientWidth
      if (w < 40) return
      const scale = Math.min(1, (w - 4) / BASE_W)
      canvas.setDimensions({ width: BASE_W, height: BASE_H }, { backstoreOnly: true })
      canvas.setDimensions({ width: BASE_W * scale, height: BASE_H * scale })
      canvas.setZoom(scale)
      canvas.calcOffset()
      canvas.requestRenderAll()
    }

    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(fit, 100)
    }

    const ro = new ResizeObserver(schedule)
    ro.observe(wrap)
    schedule()
    window.addEventListener('orientationchange', schedule)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
      window.removeEventListener('orientationchange', schedule)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
