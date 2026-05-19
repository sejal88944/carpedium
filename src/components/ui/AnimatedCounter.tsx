'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export function AnimatedCounter({
  value,
  suffix = '',
  label,
}: {
  value: number
  suffix?: string
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const isFloat = value % 1 !== 0
    const steps = 40
    let frame = 0
    const id = setInterval(() => {
      frame++
      const progress = frame / steps
      setCount(isFloat ? Math.min(value, value * progress) : Math.round(value * progress))
      if (frame >= steps) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [inView, value])

  const display = value % 1 !== 0 ? count.toFixed(1) : count

  return (
    <motion.div ref={ref} className="text-center">
      <p className="font-display text-4xl font-bold text-brand md:text-5xl">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-600 dark:text-zinc-400">{label}</p>
    </motion.div>
  )
}
