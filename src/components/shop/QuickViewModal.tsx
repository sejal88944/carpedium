'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TEE_COLORS } from '@/data/brand'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'
import { useCart } from '@/store/useCart'
import { openWhatsAppOrder } from '@/lib/whatsappOrder'
import type { Product } from '@/types'

export function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useCart()
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL']
  const defaultSize = sizes.includes('M') ? 'M' : sizes[0]
  const [size, setSize] = useState<string>(defaultSize)
  const [colorIdx, setColorIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const color = TEE_COLORS[colorIdx]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] p-6 md:p-8"
      >
        <motion.div className="grid gap-8 md:grid-cols-2">
          {product.image ? (
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
              style={{ backgroundColor: product.surface || '#f4f4f4' }}
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <PlainTeeMockup fill={color.hex} />
          )}
          <motion.div>
            <button type="button" onClick={onClose} className="float-right text-xl" aria-label="Close">
              ✕
            </button>
            <h2 className="font-display text-2xl font-bold">{product.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{product.description}</p>
            <p className="mt-4 font-display text-3xl font-bold">₹{product.price}</p>

            {/* Size selector — REQUIRED before Add */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Select size <span className="text-rose-500">*</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[44px] rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                      size === s
                        ? 'border-brand bg-brand text-white shadow-glow'
                        : 'border-black/10 bg-white text-slate-700 hover:border-brand dark:border-white/15 dark:bg-void-3 dark:text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Color: <span className="text-slate-800 dark:text-zinc-200">{color.name}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEE_COLORS.slice(0, 8).map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    onClick={() => setColorIdx(i)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      colorIdx === i
                        ? 'scale-110 border-2 border-brand shadow-[0_0_0_1px_rgba(0,0,0,0.55),0_0_0_4px_rgba(14,165,233,0.2)]'
                        : 'border-black/65 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:scale-105 hover:border-black dark:border-white/55 dark:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.3)] dark:hover:border-white'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-2 dark:border-white/15 dark:bg-void-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Quantity
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full bg-black/5 text-lg font-bold dark:bg-white/10"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-sm font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-8 w-8 rounded-full bg-black/5 text-lg font-bold dark:bg-white/10"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <motion.div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/shop/${product.slug}`}
                className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
              >
                View Details
              </Link>
              <button
                type="button"
                onClick={() => {
                  const item = {
                    slug: product.slug,
                    title: product.title,
                    price: product.price,
                    qty,
                    size,
                    color: color.name,
                  }
                  add(item)
                  openWhatsAppOrder([item])
                  onClose()
                }}
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
              >
                Add to Cart
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
