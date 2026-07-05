import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { FACULTY, FACULTY_NOTE, CAMPUSES, CONTACT, SOCIAL } from '@/lib/content'
import { lazy } from 'react'
import api from '@/lib/api'

const CoHeadCanvas = lazy(() => import('@/three/TeamPortrait').then((m) => ({ default: m.CoHeadCanvas })))

const CO_HEADS = [
  { name: 'Daksh Lalawat', role: 'Co-Head', photo: '/team/Daksh.jpeg' },
  { name: 'Jiya Patel',    role: 'Co-Head', photo: '/team/Jiya.jpeg'  },
  { name: 'Palak Agarwal', role: 'Co-Head', photo: '/team/Palak.jpeg' },
]

const FACULTY_CURRENT = FACULTY.filter((f) => f.name !== 'Prof. Pratiksha Meshram')

const DEPARTMENTS = [
  {
    name: 'Event Management',
    heads: [
      { name: 'Nishtha Ghatiya', role: 'Event Mgmt Head', photo: '/team/nishtha_ghatiya.jpeg' },
      { name: 'Sharva Shenoy', role: 'Event Mgmt Head', photo: '/team/sharva_shenoy.jpeg' },
    ]
  },
  {
    name: 'Marketing',
    heads: [
      { name: 'Atharva Khandelwal', role: 'Marketing Head', photo: '/team/atharva_khandelwal.jpeg' },
      { name: 'Priyansh Jain', role: 'Marketing Head', photo: '/team/priyansh_jain.jpeg' },
    ]
  },
  {
    name: 'Web Development',
    heads: [
      { name: 'Panth Haveliwala', role: 'Web Dev Head', photo: '/team/panth_haveliwala.jpeg' },
      { name: 'Jay Damani', role: 'Web Dev Head', photo: '/team/jay_damani.jpeg' },
      { name: 'Ishan Dadape', role: 'Web Dev Head', photo: '/team/ishan_dadape.jpeg' },
    ]
  },
  {
    name: 'Cybersecurity',
    heads: [
      { name: 'Kushal Khadse', role: 'Cybersec Head', photo: '/team/kushal_khadse.png' },
      { name: 'Parth Pawar', role: 'Cybersec Head', photo: '/team/parth_pawar.jpeg' },
    ]
  },
  {
    name: 'Documentation',
    heads: [
      { name: 'Yash Bharadwaj', role: 'Documentation Head', photo: '/team/yash_bharadwaj.jpeg' },
      { name: 'Chahat Saraf', role: 'Documentation Head', photo: '/team/chahat_saraf.jpeg' },
    ]
  },
  {
    name: 'Creative & Social Media',
    heads: [
      { name: 'Shlok Patel', role: 'Creative Head', photo: '/team/shlok_patel.jpeg' },
      { name: 'Disha Bhagat', role: 'Creative Head', photo: null },
    ]
  }
]

