import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import api from '@/lib/api'

const inputStyle = { borderColor: 'rgba(26,22,18,.3)' }

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sapId, setSapId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, sapId, newPassword })
      setSuccess(true)
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
      setError(message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--news-bg)', color: 'var(--news-ink)' }}>
      <nav className="flex items-center justify-between border-b px-5 py-4 sm:px-10" style={{ borderColor: 'var(--news-ink)' }}>
        <Link to="/" className="font-[family-name:var(--font-display)] text-sm tracking-wide">
          CC<span style={{ color: 'var(--news-red)' }}>_</span>
        </Link>
        <Link to="/login" className="text-[10px] uppercase tracking-[0.18em] opacity-60 transition-opacity hover:opacity-100">
          ← Back to Login
        </Link>
      </nav>

      <section className="mx-auto max-w-lg px-5 py-12 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 text-center">
            <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
              § NMIMS Coding Club · Account Recovery
            </div>
            <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.2rem,6vw,3.2rem)' }}>
              Reset Password
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
              Verify your identity with your email and SAP ID, then set a new password.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 p-6 text-center"
              style={{ borderColor: 'var(--news-ink)' }}
            >
              <div className="mb-3 text-3xl">✓</div>
              <h2 className="mb-2 font-[family-name:var(--font-serif)] text-xl font-bold">
                Password Reset Successfully
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
                Your password has been updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="cc-hover mt-5 inline-block px-6 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white"
                style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
              >
                Sign In →
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 border-t-2 pt-8" style={{ borderColor: 'var(--news-ink)' }}>
              <Field label="Email Address">
                <input
                  id="cc-forgot-email"
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

              <Field label="SAP ID">
                <input
                  id="cc-forgot-sapid"
                  type="text"
                  required
                  value={sapId}
                  onChange={(e) => setSapId(e.target.value)}
                  placeholder="e.g. 60004230001"
                  className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]"
                  style={inputStyle}
                />
              </Field>

              <div className="border-t pt-5" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                <div className="mb-4 text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                  New Password
                </div>
              </div>

              <Field label="Password">
                <div className="relative">
                  <input
                    id="cc-new-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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

              <Field label="Confirm Password">
                <input
                  id="cc-confirm-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]"
                  style={inputStyle}
                />
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
                    Resetting…
                  </span>
                ) : (
                  'Reset Password →'
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[10px] leading-relaxed" style={{ color: 'rgba(26,22,18,.5)' }}>
            Remember your password?{' '}
            <Link to="/login" className="underline" style={{ color: 'var(--news-red)' }}>
              Sign in →
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
