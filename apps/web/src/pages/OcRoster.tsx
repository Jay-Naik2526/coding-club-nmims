import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { OC_DIVISIONS, OC_TOTAL, aliasFor, findBySlug, initialsOf, slugFor, type OcDivision, type OcMember } from '@/lib/ocRoster'

const CONFETTI_COLORS = ['#c8002a', '#0055ff', '#e0006e', '#b86800', '#007a3d', '#6D3B8E']

function Confetti({ seed }: { seed: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: `${seed}-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 1 + Math.random() * 0.8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + Math.random() * 6,
      })),
    [seed],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="oc-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function MemberCard({ member, division, index, highlighted, onOpen }: { member: OcMember; division: OcDivision; index: number; highlighted: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${member.name}'s OC pass`}
      className="relative block w-full overflow-hidden border bg-white p-3 text-left transition-transform duration-150 hover:-translate-y-1 hover:rotate-[-1deg]"
      style={{
        borderColor: highlighted ? 'var(--news-red)' : 'rgba(26,22,18,.16)',
        boxShadow: highlighted ? '0 0 0 3px rgba(200,0,42,.18)' : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute right-1 top-0 font-[family-name:var(--font-serif)] text-4xl font-black"
        style={{ opacity: 0.06 }}
        aria-hidden
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div
        className="mb-2 flex h-11 w-11 items-center justify-center font-[family-name:var(--font-serif)] text-base font-black"
        style={{ background: `${division.color}18`, color: division.color }}
        aria-hidden
      >
        {initialsOf(member.name)}
      </div>

      <div className="font-[family-name:var(--font-serif)] text-[15px] font-bold leading-tight" style={{ color: 'var(--news-ink)' }}>
        {member.name}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.08em] opacity-60" style={{ fontFamily: 'var(--font-os)' }}>
        {member.year} year · {member.branch}
      </div>
      <div className="mt-1.5 text-[9px] uppercase tracking-[0.1em]" style={{ color: division.color, fontFamily: 'var(--font-os)' }}>
        ★ {aliasFor(division.id, member.name)}
      </div>
    </button>
  )
}


