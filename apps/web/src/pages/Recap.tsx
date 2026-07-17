import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type ArchiveEvent, photoPath } from '@/lib/archive'
import { DEPTS } from '@/lib/depts'

const PhotoArc = lazy(() => import('@/three/PhotoArc').then((m) => ({ default: m.PhotoArc })))

export function Recap({ ev }: { ev: ArchiveEvent }) {
  const photos = Array.from({ length: ev.photoCount }, (_, i) => photoPath(ev.slug, i + 1))

  return (
    <article className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
      {/* header */}
      <header className="text-center">
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: ev.color, fontFamily: 'var(--font-os)' }}>
          § Archive · {ev.fest} · {DEPTS[ev.dept].code}
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.6rem,7vw,5rem)' }}>
          {ev.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-serif)] text-lg italic leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>
          {ev.tagline}
        </p>
        <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-y py-2 text-[10px] uppercase tracking-[0.12em]" style={{ borderColor: 'var(--news-ink)', color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
          <span>{ev.date}</span>
          <span>{ev.time}</span>
          <span>{ev.venue}</span>
        </div>
        <div className="mt-3 text-[11px]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
          {ev.bylineLabel}: <span style={{ color: 'var(--news-ink)' }}>{ev.byline.join(' · ')}</span>
        </div>
      </header>

      {/* 3D photo gallery hero */}
      <div className="relative mt-8 h-[300px] overflow-hidden rounded-xl sm:h-[400px]" style={{ background: 'radial-gradient(ellipse at 50% 40%, #15110c, #0b0a09)' }}>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(243,239,229,.4)' }}>Loading gallery…</div>}>
          <PhotoArc photos={photos} accent={ev.color} />
        </Suspense>
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(243,239,229,.45)' }}>
          ✦ drag your cursor · photos from the event ✦
        </div>
      </div>

      {/* editorial body */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="drop-cap text-[15px] leading-[1.85]" style={{ color: 'rgba(26,22,18,.78)' }}>
            <p>{ev.summary}</p>
          </div>

          <h2 className="mb-4 mt-10 border-b-[3px] pb-2 font-[family-name:var(--font-serif)] text-2xl font-black" style={{ borderColor: 'var(--news-ink)' }}>
            How it unfolded
          </h2>
          <ol className="relative ml-3 border-l" style={{ borderColor: 'rgba(26,22,18,.2)' }}>
            {ev.highlights.map((h, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative mb-6 pl-6"
              >
                <span className="absolute -left-[6px] top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: ev.color }} />
                {h.time && (
                  <div className="mb-1 text-[10px] uppercase tracking-[0.12em]" style={{ color: ev.color, fontFamily: 'var(--font-os)' }}>{h.time}</div>
                )}
                <div className="font-[family-name:var(--font-serif)] text-lg font-bold leading-tight">{h.head}</div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>{h.body}</p>
              </motion.li>
            ))}
          </ol>

          <div className="pull-q mt-6">{ev.conclusion}</div>
        </div>

        {/* photo gallery sidebar */}
        <aside>
          <div className="mb-3 text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>§ Gallery</div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {photos.map((src, i) => (
              <a key={src} href={src} target="_blank" rel="noreferrer" className="cc-hover block overflow-hidden border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                <img src={src} alt={`${ev.title} photo ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105" />
              </a>
            ))}
          </div>
        </aside>
      </div>

      <Link to="/events" className="mt-10 inline-block text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)' }}>
        ← Back to events
      </Link>
    </article>
  )
}
