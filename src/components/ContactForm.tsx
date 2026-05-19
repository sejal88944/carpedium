'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdminStore } from '@/store/useAdminStore'

const inputClass =
  'w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-white/10 dark:bg-void-3'

export function ContactForm() {
  const addMessage = useAdminStore((s) => s.addMessage)
  const upsertCustomer = useAdminStore((s) => s.upsertCustomer)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [body, setBody] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !body.trim()) return

    addMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      body: body.trim(),
    })

    upsertCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    })

    setSent(true)
    setName('')
    setEmail('')
    setPhone('')
    setBody('')
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className={inputClass}
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className={inputClass}
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (optional)"
        className={inputClass}
      />
      <textarea
        required
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Tell us about your project — quantity, design, delivery city..."
        className={inputClass}
      />
      <button
        type="submit"
        className="w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-700 py-3.5 text-sm font-bold text-white shadow-glow transition hover:scale-[1.01]"
      >
        Send message
      </button>
      <AnimatePresence>
        {sent ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          >
            Thank you! We will contact you within 24 hours.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
