'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginInner() {
  const params = useSearchParams()
  const from = params.get('from') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (!res || res.error) {
        setError(
          res?.error === 'CredentialsSignin'
            ? 'Wrong email or password.'
            : 'Login failed — please retry.',
        )
        setLoading(false)
        return
      }
      // First /admin compile in dev can take ~60s; keep the spinner running.
      window.location.href = from
    } catch {
      setError('Network error — please retry.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[40rem] w-[40rem] rounded-full bg-brand/30 blur-[160px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[40rem] w-[40rem] rounded-full bg-violet-600/25 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">Admin Login</p>
              <p className="text-xs text-slate-400">AASHA-SM Technologies Pvt. Ltd.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
            {/* Honeypot fields to throw off aggressive browser autofill */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="admin-login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="you@company.com"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  data-1p-ignore="true"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  name="admin-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  data-1p-ignore="true"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-slate-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Verifying & loading dashboard…' : 'Login to Admin'}
            </button>
            <p className="text-center text-[11px] text-slate-500">
              First load can take up to a minute in dev mode while the dashboard compiles.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginInner />
    </Suspense>
  )
}
