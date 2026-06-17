import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GOOGLE_FORM_ACTION, RECRUIT_FIELDS } from '@/lib/recruitForm'
import { SOCIAL } from '@/lib/content'

const IFRAME_NAME = 'cc-gform-sink'

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

  if (done) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-10">
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Application received
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.95]" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>
          You're in the pile. ✓
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
          Thanks for applying to the Coding Club core committee. Your response was recorded — our team will reach out about the next round.
        </p>
        <Link to="/events" className="mt-8 inline-block text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--news-red)' }}>
          ← Back to events
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-5 py-12 sm:px-10">
      <header className="mb-8">
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Recruitment 2026 · Selection Process
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>
          Core Committee Applications
        </h1>
        <p className="mt-4 text-base leading-relaxed font-semibold" style={{ color: 'rgba(26,22,18,.75)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Welcome to the Coding Club Core Committee selection portal. We are seeking driven, committed students to coordinate our Event Management, Development, Security, Documentation, PR, and Creative divisions.
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(26,22,18,.6)' }}>
          Please complete all required fields below to register your application. Shortlisted candidates will be contacted directly for interview rounds.
        </p>
      </header>

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
        className="space-y-6"
      >
        {RECRUIT_FIELDS.map((f) => (
          <div key={f.entry}>
            <label htmlFor={f.entry} className="mb-1.5 block text-[11px] uppercase tracking-[0.1em]" style={{ color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
              {f.label} {f.required && <span style={{ color: 'var(--news-red)' }}>*</span>}
            </label>

            {f.type === 'paragraph' ? (
              <textarea id={f.entry} name={f.entry} required={f.required} rows={4} placeholder={f.placeholder} className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
            ) : f.type === 'dropdown' ? (
              <select id={f.entry} name={f.entry} required={f.required} defaultValue="" className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                <option value="" disabled>Select…</option>
                {f.options!.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : f.type === 'radio' ? (
              <div className="flex flex-wrap gap-2">
                {f.options!.map((o) => (
                  <label key={o} className="cc-hover flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                    <input type="radio" name={f.entry} value={o} required={f.required} className="accent-[var(--news-red)]" />
                    {o}
                  </label>
                ))}
              </div>
            ) : (
              <input id={f.entry} name={f.entry} type={f.type} required={f.required} placeholder={f.placeholder} className="w-full border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="cc-hover px-8 py-3 text-[11px] uppercase tracking-[0.14em] text-white disabled:opacity-60"
          style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
        >
          {submitting ? 'Submitting…' : 'Submit Application →'}
        </button>
      </form>

      <div className="mt-8 border-t pt-4 text-[11px] leading-relaxed" style={{ borderColor: 'rgba(26,22,18,.2)', color: 'rgba(26,22,18,.55)', fontFamily: 'var(--font-os)' }}>
        Questions? Contact — Club Incharge: <strong>Jay Naik</strong> (9374488770) · <strong>Daksh Lalawat</strong> (9521175403)
        <br />
        <a href={`mailto:${SOCIAL.email}`} className="hover:text-[var(--news-red)]">{SOCIAL.email}</a>
      </div>
    </section>
  )
}
