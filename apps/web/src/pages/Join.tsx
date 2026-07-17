import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GOOGLE_FORM_ACTION, GOOGLE_FORM_VIEW, RECRUIT_FIELDS, type RecruitField } from '@/lib/recruitForm'
import { SOCIAL } from '@/lib/content'

const IFRAME_NAME = 'cc-gform-sink'

const TICKER_UNIT = '★ ORGANISING COMMITTEE 2026–27 · APPLICATIONS OPEN · FIRST YEARS ESPECIALLY WELCOME · NO EXPERIENCE NEEDED · '

const PERKS = [
  {
    n: '01',
    title: 'Zero experience needed',
    desc: 'We recruit for curiosity and commitment. Every skill you’ll need is taught inside the club.',
  },
  {
    n: '02',
    title: 'Mentored by seniors',
    desc: 'Work directly with division leads who’ve shipped real events, real platforms, real CTFs.',
  },
  {
    n: '03',
    title: 'Real bylines, real credit',
    desc: 'Certificates, backstage access at flagship events, and your name on work that actually ships.',
  },
]

const DIVISIONS = [
  { name: 'Event Management', desc: 'Planning, scheduling, logistics, and execution of tech events across campuses.', leads: 'Nishtha Ghatiya & Sharva Shenoy' },
  { name: 'Web Development', desc: 'Engineering core club infrastructure, platforms, and interactive dashboards.', leads: 'Panth Haveliwala, Jay Damani & Ishan Dadape' },
  { name: 'Cybersecurity', desc: 'Leading CTFs, security audits, training tracks, and infrastructure defense.', leads: 'Kushal Khadse & Parth Pawar' },
  { name: 'Documentation & PR', desc: 'Crafting official publications, event summaries, and club press relations.', leads: 'Yash Bharadwaj & Chahat Saraf' },
  { name: 'Marketing & Sponsorships', desc: 'Managing corporate relations, funding acquisitions, and campus outreach.', leads: 'Atharva Khandelwal & Priyansh Jain' },
  { name: 'Creative & Social Media', desc: 'Designing brand guidelines, visual assets, and high-impact digital presence.', leads: 'Shlok Patel & Disha Bhagat' },
]

const inputClass =
  'w-full border-[1.5px] bg-white px-3.5 py-3 text-base text-[var(--news-ink)] outline-none transition-[border-color,box-shadow] border-[rgba(26,22,18,.45)] focus:border-[var(--news-red)] focus:shadow-[inset_0_0_0_1px_var(--news-red)]'

function FieldLabel({ f }: { f: RecruitField }) {
  return (
    <label htmlFor={f.entry} className="mb-1.5 block text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}>
      {f.label} {f.required && <span style={{ color: 'var(--news-red)' }}>*</span>}
    </label>
  )
}

