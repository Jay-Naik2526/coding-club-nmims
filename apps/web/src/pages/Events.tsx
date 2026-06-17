import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '@/store/useApp'
import { DEPTS } from '@/lib/depts'
import { PROGRAMS, SOCIAL } from '@/lib/content'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ARCHIVE } from '@/lib/archive'

export function EventsPage() {
  const { dept } = useApp()
  const cfg = DEPTS[dept]
  const navigate = useNavigate()
  const [heroL1, heroL2] = cfg.newsHero.split('\n')

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events')
      return res.data
    }
  })

  // Filter events by selected department
  const deptEvents = events?.filter((e: any) => e.department === dept) || []
  const activeEvents = deptEvents.filter((e: any) => e.status !== 'closed')

  // Archive section is driven by static data — always shows all, unaffected by dept filter
  const deptArchive = ARCHIVE

  return (
    <>
      {/* editorial header */}
      <header className="mx-auto max-w-5xl px-5 pb-8 pt-10 text-center sm:px-10 sm:pt-12">
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § The Events Desk · {cfg.code}
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.4rem,7vw,5rem)' }}>
          {heroL1} <span style={{ color: 'var(--news-red)' }}>{heroL2}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-serif)] text-base italic leading-relaxed sm:text-lg" style={{ color: 'rgba(26,22,18,.55)' }}>
          {cfg.newsSub}
        </p>
      </header>

      {/* dynamic active events / season-in-planning notice */}
      <section className="mx-auto max-w-5xl px-5 sm:px-10">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
            <div className="mt-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
              Loading active lineups...
            </div>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-6 text-center text-red-800">
            <p className="text-sm font-bold">Failed to load active events.</p>
            <p className="text-xs mt-1">Please check your network connection.</p>
          </div>
        ) : activeEvents.length > 0 ? (
          <div>
            <div className="mb-6 flex flex-wrap items-baseline gap-3 border-b-[3px] pb-2" style={{ borderColor: 'var(--news-ink)' }}>
              <h2 className="font-[family-name:var(--font-serif)] font-black" style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>§ Active Contests</h2>
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>Registrations open & upcoming</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {activeEvents.map((ev: any, i: number) => {
                const isLive = ev.status === 'live';
                return (
                  <motion.div
                    key={ev.slug}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="cc-hover group flex flex-col justify-between border p-5 text-left"
                    style={{ borderColor: 'rgba(26,22,18,.18)' }}
                  >
                    <div>
                      <div className="mb-2 flex items-baseline justify-between gap-2">
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-white" style={{ background: cfg.acc, fontFamily: 'var(--font-os)' }}>
                          {ev.type}
                        </span>
                        <span className={`text-[9px] uppercase tracking-[0.1em] ${isLive ? 'blink font-bold' : ''}`} style={{ fontFamily: 'var(--font-os)', color: isLive ? 'var(--news-red)' : 'rgba(26,22,18,.5)' }}>
                          {isLive ? '• LIVE NOW' : ev.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="mb-2 font-[family-name:var(--font-serif)] text-xl font-bold leading-tight">
                        {ev.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
                        {ev.description}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between border-t pt-3 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
                        <span>Diff: {ev.difficulty}/5</span>
                        <span>{new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/events/${ev.slug}`)}
                        className="cc-hover mt-4 w-full py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                        style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
                      >
                        Enter Event →
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden border-2 p-6 text-center sm:p-10" style={{ borderColor: 'var(--news-ink)' }}>
            <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: 'var(--news-red)' }} />
            <div className="mb-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
              Stop Press · 2026–27 Season
            </div>
            <h2 className="mx-auto max-w-2xl font-[family-name:var(--font-serif)] text-2xl font-black leading-tight sm:text-3xl">
              This year’s lineup is in development.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'rgba(26,22,18,.6)' }}>
              No active events are scheduled for this track right now. Follow our community channels to get notified when hackathons, contests, and bootcamps drop — or explore our syllabus below.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="cc-hover px-6 py-3 text-[11px] uppercase tracking-[0.12em] text-white" style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}>
                Follow on Instagram →
              </a>
              <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="cc-hover border px-6 py-3 text-[11px] uppercase tracking-[0.12em]" style={{ borderColor: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        )}
      </section>

      {/* what we run — recurring programs (real) */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-10 sm:py-16">
        <div className="mb-6 flex flex-wrap items-baseline gap-3 border-b-[3px] pb-2" style={{ borderColor: 'var(--news-ink)' }}>
          <h2 className="font-[family-name:var(--font-serif)] font-black" style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>§ What We Run</h2>
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>Recurring tracks</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROGRAMS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.25) }}
              className="relative border p-5"
              style={{ borderColor: 'rgba(26,22,18,.18)' }}
            >
              <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'var(--news-red)' }} />
              <div className="font-[family-name:var(--font-serif)] text-xl font-bold leading-tight">{p.name}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>{p.tagline}</div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* From the Archive — static archive data, always visible */}
      <section className="border-t-2 px-5 py-12 sm:px-10" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-baseline gap-3 border-b-[3px] pb-2" style={{ borderColor: 'var(--news-ink)' }}>
            <h2 className="font-[family-name:var(--font-serif)] font-black" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>§ From the Archive</h2>
            <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>Ambiora 2026 · last session</span>
          </div>
          {deptArchive.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {deptArchive.map((a, i) => (
                <motion.button
                  key={a.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(`/events/${a.slug}`)}
                  className="cc-hover group overflow-hidden border text-left"
                  style={{ borderColor: 'rgba(26,22,18,.18)' }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={`/events/${a.slug}/1.jpeg`} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-0 top-0 px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-white" style={{ background: a.color, fontFamily: 'var(--font-os)' }}>
                      {DEPTS[a.dept].code}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="font-[family-name:var(--font-serif)] text-xl font-bold leading-tight">{a.title}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
                      {a.date} · {a.fest}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(26,22,18,.6)' }}>{a.tagline}</p>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.12em] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: a.color }}>Read recap →</div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-sm italic" style={{ color: 'rgba(26,22,18,.5)' }}>
              No archived records found for this track.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