/** Shareable "press pass" — the payoff for finding yourself on the wall. */
function OcPass({ slug, onClose }: { slug: string; onClose: () => void }) {
  const found = findBySlug(slug)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  if (!found) return null
  const { member, division } = found
  const alias = aliasFor(division.id, member.name)

  const copyLink = async () => {
    const url = `${window.location.origin}/oc?me=${slug}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      try {
        document.execCommand('copy')
      } catch {
        /* clipboard unavailable — the URL is already in the address bar */
      }
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // Deterministic "barcode" so a pass always looks identical.
  let h = 0
  for (let i = 0; i < member.name.length; i++) h = (h * 31 + member.name.charCodeAt(i)) >>> 0
  const bars = Array.from({ length: 26 }).map((_, i) => 2 + ((h >> (i % 26)) % 4))

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,22,18,.85)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} — OC press pass`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] overflow-hidden border-2 bg-white"
        style={{ borderColor: 'var(--news-ink)', boxShadow: '8px 8px 0 rgba(0,0,0,.35)' }}
      >
        <div className="h-2.5" style={{ background: division.color }} />

        {/* lanyard slot */}
        <div className="flex justify-center pt-4">
          <div className="h-2 w-16 rounded-full" style={{ background: 'rgba(26,22,18,.18)' }} />
        </div>

        <div className="px-6 pb-3 pt-4 text-center">
          <div className="text-[8px] uppercase tracking-[0.3em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
            The Coding Club · NMIMS Shirpur
          </div>
          <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
            Organising Committee 2026–27
          </div>
        </div>

        <div className="border-y border-dashed px-6 py-5 text-center" style={{ borderColor: 'rgba(26,22,18,.25)' }}>
          <div
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center font-[family-name:var(--font-serif)] text-2xl font-black"
            style={{ background: `${division.color}18`, color: division.color }}
            aria-hidden
          >
            {initialsOf(member.name)}
          </div>
          <div className="font-[family-name:var(--font-serif)] text-2xl font-black leading-tight">{member.name}</div>
          <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: division.color, fontFamily: 'var(--font-os)' }}>
            ★ {alias}
          </div>
        </div>

        <dl className="px-6 py-4 text-[10px] uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-os)' }}>
          {[
            ['Division', division.name],
            ['Year', `${member.year} year`],
            ['Branch', member.branch],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b py-1.5 last:border-0" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
              <dt style={{ color: 'rgba(26,22,18,.45)' }}>{k}</dt>
              <dd className="font-bold" style={{ color: 'var(--news-ink)' }}>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-end justify-center gap-[2px] px-6 pb-2" aria-hidden>
          {bars.map((w, i) => (
            <span key={i} style={{ width: w, height: i % 3 === 0 ? 30 : 24, background: 'var(--news-ink)' }} />
          ))}
        </div>
        <div className="pb-4 text-center text-[8px] uppercase tracking-[0.25em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
          Member · Class of 2026–27
        </div>

        <div className="flex border-t" style={{ borderColor: 'var(--news-ink)' }}>
          <button
            onClick={copyLink}
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
          >
            {copied ? '✓ Link copied' : 'Copy my link'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ fontFamily: 'var(--font-os)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function OcRosterPage() {
  const [query, setQuery] = useState('')
  const [activeDivision, setActiveDivision] = useState<string>('all')
  const [confettiSeed, setConfettiSeed] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const lastCelebrated = useRef<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [passSlug, setPassSlug] = useState<string | null>(null)
  const didInit = useRef(false)

  // A shared ?me=… link opens that member's pass on arrival.
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    const me = searchParams.get('me')
    if (me && findBySlug(me)) {
      setPassSlug(me)
      setConfettiSeed((n) => n + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1700)
    }
  }, [searchParams])

  const openPass = (name: string) => {
    const slug = slugFor(name)
    setPassSlug(slug)
    setSearchParams({ me: slug }, { replace: true })
  }

  const closePass = () => {
    setPassSlug(null)
    setSearchParams({}, { replace: true })
  }

  const firstYears = useMemo(
    () => OC_DIVISIONS.reduce((n, d) => n + d.members.filter((m) => m.year === '1st').length, 0),
    [],
  )

  const q = query.trim().toLowerCase()

  // Divisions narrowed by the chips, then by the search box.
  const visible = useMemo(() => {
    const byChip = activeDivision === 'all' ? OC_DIVISIONS : OC_DIVISIONS.filter((d) => d.id === activeDivision)
    if (!q) return byChip.map((d) => ({ division: d, members: d.members }))
    return byChip
      .map((d) => ({ division: d, members: d.members.filter((m) => m.name.toLowerCase().includes(q)) }))
      .filter((g) => g.members.length > 0)
  }, [activeDivision, q])

  const matches = useMemo(() => (q ? visible.reduce((n, g) => n + g.members.length, 0) : 0), [visible, q])

  const single = useMemo(() => {
    if (!q || matches !== 1) return null
    for (const g of visible) {
      if (g.members.length === 1) return { member: g.members[0], division: g.division }
    }
    return null
  }, [visible, matches, q])

  // Fire the celebration once per newly-found person, not on every keystroke.
  useEffect(() => {
    const name = single?.member.name ?? null
    if (!name) {
      lastCelebrated.current = null
      return
    }
    if (lastCelebrated.current === name) return
    lastCelebrated.current = name
    setConfettiSeed((s) => s + 1)
    setShowConfetti(true)
    const t = setTimeout(() => setShowConfetti(false), 1700)
    return () => clearTimeout(t)
  }, [single])

  const nothingFound = q.length > 0 && matches === 0

  return (
    <section className="mx-auto max-w-[1150px] px-5 py-12 sm:px-10">
      {passSlug && <OcPass slug={passSlug} onClose={closePass} />}

      {/* MASTHEAD */}
      <header className="mb-8 border-b-2 pb-7" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Organising Committee 2026–27 · Official Roll Call
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.6rem,7vw,4.5rem)' }}>
          The Class of
          <br />
          <span style={{ color: 'var(--news-red)' }}>2026–27.</span>
        </h1>
        <p className="mt-5 text-base font-semibold leading-relaxed" style={{ color: 'rgba(26,22,18,.75)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          {OC_TOTAL} students. {OC_DIVISIONS.length} divisions. One very ambitious year ahead. If your name is on this page — congratulations, you made it.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { n: OC_TOTAL, label: 'Members' },
            { n: OC_DIVISIONS.length, label: 'Divisions' },
            { n: firstYears, label: 'First-years' },
          ].map((s) => (
            <div key={s.label} className="border bg-white p-3 text-center" style={{ borderColor: 'rgba(26,22,18,.14)' }}>
              <div className="font-[family-name:var(--font-serif)] text-3xl font-black" style={{ color: 'var(--news-red)' }}>
                {s.n}
              </div>
              <div className="mt-0.5 text-[9px] uppercase tracking-[0.15em] opacity-60" style={{ fontFamily: 'var(--font-os)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* FIND YOUR NAME */}
      <section
        className="relative mb-10 border-[3px] border-double p-5 sm:p-7"
        style={{ borderColor: 'var(--news-ink)', background: '#fff', boxShadow: '5px 5px 0 rgba(26,22,18,.12)' }}
      >
        {showConfetti && <Confetti seed={confettiSeed} />}

        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white"
          style={{ background: 'var(--news-red)', fontFamily: 'var(--font-os)' }}
        >
          ★ Find Yourself ★
        </div>

        <div className="relative mt-2">
          <label htmlFor="oc-search" className="mb-2 block text-center text-[11px] uppercase tracking-[0.15em] opacity-60" style={{ fontFamily: 'var(--font-os)' }}>
            Type your name — then tap your card for a shareable pass
          </label>
          <input
            id="oc-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your name…"
            className="w-full border-[1.5px] bg-white px-4 py-3 text-lg outline-none transition-colors"
            style={{ borderColor: query ? 'var(--news-red)' : 'rgba(26,22,18,.45)', color: 'var(--news-ink)' }}
          />

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>
            {q ? (
              <span style={{ color: nothingFound ? 'var(--news-red)' : 'rgba(26,22,18,.6)' }}>
                {nothingFound ? 'No one by that name — check your spelling?' : `${matches} ${matches === 1 ? 'match' : 'matches'}`}
              </span>
            ) : (
              <span className="opacity-50">Showing all {OC_TOTAL} members</span>
            )}
            {query && (
              <button onClick={() => setQuery('')} className="underline hover:text-[var(--news-red)]">
                Clear
              </button>
            )}
          </div>

          {single && (
            <div className="mt-4 border-t pt-4 text-center" style={{ borderColor: 'rgba(26,22,18,.12)' }}>
              <div className="font-[family-name:var(--font-serif)] text-xl font-black sm:text-2xl">
                🎉 Found you, {single.member.name.split(' ')[0]}! You're on the {single.division.name} desk.
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-[0.15em]" style={{ color: single.division.color, fontFamily: 'var(--font-os)' }}>
                Codename — ★ {aliasFor(single.division.id, single.member.name)}
              </div>
              <button
                onClick={() => openPass(single.member.name)}
                className="cc-hover mt-4 inline-block px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                style={{ background: 'var(--news-red)', fontFamily: 'var(--font-os)' }}
              >
                Get my press pass →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DIVISION CHIPS */}
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveDivision('all')}
          className="border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: 'var(--font-os)',
            background: activeDivision === 'all' ? 'var(--news-ink)' : 'transparent',
            color: activeDivision === 'all' ? '#fff' : 'var(--news-ink)',
            borderColor: 'var(--news-ink)',
          }}
        >
          All · {OC_TOTAL}
        </button>
        {OC_DIVISIONS.map((d) => {
          const on = activeDivision === d.id
          return (
            <button
              key={d.id}
              onClick={() => setActiveDivision(d.id)}
              className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors"
              style={{
                fontFamily: 'var(--font-os)',
                background: on ? 'var(--news-ink)' : 'transparent',
                color: on ? '#fff' : 'var(--news-ink)',
                borderColor: on ? 'var(--news-ink)' : 'rgba(26,22,18,.3)',
              }}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.short} · {d.pending ? 'soon' : d.members.length}
            </button>
          )
        })}
      </div>

      {/* DIVISION SECTIONS */}
      {nothingFound ? (
        <p className="py-14 text-center text-sm opacity-60" style={{ fontFamily: 'var(--font-os)' }}>
          Nobody matches that — try a shorter search.
        </p>
      ) : (
        <div className="space-y-12">
          {visible.map(({ division, members }) => (
            <section key={division.id}>
              <div className="mb-4 flex items-stretch gap-3">
                <div className="w-1.5 shrink-0" style={{ background: division.color }} aria-hidden />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold">{division.name}</h2>
                    <span
                      className="px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em]"
                      style={{ background: `${division.color}14`, color: division.color, fontFamily: 'var(--font-os)' }}
                    >
                      {division.pending ? 'Coming soon' : `${members.length} member${members.length === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>
                    {division.blurb}
                  </p>
                </div>
              </div>

              {division.pending ? (
                <div
                  className="border-2 border-dashed p-8 text-center"
                  style={{ borderColor: 'rgba(26,22,18,.3)', background: 'rgba(26,22,18,.02)' }}
                >
                  <div className="font-[family-name:var(--font-serif)] text-2xl font-black">Roster loading…</div>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
                    Event Management selections are being finalised — this wall gets updated the moment they're in.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="oc-pulse inline-block h-2 w-2 rounded-full"
                        style={{ background: division.color, animationDelay: `${i * 0.22}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {members.map((m) => (
                    <MemberCard
                      key={m.name}
                      member={m}
                      division={division}
                      index={division.members.indexOf(m)}
                      highlighted={q.length > 0}
                      onOpen={() => openPass(m.name)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-14 border-t pt-5 text-sm leading-relaxed" style={{ borderColor: 'rgba(26,22,18,.2)', color: 'rgba(26,22,18,.7)', fontFamily: 'var(--font-os)' }}>
        Congratulations to every member of the 2026–27 Organising Committee. Tap any card to open your press pass and share it.{' '}
        <Link to="/team" className="underline hover:text-[var(--news-red)]" style={{ color: 'var(--news-red)' }}>
          Meet the core team →
        </Link>{' '}
        ·{' '}
        <Link to="/portfolios" className="underline hover:text-[var(--news-red)]" style={{ color: 'var(--news-red)' }}>
          See the Freshers' Top 10 →
        </Link>
      </div>
    </section>
  )
}
