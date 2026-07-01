import { Suspense, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import { ScrambleText, Magnetic, Marquee } from '@/components/fx'
import { useApp } from '@/store/useApp'
import { DEPTS, DEPT_ORDER, type DeptId } from '@/lib/depts'
import { LandingScene } from '@/three/LandingScene'
import { useWipe } from '@/components/wipe-context'
import { BRAND, STATS, PILLARS, PROGRAMS, SOCIAL } from '@/lib/content'

function detectLowPower() {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 720
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cores = (navigator.hardwareConcurrency ?? 8) <= 4
  return coarse || narrow || reduced || cores
}

const ink = '#0b0a09'
const paper = '#f3efe5'

export function Landing() {
  const { dept, setDept } = useApp()
  const [hovered, setHovered] = useState<DeptId | null>(null)
  const scroll = useRef<number>(0)
  const { wipeTo } = useWipe()
  const [lowPower] = useState(detectLowPower)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      const max = document.documentElement.scrollHeight - window.innerHeight
      scroll.current = max > 0 ? Math.min(1, window.scrollY / max) : 0
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  const active = hovered ?? dept
  const cfg = DEPTS[active]

  return (
    <div className="relative" style={{ background: ink, color: paper }}>
      {/* scroll-progress rail */}
      <motion.div className="fixed left-0 top-0 z-40 h-[3px] origin-left" style={{ scaleX: progress, width: '100%', background: cfg.acc }} />

      {/* fixed 3D background — pointer-events off so it never blocks touch scroll */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full" style={{ background: ink }} />}>
          <LandingScene scroll={scroll} activeDept={active} quality={lowPower ? 'low' : 'high'} />
        </Suspense>
        {/* vignette for text legibility */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(11,10,9,.55) 100%)' }} />
      </div>

      {/* nav */}
      <nav className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-10">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 font-[family-name:var(--font-display)] text-sm tracking-wide" style={{ color: paper }}>
          <img src="/logo.png" alt="Logo" className="h-6 w-6 rounded-full object-cover border border-white/20" />
          <span>CC<span style={{ color: cfg.acc }}>_</span></span>
        </button>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] sm:gap-5">
          <button onClick={() => wipeTo('/join')} className="opacity-100 hover:opacity-80 transition-opacity font-bold" style={{ color: '#ff4d4d' }}>Apply</button>
          <button onClick={() => wipeTo('/events')} className="opacity-70 transition-opacity hover:opacity-100">Events</button>
          <button onClick={() => wipeTo('/team')} className="hidden opacity-70 transition-opacity hover:opacity-100 sm:inline">Team</button>
          <button
            onClick={() => wipeTo('/login')}
            className="border px-3 py-1.5 transition-colors hover:bg-white/10"
            style={{ borderColor: 'rgba(243,239,229,.35)', color: paper }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* content */}
      <main className="relative z-10">
        {/* HERO — glyph sweeps in from the left, copy sits to the right on desktop */}
        <section className="flex min-h-screen flex-col items-center justify-end px-6 pb-[12vh] text-center lg:items-end lg:px-16 lg:text-right">
          <motion.div
            className="lg:max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex flex-col items-center gap-3 lg:items-end">
              <div
                onClick={() => wipeTo('/join')}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[9px] uppercase tracking-[0.15em] cursor-pointer hover:bg-white/5 transition-colors"
                style={{ borderColor: 'rgba(243,239,229,.25)', color: '#fff', fontFamily: 'var(--font-os)' }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Core Committee Recruitment 2026 is Live →</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.35em]" style={{ color: 'rgba(243,239,229,.5)' }}>
                NMIMS MPSTME · Code. Collaborate. Create.
              </div>
            </div>
            <h1 className="font-[family-name:var(--font-display)] leading-[0.9]" style={{ fontSize: 'clamp(2.8rem,8vw,6.5rem)' }}>
              <ScrambleText text="THE CODING CLUB" delay={300} />
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg lg:ml-auto lg:mr-0" style={{ color: 'rgba(243,239,229,.65)', fontFamily: 'var(--font-sans)' }}>
              {BRAND.tagline} We bridge academic theory and the software industry —
              across <span style={{ color: cfg.acc }}>algorithms</span>, <span style={{ color: DEPTS.web.acc }}>the web</span>, and <span style={{ color: DEPTS.sec.acc }}>security</span>.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-end">
              <Magnetic strength={0.5}>
                <button
                  onClick={() => wipeTo('/events')}
                  className="cc-hover px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em]"
                  style={{ background: cfg.acc, color: '#fff', boxShadow: `0 10px 40px -10px ${cfg.acc}` }}
                >
                  Explore Events →
                </button>
              </Magnetic>
              <Magnetic strength={0.5}>
                <button
                  onClick={() => wipeTo('/team')}
                  className="cc-hover border px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-white/5"
                  style={{ borderColor: 'rgba(243,239,229,.25)', color: paper }}
                >
                  Meet the team
                </button>
              </Magnetic>
              <Magnetic strength={0.5}>
                <button
                  onClick={() => wipeTo('/login')}
                  className="cc-hover border px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-white/5"
                  style={{ borderColor: 'rgba(243,239,229,.2)', color: 'rgba(243,239,229,.65)' }}
                >
                  Sign In
                </button>
              </Magnetic>
            </div>
          </motion.div>
          <motion.div
            className="mt-14 self-center text-[9px] uppercase tracking-[0.3em]"
            style={{ color: 'rgba(243,239,229,.4)' }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            ↓ Scroll
          </motion.div>
        </section>

        {/* DEPARTMENTS */}
        <Section eyebrow="01 — Tracks" title="Three departments. One club." sub="Pick where you fight. Each track runs its own events, problem sets, and leaderboard.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {DEPT_ORDER.map((d, i) => {
              const c = DEPTS[d]
              const on = active === d
              return (
                <motion.button
                  key={d}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    setDept(d)
                    wipeTo('/events')
                  }}
                  className="group relative overflow-hidden rounded-xl border p-6 text-left transition-all duration-300"
                  style={{
                    borderColor: on ? c.acc : 'rgba(243,239,229,.12)',
                    background: 'rgba(255,255,255,.03)',
                    boxShadow: on ? `0 0 0 1px ${c.acc}, 0 20px 60px -20px ${c.acc}` : 'none',
                  }}
                >
                  <div
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: c.acc }}
                  />
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg text-2xl" style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${on ? c.acc : 'rgba(243,239,229,.1)'}` }}>
                    {c.icon}
                  </div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: c.acc }}>{c.label}</div>
                  <div className="mb-2 whitespace-pre-line font-[family-name:var(--font-display)] text-2xl leading-[0.95]">{c.name}</div>
                  <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'rgba(243,239,229,.55)', fontFamily: 'var(--font-sans)' }}>{c.desc}</div>
                  <div className="mt-5 text-[11px] uppercase tracking-[0.14em] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: c.acc }}>
                    Enter track →
                  </div>
                </motion.button>
              )
            })}
          </div>
        </Section>

        {/* MARQUEE */}
        <div className="border-y py-6" style={{ borderColor: 'rgba(243,239,229,.12)' }}>
          <Marquee
            items={['CODE', 'COLLABORATE', 'CREATE', 'COMPETE', 'BUILD', 'DEPLOY', 'CAPTURE THE FLAG']}
            className="font-[family-name:var(--font-display)]"
            style={{ color: paper }}
          />
        </div>

        {/* STATS */}
        <Section eyebrow="02 — By the numbers" title="A community, not a club." sub="Operating out of MPSTME across NMIMS campuses.">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border md:grid-cols-4" style={{ borderColor: 'rgba(243,239,229,.12)', background: 'rgba(243,239,229,.12)' }}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.lbl}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-7 text-center"
                style={{ background: 'rgba(11,10,9,.8)' }}
              >
                <div className="font-[family-name:var(--font-display)] leading-none" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: i === 3 ? cfg.acc : paper }}>{s.big}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(243,239,229,.4)' }}>{s.lbl}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* PILLARS — what we do */}
        <Section eyebrow="03 — What we do" title="Three pillars hold it up." sub={BRAND.mission}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border p-6"
                style={{ borderColor: 'rgba(243,239,229,.12)', background: 'rgba(255,255,255,.03)' }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-lg" style={{ border: `1px solid ${cfg.acc}`, color: cfg.acc }}>
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(243,239,229,.55)', fontFamily: 'var(--font-sans)' }}>{p.body}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* PROGRAMS — flagship initiatives */}
        <Section eyebrow="04 — Programs & tracks" title="What runs through the year." sub="Flagship initiatives across placements, hackathons, security, web3, and full-stack.">
          <div className="divide-y rounded-xl border" style={{ borderColor: 'rgba(243,239,229,.12)' }}>
            {PROGRAMS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-1 gap-2 p-6 sm:grid-cols-[1fr_2fr] sm:gap-8"
                style={{ borderColor: 'rgba(243,239,229,.12)' }}
              >
                <div>
                  <div className="font-[family-name:var(--font-display)] text-lg leading-tight">{p.name}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.12em]" style={{ color: cfg.acc, fontFamily: 'var(--font-os)' }}>{p.tagline}</div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(243,239,229,.6)', fontFamily: 'var(--font-sans)' }}>{p.text}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* FINAL CTA */}
        <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
          <h2 className="font-[family-name:var(--font-display)] leading-[0.95]" style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)' }}>
            Ready to compile<br />something great?
          </h2>
          <button
            onClick={() => wipeTo('/events')}
            className="cc-hover mt-9 px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
            style={{ background: cfg.acc, color: '#fff', boxShadow: `0 10px 50px -12px ${cfg.acc}` }}
          >
            Explore Events →
          </button>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(243,239,229,.55)' }}>
            <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">LinkedIn</a>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Instagram</a>
            <a href={SOCIAL.medium} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Medium</a>
            <a href={`mailto:${SOCIAL.email}`} className="transition-colors hover:text-white">Email</a>
          </div>
          <div className="mt-6 text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(243,239,229,.3)' }}>
            MPSTME · NMIMS · Coding Club
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: cfg.acc }}>
            Website Engineered by Club Head Jay Naik
          </div>
        </section>
      </main>
    </div>
  )
}

function Section({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:py-32">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 text-center lg:mb-16">
        <div className="mb-3 text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(243,239,229,.45)' }}>{eyebrow}</div>
        <h2 className="font-[family-name:var(--font-display)] leading-[0.95]" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>{title}</h2>
        {sub && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'rgba(243,239,229,.55)', fontFamily: 'var(--font-sans)' }}>{sub}</p>}
      </motion.div>
      {children}
    </section>
  )
}
