'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { tintTeeMockup } from '@/lib/teeMockup'
import { TEE_MOCKUP_SIZE } from '@/lib/teeShape'

type Props = {
  fill: string
  text?: string
  textColor?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PlainTeeMockup({ fill, text = '', textColor = '#ffffff', className = '', size = 'md' }: Props) {
  const [mockupSrc, setMockupSrc] = useState<string | null>(null)
  const w = size === 'sm' ? 140 : size === 'lg' ? 280 : 200
  const h = Math.round(w * (TEE_MOCKUP_SIZE.height / TEE_MOCKUP_SIZE.width))
  const displayText = text.length > 16 ? `${text.slice(0, 14)}…` : text

  useEffect(() => {
    let active = true
    void tintTeeMockup(fill).then((url) => {
      if (active) setMockupSrc(url)
    })
    return () => {
      active = false
    }
  }, [fill])

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4 dark:from-zinc-900 dark:to-zinc-950 ${className}`}
    >
      {mockupSrc ? (
        <motion.div className="relative drop-shadow-2xl" style={{ width: w, height: h }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mockupSrc}
            alt=""
            width={w}
            height={h}
            className="h-full w-full object-contain"
          />
          {displayText ? (
            <span
              className="pointer-events-none absolute left-1/2 top-[38%] max-w-[58%] -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-bold leading-tight sm:text-[11px]"
              style={{ color: textColor }}
            >
              {displayText}
            </span>
          ) : null}
        </motion.div>
      ) : (
        <div
          className="animate-pulse rounded-2xl bg-slate-300/50 dark:bg-zinc-700/50"
          style={{ width: w, height: h }}
        />
      )}
    </motion.div>
  )
}
