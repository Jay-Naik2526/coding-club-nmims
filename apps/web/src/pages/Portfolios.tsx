import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

type Entry = { rank: number; name: string; url: string; shot: string }

const ENTRIES: Entry[] = [
  { rank: 1, name: 'Smit Patil', url: 'https://smit-os.netlify.app', shot: '/portfolio-shots/01-smit-patil.png' },
  { rank: 2, name: 'Aabhas Suryavanshi', url: 'https://aabhas-portfolio.ai.studio', shot: '/portfolio-shots/02-aabhas-suryavanshi.jpg' },
  { rank: 3, name: 'Divij Kothari', url: 'https://divijkothari.github.io/DivijKothari/AntiGraavityWebsite/', shot: '/portfolio-shots/03-divij-kothari.jpg' },
  { rank: 4, name: 'Dhanashree Laddha', url: 'https://dhani-l1311.github.io/Portfolio/', shot: '/portfolio-shots/04-dhanashree-laddha.jpg' },
  { rank: 5, name: 'Nilaya Maurya', url: 'https://nilayamaurya18-sys.github.io/portfolio/', shot: '/portfolio-shots/05-nilaya-maurya.jpg' },
  { rank: 6, name: 'Sahil Kachave', url: 'https://sahil-kachave-hl7l.vercel.app/', shot: '/portfolio-shots/06-sahil-kachave.jpg' },
  { rank: 7, name: 'Laavitr Sahgal', url: 'https://laavitrportfolio.netlify.app/#hero', shot: '/portfolio-shots/07-laavitr-sahgal.jpg' },
  { rank: 8, name: 'Aditi Talekar', url: 'https://adititalekar20.github.io/Portfolio_Aditi_Talekar/aditi-talekar-portfolio.html', shot: '/portfolio-shots/08-aditi-talekar.jpg' },
  { rank: 9, name: 'Jayesh Pralhad Banjara', url: 'https://jayeshbanjara12.github.io/jayeshbanjara12/', shot: '/portfolio-shots/09-jayesh-banjara.jpg' },
  { rank: 10, name: 'Akshit Singh', url: 'https://akshit-singh0700.github.io/Akshit_Singh_Portfolio/', shot: '/portfolio-shots/10-akshit-singh.jpg' },
]

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function PortfoliosPage() {
  const [active, setActive] = useState<Entry | null>(null)

  // Escape closes the preview; body scroll is locked while it's open.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [active])

  const winner = ENTRIES[0]
  const rest = ENTRIES.slice(1)

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-12 sm:px-10">
      {/* MASTHEAD HEADER */}
      <header className="mb-8 border-b-2 pb-6" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Freshers' Portfolio Challenge · Results Declared
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.6rem,7vw,4.5rem)' }}>
          Freshers'
          <br />
          <span style={{ color: 'var(--news-red)' }}>Top 10 Portfolios</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed font-semibold sm:text-lg" style={{ color: 'rgba(26,22,18,.75)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Ten first-year students, ten portfolios built from scratch. Judged on design, originality, and execution — here is the final ranking.
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
          Click any entry to preview the live site without leaving this page.
        </p>
      </header>

      {/* WINNER SPOTLIGHT */}
      <div
        className="relative mb-12 grid grid-cols-1 gap-0 border-[3px] border-double lg:grid-cols-[1.15fr_1fr]"
        style={{ borderColor: 'var(--news-ink)', background: '#fff', boxShadow: '6px 6px 0 rgba(26,22,18,.14)' }}
      >
        <div className="oc-stamp absolute right-4 top-4 z-10 hidden px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] sm:block" style={{ background: 'rgba(255,255,255,.85)', fontFamily: 'var(--font-os)' }}>
          1st Place
        </div>

        <button onClick={() => setActive(winner)} className="block w-full lg:border-r" style={{ borderColor: 'rgba(26,22,18,.12)' }} aria-label={`Preview ${winner.name}'s portfolio`}>
          <img src={winner.shot} alt={`${winner.name}'s portfolio homepage`} className="aspect-[16/10] w-full object-cover object-top" />
        </button>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <span className="mb-3 inline-block self-start px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white" style={{ background: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
            ★ Rank 01 — Winner
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl font-black leading-tight sm:text-4xl">{winner.name}</h2>
          <div className="mt-1.5 text-[11px] truncate" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
            {hostOf(winner.url)}
          </div>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgba(26,22,18,.7)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            Best in show — first place in the Freshers' Portfolio Challenge.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              onClick={() => setActive(winner)}
              className="cc-hover px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-white"
              style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
            >
              Preview site
            </button>
            <a
              href={winner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.12em] underline hover:text-[var(--news-red)]"
              style={{ fontFamily: 'var(--font-os)' }}
            >
              Open live site ↗
            </a>
          </div>
        </div>
      </div>

      {/* SECTION LABEL */}
      <div className="mb-5 flex items-center gap-3">
        <span className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}>
          The Rest of the Top Ten
        </span>
        <span className="h-px flex-1" style={{ background: 'rgba(200,0,42,.35)' }} />
      </div>

      {/* RANKS 2–10 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((e) => (
          <button
            key={e.rank}
            onClick={() => setActive(e)}
            className="cc-hover group overflow-hidden border text-left transition hover:-translate-y-1 hover:border-[rgba(200,0,42,.5)] hover:shadow-[4px_4px_0_rgba(26,22,18,.10)]"
            style={{ borderColor: 'rgba(26,22,18,.18)', background: '#fff' }}
          >
            <img
              src={e.shot}
              alt={`${e.name}'s portfolio homepage`}
              loading="lazy"
              className="aspect-[16/10] w-full border-b object-cover object-top"
              style={{ borderColor: 'rgba(26,22,18,.12)' }}
            />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <span className="font-[family-name:var(--font-serif)] text-3xl font-black leading-none" style={{ color: 'var(--news-red)' }}>
                  {pad(e.rank)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-serif)] text-lg font-bold leading-snug" style={{ color: 'var(--news-ink)' }}>
                    {e.name}
                  </div>
                  <div className="truncate text-[10px]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
                    {hostOf(e.url)}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                Preview →
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-14 border-t pt-5 text-sm leading-relaxed" style={{ borderColor: 'rgba(26,22,18,.2)', color: 'rgba(26,22,18,.7)', fontFamily: 'var(--font-os)' }}>
        Congratulations to every first-year who submitted. The Coding Club runs initiatives like this all year —{' '}
        <Link to="/join" className="underline hover:text-[var(--news-red)]" style={{ color: 'var(--news-red)' }}>
          applications for the Organising Committee are open
        </Link>
        .
      </div>

      {/* PREVIEW MODAL */}
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[900] flex items-center justify-center p-3 backdrop-blur-sm sm:p-6"
          style={{ background: 'rgba(26,22,18,.85)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[85vh] w-full max-w-[1200px] flex-col border-2 bg-white"
            style={{ borderColor: 'var(--news-ink)', boxShadow: '8px 8px 0 rgba(0,0,0,.35)' }}
          >
            {/* title bar */}
            <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ background: 'var(--news-ink)', color: 'var(--news-bg)', borderColor: 'var(--news-ink)' }}>
              <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                <span className="inline-block h-2.5 w-2.5" style={{ background: '#ff5f57' }} />
                <span className="inline-block h-2.5 w-2.5" style={{ background: '#febc2e' }} />
                <span className="inline-block h-2.5 w-2.5" style={{ background: '#28c840' }} />
              </span>
              <span className="min-w-0 flex-1 truncate text-center text-[10px] opacity-70" style={{ fontFamily: 'var(--font-os)' }}>
                {active.url}
              </span>
              <a
                href={active.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[10px] uppercase hover:text-[var(--news-red)]"
                style={{ fontFamily: 'var(--font-os)' }}
              >
                Open ↗
              </a>
              <button onClick={() => setActive(null)} aria-label="Close preview" className="shrink-0 px-1 text-[13px] leading-none hover:text-[var(--news-red)]">
                ✕
              </button>
            </div>

            {/* rank strip */}
            <div className="border-b px-4 py-1.5 text-[10px] uppercase tracking-[0.15em]" style={{ borderColor: 'rgba(26,22,18,.12)', color: 'rgba(26,22,18,.6)', fontFamily: 'var(--font-os)' }}>
              Rank {pad(active.rank)} · {active.name}
            </div>

            {/* live frame — the loading note sits behind it until the page paints */}
            <div className="relative flex-1">
              <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
                Loading live preview…
              </div>
              <iframe
                key={active.url}
                src={active.url}
                title={`${active.name}'s portfolio`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerPolicy="no-referrer"
                className="relative h-full w-full"
                style={{ background: '#fff' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
