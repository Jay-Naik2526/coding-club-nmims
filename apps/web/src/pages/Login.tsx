import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useApp } from '@/store/useApp'
import api from '@/lib/api'

const inputStyle = { borderColor: 'rgba(26,22,18,.3)' }

export function LoginPage() {
  const navigate = useNavigate()
  const { fetchUser } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/login', { email, password })
      await fetchUser()
      navigate('/profile')
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
      setError(message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--news-bg)', color: 'var(--news-ink)' }}>
      {/* masthead-style top bar */}
      <nav className="flex items-center justify-between border-b px-5 py-4 sm:px-10" style={{ borderColor: 'var(--news-ink)' }}>
        <Link to="/" className="font-[family-name:var(--font-display)] text-sm tracking-wide">
          CC<span style={{ color: 'var(--news-red)' }}>_</span>
        </Link>
        <Link to="/events" className="text-[10px] uppercase tracking-[0.18em] opacity-60 transition-opacity hover:opacity-100">
          ← Back to Events
        </Link>
      </nav>

      <section className="mx-auto max-w-lg px-5 py-12 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 text-center">
            <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
              § NMIMS Coding Club · Secure Access
            </div>
            <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.2rem,6vw,3.2rem)' }}>
              Member Login
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
              Sign in to access your profile, event registrations, and the online judge.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 border-t-2 pt-8" style={{ borderColor: 'var(--news-ink)' }}>
            <Field label="Email Address">
              <input
                id="cc-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]"
                style={inputStyle}
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  id="cc-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border bg-transparent px-3 py-2.5 pr-14 text-sm outline-none focus:border-[var(--news-red)]"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="border px-4 py-3 text-[11px] leading-relaxed"
                style={{ borderColor: 'var(--news-red)', color: 'var(--news-red)', background: 'rgba(200,0,42,.05)' }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cc-hover mt-2 w-full py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Authenticating…
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] leading-relaxed" style={{ color: 'rgba(26,22,18,.5)' }}>
            New here?{' '}
            <Link to="/signup" className="underline" style={{ color: 'var(--news-red)' }}>
              Create an account →
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
