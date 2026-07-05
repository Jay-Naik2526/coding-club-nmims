import { Suspense, lazy, useRef, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import { FACULTY, FACULTY_NOTE, CAMPUSES, CONTACT, SOCIAL } from '@/lib/content'
import { DEPTS } from '@/lib/depts'
import axios from 'axios'
import api from '@/lib/api'

const CoHeadCanvas = lazy(() => import('@/three/TeamPortrait').then((m) => ({ default: m.CoHeadCanvas })))

const CO_HEADS = [
  { name: 'Daksh Lalawat', role: 'Co-Head', photo: '/team/Daksh.jpeg' },
  { name: 'Jiya Patel', role: 'Co-Head', photo: '/team/Jiya.jpeg' },
  { name: 'Palak Agarwal', role: 'Co-Head', photo: '/team/Palak.jpeg' },
]

const FACULTY_CURRENT = FACULTY.filter((f) => f.name !== 'Prof. Pratiksha Meshram')

// Each committee gets its own accent — Web Dev/Cybersecurity borrow the real
// colors those tracks use elsewhere on the site; the operations committees
// get their own ink tones so all six read as distinct branches on the chart.
const DEPARTMENTS = [
  {
    name: 'Event Management',
    color: 'var(--news-red)',
    desc: 'Planning, scheduling, logistics, and execution of tech events across campuses.',
    heads: [
      { name: 'Nishtha Ghatiya', role: 'Event Mgmt Head', photo: '/team/nishtha_ghatiya.jpeg' },
      { name: 'Sharva Shenoy', role: 'Event Mgmt Head', photo: '/team/sharva_shenoy.jpeg' },
    ],
  },
  {
    name: 'Web Development',
    color: DEPTS.web.acc,
    desc: 'Engineering core club infrastructure, platforms, and interactive dashboards.',
    heads: [
      { name: 'Panth Haveliwala', role: 'Web Dev Head', photo: '/team/panth_haveliwala.jpeg' },
      { name: 'Jay Damani', role: 'Web Dev Head', photo: '/team/jay_damani.jpeg' },
      { name: 'Ishan Dadape', role: 'Web Dev Head', photo: '/team/ishan_dadape.jpeg' },
    ],
  },
  {
    name: 'Cybersecurity',
    color: DEPTS.sec.acc,
    desc: 'Leading CTFs, security audits, training tracks, and infrastructure defense.',
    heads: [
      { name: 'Kushal Khadse', role: 'Cybersec Head', photo: '/team/kushal_khadse.jpeg' },
      { name: 'Parth Pawar', role: 'Cybersec Head', photo: '/team/parth_pawar.jpeg' },
    ],
  },
  {
    name: 'Documentation & PR',
    color: 'var(--amber)',
    desc: 'Crafting official publications, event summaries, and club press relations.',
    heads: [
      { name: 'Yash Bharadwaj', role: 'Documentation Head', photo: '/team/yash_bharadwaj.jpeg' },
      { name: 'Chahat Saraf', role: 'Documentation Head', photo: '/team/chahat_saraf.jpeg' },
    ],
  },
  {
    name: 'Marketing & Sponsorships',
    color: DEPTS.dsa.acc,
    desc: 'Managing corporate relations, funding acquisitions, and campus outreach.',
    heads: [
      { name: 'Atharva Khandelwal', role: 'Marketing Head', photo: '/team/atharva_khandelwal.jpeg' },
      { name: 'Priyansh Jain', role: 'Marketing Head', photo: '/team/priyansh_jain.jpeg' },
    ],
  },
  {
    name: 'Creative & Social Media',
    color: '#6D3B8E',
    desc: 'Designing brand guidelines, visual assets, and high-impact digital presence.',
    heads: [
      { name: 'Shlok Patel', role: 'Creative Head', photo: '/team/shlok_patel.jpeg' },
      { name: 'Disha Bhagat', role: 'Creative Head', photo: '/team/disha_bhagat.jpeg' },
    ],
  },
]

const QUICK_NAV = [
  ['president', 'The President'],
  ['leadership', 'Co-Heads'],
  ['committee', 'Core Committee'],
  ['faculty', 'Faculty'],
  ['contact', 'Contact'],
] as const

export function TeamPage() {
  // The main "chain of command" trunk — spans President through Faculty.
  // Its height draws in tied to how far you've scrolled through that range.
  const spineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: mainLine } = useScroll({ target: spineRef, offset: ['start end', 'end start'] })

  return (
    <>
      {/* ── MASTHEAD HERO ────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-5xl px-5 pt-12 sm:px-10">
        <div className="mb-3 text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § The Masthead · 2026 – 27
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.6rem,7vw,5.2rem)' }}>
          The People<br />
          <span style={{ color: 'var(--news-red)' }}>Behind the Club.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-sans)' }}>
          A small core team that architects every event, system, and workshop the Coding Club runs across NMIMS campuses.
        </p>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y py-3" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
          {QUICK_NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-[10px] uppercase tracking-[0.12em] transition-colors hover:text-[var(--news-red)]"
              style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* ── THE CHAIN OF COMMAND — one continuous ink trunk, President → Faculty ── */}
      <div ref={spineRef} className="relative mx-auto mt-4 max-w-5xl px-5 sm:px-10">
        {/* the trunk itself — height grows tied to scroll position */}
        <motion.div
          aria-hidden
          className="absolute left-4 top-0 hidden w-px sm:left-5 sm:block"
          style={{ height: '100%', background: 'var(--news-ink)', scaleY: mainLine, transformOrigin: 'top', opacity: 0.35 }}
        />

        <StationSection id="president" n="01" label="Club President" title="The Head" marginTop="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:items-start"
          >
            <div className="mx-auto w-full max-w-sm border md:mx-0" style={{ borderColor: 'var(--news-ink)' }}>
              <div className="group relative aspect-[3/4] overflow-hidden">
                <img
                  src="/team/Jay.jpeg"
                  alt="Jay Naik"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                Club President · Coding Club NMIMS
              </div>
              <h2 className="font-[family-name:var(--font-serif)] font-black leading-tight" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>
                Jay Naik
              </h2>
              <div className="pull-q mt-4">
                "Build things that outlast the semester they were built in."
              </div>
              <div className="drop-cap space-y-3 text-[15px] leading-relaxed" style={{ color: 'rgba(26,22,18,.72)' }}>
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
        </StationSection>

        <StationSection id="leadership" n="02" label="Senior Leadership" title="Co-Heads" marginTop="mt-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mb-8 h-[320px] overflow-hidden rounded-2xl sm:h-[360px]"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #090a1a, #0b0a09)' }}
          >
            <Suspense fallback={<CanvasPlaceholder />}>
              <CoHeadCanvas photos={CO_HEADS.map((c) => c.photo)} accent="#5b6af0" />
            </Suspense>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="text-[9px] uppercase tracking-[0.25em] opacity-40" style={{ color: '#f3efe5', fontFamily: 'var(--font-os)' }}>
                ✦ move cursor to pan ✦
              </div>
            </div>
          </motion.div>

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
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={c.photo} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="border-t p-4" style={{ borderColor: 'rgba(26,22,18,.12)' }}>
                  <div className="mb-1 text-[9px] uppercase tracking-[0.16em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                    Co-Head
                  </div>
                  <div className="font-[family-name:var(--font-serif)] text-xl font-bold leading-tight">{c.name}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
                    Core Committee · NMIMS
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </StationSection>

        <StationSection
          id="committee"
          n="03"
          label="Departmental Heads · 2026–27"
          title="Departmental Heads"
          marginTop="mt-20"
        >
          <DepartmentTree departments={DEPARTMENTS} />
        </StationSection>

        <StationSection id="faculty" n="04" label="Academic Guidance" title="Faculty Advisors" marginTop="mt-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FACULTY_CURRENT.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative mx-auto flex w-full max-w-md items-stretch overflow-hidden border"
                style={{ borderColor: 'rgba(26,22,18,.18)' }}
              >
                <div className="flex aspect-[3/4] w-32 flex-shrink-0 items-center justify-center overflow-hidden border-r bg-stone-100/50" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                  {f.photo ? (
                    <img src={f.photo} alt={f.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="text-4xl">🎓</div>
                  )}
                </div>
                <div className="relative flex flex-grow flex-col justify-center p-5" style={{ background: 'var(--news-bg)' }}>
                  <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'var(--news-red)' }} />
                  <div className="mb-1 pl-2 text-[9px] uppercase tracking-[0.18em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                    {f.role}
                  </div>
                  <div className="pl-2 font-[family-name:var(--font-serif)] text-lg font-black leading-tight">{f.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="mt-5 font-[family-name:var(--font-serif)] text-sm italic leading-relaxed" style={{ color: 'rgba(26,22,18,.5)' }}>
            {FACULTY_NOTE}
          </p>
        </StationSection>
      </div>

      {/* ── CAMPUS NETWORK — footnote weight ─────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-5xl px-5 sm:px-10">
        <div className="mb-4 text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
          § One club, many campuses
        </div>
        <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
          {CAMPUSES.map((c) => (
            <div key={c.name} className="border-l-[3px] pl-4" style={{ borderColor: 'var(--news-red)' }}>
              <div className="font-[family-name:var(--font-serif)] text-base font-bold leading-tight">{c.name}</div>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 · CONTACT ─────────────────────────────────────────────────── */}
      <div id="contact" className="scroll-mt-10">
        <ContactSection />
      </div>
    </>
  )
}

