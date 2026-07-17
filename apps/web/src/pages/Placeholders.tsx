import { Link } from 'react-router-dom'

function Stub({ title, phase, note }: { title: string; phase: string; note: string }) {
  return (
    <section className="mx-auto max-w-[900px] px-5 py-16 text-center sm:px-10">
      <div className="mb-2 text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
        {phase}
      </div>
      <h1 className="mb-4 font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>
        {title}
      </h1>
      <p className="mx-auto max-w-[520px] text-[15px] italic leading-[1.7]" style={{ color: 'rgba(26,22,18,.55)' }}>
        {note}
      </p>
      <Link to="/events" className="mt-6 inline-block text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)' }}>
        ← Back to editorial
      </Link>
    </section>
  )
}

export const LeaderboardPage = () => (
  <Stub title="The Standings" phase="§ Phase 8 — Coming Soon" note="Global & per-department rankings with a contribution heatmap and live socket updates during active contests." />
)
export const IdePage = () => (
  <Stub title="The Judge" phase="§ Phase 7 — Coming Soon" note="A Monaco-powered code editor wired to Judge0 — run against samples, submit against hidden tests, full verdict & timing." />
)
export const ProfilePage = () => (
  <Stub title="Your Dossier" phase="§ Phase 10 — Coming Soon" note="XP, badges, contribution heatmap, registered events, past submissions, and downloadable certificates." />
)