export function TeamPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-5xl px-5 pt-12 sm:px-10">
        <div className="mb-3 text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § The Masthead · 2026 – 27
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)' }}>
          The People<br />
          <span style={{ color: 'var(--news-red)' }}>Behind the Club.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-sans)' }}>
          A small core team that architects every event, system, and workshop the Coding Club runs across NMIMS campuses.
        </p>
      </header>

      {/* ── HEAD ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-5xl px-5 sm:px-10">
        <SectionHead n="01" label="Club President" title="The Head" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center"
        >
          {/* Photo card (matching co-heads style) */}
          <div
            className="group relative overflow-hidden border aspect-[3/4] max-w-sm mx-auto md:mx-0 w-full"
            style={{ borderColor: 'rgba(26,22,18,.18)' }}
          >
            <img
              src="/team/Jay.jpeg"
              alt="Jay Naik"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Info */}
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
              Club President · Coding Club NMIMS
            </div>
            <h2 className="font-[family-name:var(--font-serif)] font-black leading-tight" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Jay Naik
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.65)' }}>
              <p>
                Head of the Coding Club at NMIMS MPSTME. Oversees all technical initiatives, event architecture, committee operations, and the club's long-term vision across campuses.
              </p>
              <p>
                Leads the cybersecurity division and coordinates the core team across DSA, Web Development, and Security tracks.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Cybersecurity', 'Event Architecture', 'Leadership', 'Full-Stack'].map((tag) => (
                <span
                  key={tag}
                  className="border px-3 py-1 text-[9px] uppercase tracking-[0.14em]"
                  style={{ borderColor: 'rgba(26,22,18,.2)', color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-6 border-t pt-4 text-[10px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(26,22,18,.15)', color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
              Contact — 9374488770
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CO-HEADS ─────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-5xl px-5 sm:px-10">
        <SectionHead n="02" label="Senior Leadership" title="Co-Heads" />

        {/* 3D fan */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative h-[360px] overflow-hidden rounded-2xl mb-10"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #090a1a, #0b0a09)' }}
        >
          <Suspense fallback={<CanvasPlaceholder />}>
            <CoHeadCanvas
              photos={CO_HEADS.map((c) => c.photo)}
              accent="#5b6af0"
            />
          </Suspense>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="text-[9px] uppercase tracking-[0.25em] opacity-40" style={{ color: '#f3efe5', fontFamily: 'var(--font-os)' }}>
              ✦ move cursor to pan ✦
            </div>
          </div>
        </motion.div>

        {/* Cards below the 3D scene */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CO_HEADS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative overflow-hidden border"
              style={{ borderColor: 'rgba(26,22,18,.18)' }}
            >
              {/* photo */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* info */}
              <div className="border-t p-4" style={{ borderColor: 'rgba(26,22,18,.12)' }}>
                <div className="text-[9px] uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                  Co-Head
                </div>
                <div className="font-[family-name:var(--font-serif)] text-xl font-bold leading-tight">
                  {c.name}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
                  Core Committee · NMIMS
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CORE COMMITTEE ───────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-5xl px-5 sm:px-10">
        <SectionHead n="03" label="Core Committee" title="The Organising Crew" />

        <div className="mb-10 border-2 p-6 sm:p-8 text-center" style={{ borderColor: 'var(--news-ink)' }}>
          <div className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
            Stop Press · Selections Finalised
          </div>
          <h3 className="font-[family-name:var(--font-serif)] font-black leading-tight mb-3" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
            Meet the Department Heads · 2026–27
          </h3>
          <p className="mx-auto max-w-xl text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
            The leaders responsible for orchestrating event logistics, technical development, cybersecurity labs, documentation, marketing, and creative presence across our campuses.
          </p>
        </div>

        <div className="space-y-16">
          {DEPARTMENTS.map((dept) => (
            <div key={dept.name}>
              {/* Department title */}
              <div className="mb-6 flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
                <h3 className="font-[family-name:var(--font-serif)] font-black text-lg sm:text-xl" style={{ color: 'var(--news-ink)' }}>
                  {dept.name}
                </h3>
                <div className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                  Division Head{dept.heads.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Heads Grid */}
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {dept.heads.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative overflow-hidden border flex flex-col"
                    style={{ borderColor: 'rgba(26,22,18,.18)' }}
                  >
                    {/* photo */}
                    <div className="aspect-[3/4] overflow-hidden bg-stone-100 flex items-center justify-center relative">
                      {c.photo ? (
                        <img
                          src={c.photo}
                          alt={c.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-4xl select-none">✨</div>
                      )}
                      {!c.photo && (
                        <div className="absolute inset-0 flex items-end justify-center pb-4 bg-black/5">
                          <span className="text-[8px] uppercase tracking-wider bg-white/95 px-2 py-0.5 rounded border shadow-sm" style={{ fontFamily: 'var(--font-os)', color: 'var(--news-ink)' }}>
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                    {/* info */}
                    <div className="border-t p-3 flex-grow flex flex-col justify-between" style={{ borderColor: 'rgba(26,22,18,.12)', background: 'var(--news-bg)' }}>
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.14em] mb-0.5" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                          {c.role}
                        </div>
                        <div className="font-[family-name:var(--font-serif)] text-sm font-bold leading-tight text-stone-900">
                          {c.name}
                        </div>
                      </div>
                      <div className="mt-2 text-[8px] uppercase tracking-[0.08em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
                        Coding Club
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FACULTY ──────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-5xl px-5 sm:px-10">
        <SectionHead n="04" label="Academic Guidance" title="Faculty Advisors" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FACULTY_CURRENT.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative overflow-hidden border flex items-stretch w-full max-w-md mx-auto"
              style={{ borderColor: 'rgba(26,22,18,.18)' }}
            >
              {/* Photo Container (fixed width to prevent low-res distortion) */}
              <div className="w-32 flex-shrink-0 aspect-[3/4] overflow-hidden bg-stone-100/50 flex items-center justify-center relative border-r" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                {f.photo ? (
                  <img
                    src={f.photo}
                    alt={f.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-4xl select-none">🎓</div>
                )}
                {!f.photo && (
                  <div className="absolute inset-0 flex items-end justify-center pb-4 bg-black/5">
                    <span className="text-[8px] uppercase tracking-wider bg-white/95 px-2 py-0.5 rounded border shadow-sm" style={{ fontFamily: 'var(--font-os)', color: 'var(--news-ink)' }}>
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>

              {/* Details banner to the right */}
              <div className="p-5 flex flex-col justify-center flex-grow relative" style={{ background: 'var(--news-bg)' }}>
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'var(--news-red)' }} />
                <div className="text-[9px] uppercase tracking-[0.18em] mb-1 pl-2" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                  {f.role}
                </div>
                <div className="font-[family-name:var(--font-serif)] text-lg font-black leading-tight pl-2">{f.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-5 font-[family-name:var(--font-serif)] text-sm italic leading-relaxed" style={{ color: 'rgba(26,22,18,.5)' }}>
          {FACULTY_NOTE}
        </p>
      </section>

      {/* ── CAMPUS NETWORK ───────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-5xl px-5 sm:px-10">
        <SectionHead n="05" label="Inter-Campus Network" title="One club, many campuses" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CAMPUSES.map((c) => (
            <div key={c.name} className="border-l-[3px] pl-4" style={{ borderColor: 'var(--news-red)' }}>
              <div className="font-[family-name:var(--font-serif)] text-base font-bold leading-tight">{c.name}</div>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <ContactSection />
    </>
  )
}

function CanvasPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(243,239,229,.3)' }}>
      Loading…
    </div>
  )
}

function SectionHead({ n, label, title }: { n: string; label: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="mb-1 text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
        § {n} — <span style={{ color: 'var(--news-red)' }}>{label}</span>
      </div>
      <h2 className="border-b-[3px] pb-2 font-[family-name:var(--font-serif)] font-black" style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', borderColor: 'var(--news-ink)' }}>
        {title}
      </h2>
    </div>
  )
}

function ContactSection() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      fullName: formData.get('fullName'),
      sapId: formData.get('sapId'),
      campusDept: formData.get('campusDept'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    try {
      await api.post('/admin/contact', payload)
      setSent(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Failed to submit contact query. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-14 max-w-3xl px-5 py-12 sm:px-10">
      <div className="border-t-2 pt-10" style={{ borderColor: 'var(--news-ink)' }}>
        <h2 className="font-[family-name:var(--font-serif)] font-black leading-tight" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)' }}>
          {CONTACT.header}
        </h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>{CONTACT.subtext}</p>

        {sent ? (
          <div className="mt-8 border p-8 text-center" style={{ borderColor: 'var(--news-red)' }}>
            <div className="font-[family-name:var(--font-serif)] text-2xl font-bold">Message sent ✓</div>
            <p className="mt-2 text-sm" style={{ color: 'rgba(26,22,18,.55)' }}>Your submission has been recorded. Our core committee will respond shortly.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {CONTACT.fields.map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="mb-1.5 block text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
                  {f.label}
                </label>
                {f.type === 'textarea' ? (
                  <textarea id={f.name} name={f.name} required rows={4} className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                ) : f.type === 'select' ? (
                  <select id={f.name} name={f.name} required defaultValue="" className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                    <option value="" disabled>Select…</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input id={f.name} name={f.name} type={f.type} inputMode={'inputMode' in f ? f.inputMode : undefined} required className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                )}
              </div>
            ))}
            
            {error && (
              <div className="text-xs text-[var(--news-red)] font-bold mt-2">
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="cc-hover px-8 py-3 text-[11px] uppercase tracking-[0.14em] text-white disabled:opacity-50" style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}>
              {loading ? 'Sending Query…' : 'Send Message →'}
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
          <a href={`mailto:${SOCIAL.email}`} className="hover:text-[var(--news-red)]">{SOCIAL.email}</a>
          <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="hover:text-[var(--news-red)]">LinkedIn</a>
          <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="hover:text-[var(--news-red)]">Instagram</a>
          <a href={SOCIAL.medium} target="_blank" rel="noreferrer" className="hover:text-[var(--news-red)]">Medium</a>
        </div>
      </div>
    </section>
  )
}
