import { Link } from 'react-router-dom'
import { SOCIAL } from '@/lib/content'

export function JoinPage() {
  const divisions = [
    { name: 'Event Management', desc: 'Planning, scheduling, logistics, and execution of tech events across campuses.' },
    { name: 'Web Development', desc: 'Engineering core club infrastructure, platforms, and interactive dashboards.' },
    { name: 'Cybersecurity', desc: 'Leading CTFs, security audits, training tracks, and infrastructure defense.' },
    { name: 'Documentation & PR', desc: 'Crafting official publications, event summaries, and club press relations.' },
    { name: 'Marketing & Sponsorships', desc: 'Managing corporate relations, funding acquisitions, and campus outreach.' },
    { name: 'Creative & Social Media', desc: 'Designing brand guidelines, visual assets, and high-impact digital presence.' },
  ]

  return (
    <section className="mx-auto max-w-2xl px-5 py-12 sm:px-10">
      <header className="mb-8 border-b-2 pb-6" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Recruitment 2026 · Selection Process Complete
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9] mb-4" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>
          Core Committee Formed.
        </h1>
        <p className="mt-4 text-base leading-relaxed font-semibold" style={{ color: 'rgba(26,22,18,.75)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Thank you to everyone who applied. The recruitment window has now closed and the 2026–27 Organizing Crew is officially established.
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
          We received an exceptional pool of applicants this year, reflecting the strong technical and leadership potential of our student community. Following a comprehensive review and interview rounds, candidates have been selected and onboarded to run club activities.
        </p>
      </header>

      {/* Structured Divisions Details */}
      <div className="space-y-6">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
          Onboarded Divisions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {divisions.map((d) => (
            <div
              key={d.name}
              className="border p-4 flex flex-col justify-between"
              style={{ borderColor: 'rgba(26,22,18,.12)', background: 'rgba(26,22,18,.02)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-[family-name:var(--font-serif)] font-bold text-base" style={{ color: 'var(--news-ink)' }}>{d.name}</h3>
                  <span className="text-[8px] font-semibold px-1.5 py-0.5 uppercase tracking-wider" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)', fontFamily: 'var(--font-os)' }}>
                    Staffed
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t pt-8 text-center" style={{ borderColor: 'rgba(26,22,18,.12)' }}>
        <p className="text-sm" style={{ color: 'rgba(26,22,18,.6)' }}>
          Interested in learning more about the team behind the scenes?
        </p>
        <Link
          to="/team"
          className="cc-hover inline-block px-8 py-3 text-[11px] uppercase tracking-[0.14em] text-white"
          style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
        >
          Meet the Masthead & Team →
        </Link>
      </div>

      <div className="mt-12 border-t pt-4 text-[11px] leading-relaxed" style={{ borderColor: 'rgba(26,22,18,.2)', color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
        Questions? Contact — Club Incharge: <strong>Jay Naik</strong> (9374488770) · <strong>Daksh Lalawat</strong> (9521175403)
        <br />
        <a href={`mailto:${SOCIAL.email}`} className="hover:text-[var(--news-red)]">{SOCIAL.email}</a>
      </div>
    </section>
  )
}