/** One "station" on the main trunk — a small marker that pops in when it
 *  scrolls to roughly the middle of the viewport, wired to the shared ink
 *  line running through the whole hierarchy. */
function StationSection({
  id,
  n,
  label,
  title,
  sub,
  color = 'var(--news-red)',
  marginTop,
  children,
}: {
  id: string
  n: string
  label: string
  title: string
  sub?: string
  color?: string
  marginTop: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`relative z-10 flex scroll-mt-10 gap-3 sm:gap-5 ${marginTop}`}>
      <div className="hidden w-8 flex-shrink-0 justify-center pt-1.5 sm:flex sm:w-10">
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '-45% 0px -45% 0px' }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="block h-3.5 w-3.5 rounded-full border-2"
          style={{ borderColor: color, background: 'var(--news-bg)' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-8">
          <div className="mb-1 text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
            § {n} — <span style={{ color }}>{label}</span>
          </div>
          <h2 className="border-b-[3px] pb-2 font-[family-name:var(--font-serif)] font-black" style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', borderColor: 'var(--news-ink)' }}>
            {title}
          </h2>
          {sub && (
            <p className="mt-2 max-w-xl text-sm italic leading-relaxed" style={{ color: 'rgba(26,22,18,.5)' }}>
              {sub}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}

interface Dept {
  name: string
  color: string
  desc: string
  heads: { name: string; role: string; photo?: string }[]
}

/** The six committees as branches off a secondary, shorter ink line nested
 *  inside "Core Committee" — a tree growing off the main trunk, not another
 *  flat repeat of it. Each branch draws in as its own department scrolls by. */
function DepartmentTree({ departments }: { departments: Dept[] }) {
  const treeRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: branchLine } = useScroll({ target: treeRef, offset: ['start end', 'end center'] })

  return (
    <div ref={treeRef} className="relative space-y-14">
      <motion.div
        aria-hidden
        className="absolute left-4 top-0 hidden w-px sm:block"
        style={{ height: '100%', background: 'var(--news-ink)', scaleY: branchLine, transformOrigin: 'top', opacity: 0.25 }}
      />

      {departments.map((dept, di) => (
        <div key={dept.name} className="relative flex gap-3 sm:gap-5">
          <div className="hidden w-8 flex-shrink-0 justify-center pt-2 sm:flex sm:w-10">
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-40% 0px -40% 0px' }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              className="block h-3 w-3 rounded-full"
              style={{ background: dept.color }}
            />
          </div>

          <div className="min-w-0 flex-1">
            {/* Department masthead: ghost numeral + name + mission line, in that dept's own color */}
            <div className="relative mb-7 flex items-end gap-3 border-b-4 pb-3 sm:gap-5" style={{ borderColor: dept.color }}>
              <span
                className="select-none font-[family-name:var(--font-serif)] font-black leading-[0.75]"
                style={{ fontSize: 'clamp(2.6rem,6vw,4.4rem)', color: dept.color, opacity: 0.16 }}
              >
                0{di + 1}
              </span>
              <div className="pb-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-[family-name:var(--font-serif)] font-black leading-tight" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
                    {dept.name}
                  </h3>
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: dept.color, fontFamily: 'var(--font-os)' }}>
                    · {dept.heads.length} Head{dept.heads.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="mt-1 max-w-lg text-sm italic leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>
                  {dept.desc}
                </p>
              </div>
            </div>

            {/* Heads — sized to the department's real headcount, not a fixed grid */}
            <div className={`grid grid-cols-2 gap-5 ${dept.heads.length >= 3 ? 'max-w-2xl sm:grid-cols-3' : 'max-w-md sm:grid-cols-2'}`}>
              {dept.heads.map((h, i) => (
                <motion.div
                  key={h.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative overflow-hidden border transition-shadow duration-300 hover:shadow-lg"
                  style={{ borderColor: 'rgba(26,22,18,.18)' }}
                >
                  <span className="absolute inset-x-0 top-0 z-10 h-[3px]" style={{ background: dept.color }} />
                  <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                    {h.photo ? (
                      <img src={h.photo} alt={h.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">✨</div>
                    )}
                  </div>
                  <div className="border-t p-3.5" style={{ borderColor: 'rgba(26,22,18,.12)' }}>
                    <div className="mb-0.5 text-[9px] uppercase tracking-[0.14em]" style={{ color: dept.color, fontFamily: 'var(--font-os)' }}>
                      {h.role}
                    </div>
                    <div className="font-[family-name:var(--font-serif)] text-base font-bold leading-tight">{h.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CanvasPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(243,239,229,.3)' }}>
      Loading…
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
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
      setError(message || 'Failed to submit contact query. Please try again later.')
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
              <div className="mt-2 text-xs font-bold text-[var(--news-red)]">
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