function RecruitFieldInput({ f }: { f: RecruitField }) {
  if (f.type === 'paragraph') {
    return (
      <textarea id={f.entry} name={f.entry} required={f.required} rows={5} placeholder={f.placeholder} className={inputClass} />
    )
  }
  if (f.type === 'dropdown') {
    return (
      <select id={f.entry} name={f.entry} required={f.required} defaultValue="" className={inputClass}>
        <option value="" disabled>Select…</option>
        {f.options!.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    )
  }
  if (f.type === 'radio') {
    return (
      <div className="flex flex-wrap gap-2">
        {f.options!.map((o) => (
          <label key={o} className="oc-radio cc-hover flex cursor-pointer items-center gap-2 border-[1.5px] bg-white px-4 py-2 text-base text-[var(--news-ink)] transition-colors border-[rgba(26,22,18,.45)]">
            <input type="radio" name={f.entry} value={o} required={f.required} className="accent-[var(--news-red)]" />
            {o}
          </label>
        ))}
      </div>
    )
  }
  return (
    <input id={f.entry} name={f.entry} type={f.type} required={f.required} placeholder={f.placeholder} className={inputClass} />
  )
}

export function JoinPage() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const willSubmit = useRef(false)

  // The form posts natively into a hidden iframe (no CORS issues). When the
  // iframe finishes loading *after* a submit, Google has recorded the response.
  const handleIframeLoad = () => {
    if (willSubmit.current) {
      willSubmit.current = false
      setSubmitting(false)
      setDone(true)
    }
  }

  const sections: string[] = []
  for (const f of RECRUIT_FIELDS) {
    const s = f.section ?? ''
    if (!sections.includes(s)) sections.push(s)
  }

  if (done) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-10">
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Application received
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.95]" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>
          Stop the presses — you're in. ✓
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
          Your response has been recorded. Our team will reach out on WhatsApp or email with next steps — keep an eye on your inbox.
        </p>
        <Link to="/events" className="mt-8 inline-block text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--news-red)' }}>
          ← Meanwhile, see what we're up to
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:px-10">
      {/* TICKER */}
      <div className="mb-8 -mx-5 overflow-hidden py-1.5 sm:-mx-10" style={{ background: 'var(--news-red)' }}>
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 18s linear infinite' }}>
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="px-4 text-[10px] uppercase tracking-wide text-white" style={{ fontFamily: 'var(--font-os)' }}>
                  {TICKER_UNIT}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MASTHEAD HEADER */}
      <header className="relative mb-10 border-b-2 pb-8" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
            § Recruitment 2026 · Organising Committee
          </div>
          <div className="inline-flex items-center gap-1.5 border px-2 py-0.5 text-[9px] uppercase tracking-[0.15em]" style={{ borderColor: 'rgba(200,0,42,.35)', color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
            <span className="oc-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--news-red)' }} />
            Now Open
          </div>
        </div>

        <div className="oc-stamp absolute right-0 top-0 hidden px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.15em] sm:block">
          Apply Now
        </div>

        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.6rem,7vw,4.5rem)' }}>
          Coding Club NMIMS
          <br />
          <span style={{ color: 'var(--news-red)' }}>OC Recruitment 2026–27</span>
        </h1>

        <p className="mt-5 text-base leading-relaxed font-semibold" style={{ color: 'rgba(26,22,18,.75)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Applications for the 2026–27 Organising Committee are now open. First-year students are especially encouraged to apply — no prior experience is required.
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
          Organising Committee members work directly with the core team — managing events, developing the club platform, running CTFs, and handling the club's communications — with structured training provided throughout the year.
        </p>
      </header>

      {/* PERKS STRIP */}
      <section className="mb-12">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
          Why first-years love it here
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.n} className="border p-4" style={{ borderColor: 'rgba(26,22,18,.12)', background: 'rgba(26,22,18,.02)' }}>
              <div className="font-[family-name:var(--font-serif)] font-black text-2xl" style={{ color: 'var(--news-red)' }}>{p.n}</div>
              <h3 className="mt-1 font-[family-name:var(--font-serif)] font-bold text-base">{p.title}</h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIVISIONS GRID */}
      <section className="mb-14">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
          Pick your desk — six divisions, all recruiting
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DIVISIONS.map((d) => (
            <div
              key={d.name}
              className="flex flex-col justify-between border p-4 transition hover:-translate-y-0.5 border-[rgba(26,22,18,.12)] hover:border-[rgba(200,0,42,.45)]"
              style={{ background: 'rgba(26,22,18,.02)' }}
            >
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <h3 className="font-[family-name:var(--font-serif)] font-bold text-base" style={{ color: 'var(--news-ink)' }}>{d.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 uppercase tracking-wider" style={{ background: 'rgba(200,0,42,.08)', color: 'var(--news-red)', border: '1px solid rgba(200,0,42,.25)', fontFamily: 'var(--font-os)' }}>
                    <span className="oc-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--news-red)' }} />
                    Hiring
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,22,18,.55)' }}>{d.desc}</p>
                <div className="mt-3 text-[9px] uppercase tracking-[0.06em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                  Mentored by: <span className="font-bold" style={{ color: 'var(--news-ink)' }}>{d.leads}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE FORM */}
      <section className="relative border-[3px] border-double p-5 sm:p-8" style={{ borderColor: 'var(--news-ink)', background: '#fff', boxShadow: '5px 5px 0 rgba(26,22,18,.12)' }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white" style={{ background: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          ★ Help Wanted — Apply Within ★
        </div>

        <p className="mt-2 text-center text-base" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(26,22,18,.75)' }}>
          Takes about three minutes. All years welcome; first-years especially encouraged.
        </p>

        {/* hidden sink — Google's confirmation page loads here */}
        <iframe name={IFRAME_NAME} title="form-sink" onLoad={handleIframeLoad} className="hidden" aria-hidden />

        <form
          action={GOOGLE_FORM_ACTION}
          method="POST"
          target={IFRAME_NAME}
          onSubmit={() => {
            willSubmit.current = true
            setSubmitting(true)
          }}
          className="mt-6 space-y-8"
        >
          {sections.map((section) => (
            <div key={section}>
              <div className="mb-4 flex items-center gap-3">
                <span className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-os)', color: 'var(--news-ink)' }}>
                  <span style={{ color: 'var(--news-red)' }}>{section.split(' · ')[0]}</span>
                  {` · ${section.split(' · ').slice(1).join(' · ')}`}
                </span>
                <span className="h-px flex-1" style={{ background: 'rgba(200,0,42,.35)' }} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {RECRUIT_FIELDS.filter((f) => (f.section ?? '') === section).map((f) => (
                  <div key={f.entry} className={f.type === 'paragraph' || f.type === 'radio' ? 'sm:col-span-2' : ''}>
                    <FieldLabel f={f} />
                    <RecruitFieldInput f={f} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="oc-cta w-full px-10 py-4 text-[12px] uppercase tracking-[0.2em] text-white transition hover:brightness-90 disabled:opacity-60 sm:w-auto"
            style={{ background: 'var(--news-red)', fontFamily: 'var(--font-os)' }}
          >
            {submitting ? 'Filing your application…' : 'Submit Application →'}
          </button>
        </form>

        <div className="mt-5 text-center text-[11px]" style={{ fontFamily: 'var(--font-os)', color: 'rgba(26,22,18,.75)' }}>
          Prefer plain Google Forms?{' '}
          <a href={GOOGLE_FORM_VIEW} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--news-red)]">
            Open the form directly →
          </a>
        </div>
      </section>

      {/* FOOTER CONTACT BLOCK */}
      <div className="mt-12 border-t pt-4 text-sm leading-relaxed" style={{ borderColor: 'rgba(26,22,18,.2)', color: 'rgba(26,22,18,.7)', fontFamily: 'var(--font-os)' }}>
        Questions? Contact — Club Incharge: <strong>Jay Naik</strong> (9374488770) · <strong>Daksh Lalawat</strong> (9521175403)
        <br />
        <a href={`mailto:${SOCIAL.email}`} className="hover:text-[var(--news-red)]">{SOCIAL.email}</a>
      </div>
    </section>
  )
}
