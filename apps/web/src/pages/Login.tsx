import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '@/store/useApp'
import api from '@/lib/api'

const ink = '#0b0a09'
const paper = '#f3efe5'

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
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Invalid credentials. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-5"
      style={{ background: ink, color: paper }}
    >
      {/* Animated mesh background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% 30%, rgba(120,60,255,0.10) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255,77,77,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 80% 80%, rgba(0,200,180,0.07) 0%, transparent 60%)',
        }}
      />
      {/* Subtle grid lines */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(243,239,229,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(243,239,229,.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(11,10,9,.7) 100%)',
        }}
      />

      {/* Back nav */}
      <nav className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-10">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-sm tracking-wide"
          style={{ color: paper }}
        >
          CC<span style={{ color: '#ff4d4d' }}>_</span>
        </Link>
        <Link
          to="/events"
          className="text-[10px] uppercase tracking-[0.18em] opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: paper }}
        >
          Events
        </Link>
      </nav>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow blob */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: '#ff4d4d' }}
        />

        <div
          className="relative rounded-2xl border p-8 sm:p-10"
          style={{
            borderColor: 'rgba(243,239,229,.12)',
            background: 'rgba(255,255,255,.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="mb-3 text-[9px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(243,239,229,.4)' }}
            >
              § NMIMS Coding Club · Secure Access
            </div>
            <h1
              className="font-[family-name:var(--font-display)] leading-[0.9]"
              style={{ fontSize: 'clamp(2rem,5vw,2.8rem)' }}
            >
              Member Login
            </h1>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: 'rgba(243,239,229,.5)', fontFamily: 'var(--font-sans)' }}
            >
              Sign in to access your profile, event registrations, and the online judge.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="cc-email"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.18em]"
                style={{ color: 'rgba(243,239,229,.5)' }}
              >
                Email Address
              </label>
              <input
                id="cc-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:opacity-30"
                style={{
                  borderColor: 'rgba(243,239,229,.18)',
                  color: paper,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d4d')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(243,239,229,.18)')}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="cc-password"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.18em]"
                style={{ color: 'rgba(243,239,229,.5)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="cc-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border bg-transparent px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:opacity-30"
                  style={{
                    borderColor: 'rgba(243,239,229,.18)',
                    color: paper,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d4d')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(243,239,229,.18)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.1em] opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: paper }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] leading-relaxed"
                style={{ color: '#ff8080' }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cc-hover mt-2 w-full rounded-lg py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-all disabled:opacity-50"
              style={{
                background: '#ff4d4d',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 10px 40px -10px rgba(255,77,77,0.5)',
              }}
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

          {/* Footer note */}
          <p
            className="mt-6 text-center text-[10px] leading-relaxed"
            style={{ color: 'rgba(243,239,229,.3)' }}
          >
            Access is limited to registered club members.<br />
            Contact a club coordinator if you need an account.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
