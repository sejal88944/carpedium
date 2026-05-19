'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TEE_COLORS } from '@/data/brand'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'

export function ColorShowcase() {
  const [active, setActive] = useState(0)
  const color = TEE_COLORS[active]

  return (
    <section className="py-20 md:py-28">
      <motion.div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">12 Premium Tee Colors</h2>
          <p className="mt-3 text-slate-600 dark:text-zinc-400">
            Professional sample prints — customize with your brand on any color
          </p>
        </div>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <PlainTeeMockup
            fill={color.hex}
            text=""
            textColor={color.textColor}
            size="lg"
            className="mx-auto rounded-3xl"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Tee Color</p>
            <p className="mt-2 font-display text-3xl font-bold">{color.name}</p>
            <p className="mt-3 text-slate-600 dark:text-zinc-400">
              Premium combed cotton with HD print surface — ready for your custom logo, text or
              design in our live customizer.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TEE_COLORS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(i)}
                  title={c.name}
                  className={`h-10 w-10 rounded-full border-2 transition ${
                    active === i ? 'border-brand scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <Link
              href={`/design?color=${color.id}`}
              className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
            >
              Customize this color
            </Link>
          </div>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {TEE_COLORS.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setActive(i)}
              className="glass glass-hover overflow-hidden rounded-2xl text-left"
            >
              <PlainTeeMockup fill={c.hex} size="sm" className="w-full" />
              <div className="p-3">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-slate-500">Customize this color</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
