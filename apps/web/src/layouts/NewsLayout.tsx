import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '@/store/useApp'
import { DEPTS, DEPT_ORDER } from '@/lib/depts'
import { useWipe } from '@/components/wipe-context'
import { SOCIAL } from '@/lib/content'

const NAV = [
  ['Competitions', '/events'],
  ['Rankings', '/leaderboard'],
  ['Team', '/team'],
  ['Join Us', '/join'],
] as const

export function NewsLayout() {
  const { dept, setDept, user, loading, logout } = useApp()
  const navigate = useNavigate()
  const { wipeTo } = useWipe()
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen pt-[26px]" style={{ background: 'var(--news-bg)', color: 'var(--news-ink)', fontFamily: 'var(--font-sans)' }}>
      {/* top os bar persists but in news mode */}
      <div
        className="fixed inset-x-0 top-0 z-[600] flex h-[26px] items-center px-3 text-[10px] tracking-[0.06em]"
        style={{ background: 'var(--news-ink)', color: 'rgba(255,255,255,.45)' }}
      >
        <span className="font-[family-name:var(--font-display)] text-[11px] text-white">CC</span>
        <button onClick={() => wipeTo('/')} className="ml-4 hover:text-white" style={{ color: 'var(--news-red)' }}>
          ← BACK TO OS
        </button>
        <span className="ml-auto hidden sm:inline">NMIMS SHIRPUR · CODING CLUB · 2026–27</span>
      </div>

      {/* masthead */}
      <header className="border-b-4 border-double px-5 pb-3 pt-6 sm:px-10" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="mb-1.5 flex justify-between text-[9px] tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
          <span>VOL. 05 — NO. 12 · NMIMS SHIRPUR · EST. 2019</span>
          <span className="hidden sm:inline">{today}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <button onClick={() => navigate('/events')} className="flex items-center gap-4 text-left">
            <img src="/logo.png" alt="Coding Club Logo" className="h-20 w-20 object-contain" />
            <div>
              <div className="font-[family-name:var(--font-serif)] font-black leading-[0.85] tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem,5.5vw,4.5rem)' }}>
                THE
                <br />
                CODING CLUB
              </div>
              <div className="mt-1.5 text-[9px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
                Shirpur Campus Edition
              </div>
            </div>
          </button>
          <div className="flex flex-wrap justify-end gap-1">
            {DEPT_ORDER.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className="cc-hover border px-2.5 py-[3px] text-[9px] uppercase tracking-[0.1em] transition-colors"
                style={{
                  borderColor: 'var(--news-ink)',
                  background: dept === d ? 'var(--news-ink)' : 'transparent',
                  color: dept === d ? 'var(--news-bg)' : 'var(--news-ink)',
                }}
              >
                {DEPTS[d].code}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* nav */}
      <nav className="mx-5 flex overflow-x-auto border-y sm:mx-10" style={{ borderColor: 'var(--news-ink)' }}>
        {NAV.map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className="whitespace-nowrap border-r px-4 py-[0.45rem] text-[10px] uppercase tracking-[0.1em] no-underline transition-colors"
            style={({ isActive }) => ({
              fontFamily: 'var(--font-os)',
              borderColor: 'rgba(26,22,18,.15)',
              background: isActive ? 'var(--news-ink)' : 'transparent',
              color: isActive ? 'var(--news-bg)' : 'rgba(26,22,18,.5)',
            })}
          >
            § {label}
          </NavLink>
        ))}
        {user && (
          <NavLink
            to="/profile"
            className="whitespace-nowrap border-r px-4 py-[0.45rem] text-[10px] uppercase tracking-[0.1em] no-underline transition-colors font-bold"
            style={({ isActive }) => ({
              fontFamily: 'var(--font-os)',
              borderColor: 'rgba(26,22,18,.15)',
              background: isActive ? 'var(--news-ink)' : 'transparent',
              color: isActive ? 'var(--news-bg)' : 'var(--news-red)',
            })}
          >
            § Dossier ({user.name.split(' ')[0]})
          </NavLink>
        )}
        <span className="flex-1" />
        {loading ? (
          <span className="whitespace-nowrap px-4 py-[0.45rem] text-[9px] uppercase tracking-[0.15em] opacity-45" style={{ fontFamily: 'var(--font-os)' }}>
            Connecting…
          </span>
        ) : user ? (
          <button
            onClick={logout}
            className="cc-hover whitespace-nowrap border-l px-4 py-[0.45rem] text-[10px] uppercase tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-os)', borderColor: 'rgba(26,22,18,.15)', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        ) : (
          <NavLink
            to="/login"
            className="cc-hover whitespace-nowrap border-l px-4 py-[0.45rem] text-[10px] uppercase tracking-[0.1em] no-underline font-bold"
            style={{ fontFamily: 'var(--font-os)', borderColor: 'rgba(26,22,18,.15)', color: 'var(--news-red)' }}
          >
            Sign In
          </NavLink>
        )}
        <button onClick={() => wipeTo('/')} className="whitespace-nowrap px-4 text-[10px] uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-os)', color: 'var(--news-red)' }}>
          ← Back to OS
        </button>
      </nav>

      <Outlet />

      <footer className="px-5 py-8 sm:px-10" style={{ background: 'var(--news-ink)', color: 'var(--news-bg)' }}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 pb-6">
          <div>
            <div className="mb-1.5 font-[family-name:var(--font-serif)] text-xl font-black">THE CODING CLUB</div>
            <div className="text-xs italic leading-[1.7]" style={{ color: 'rgba(243,239,229,.4)' }}>
              Code. Collaborate. Create. A student-driven tech community out of MPSTME, NMIMS.
            </div>
          </div>
          <div>
            <FootLabel>Departments</FootLabel>
            <FootList items={['DSA & Competitive Programming', 'Web Development', 'CyberSecurity']} />
          </div>
          <div>
            <FootLabel>Contact</FootLabel>
            <ul className="list-none">
              <FootLink href={`mailto:${SOCIAL.email}`}>{SOCIAL.email}</FootLink>
              <FootText>{SOCIAL.location}</FootText>
            </ul>
          </div>
          <div>
            <FootLabel>Connect</FootLabel>
            <ul className="list-none">
              <FootLink href={SOCIAL.linkedin}>LinkedIn</FootLink>
              <FootLink href={SOCIAL.instagram}>Instagram</FootLink>
              <FootLink href={SOCIAL.medium}>Medium</FootLink>
            </ul>
          </div>
        </div>
        <div className="border-t pt-4 text-center text-[9px] tracking-[0.08em]" style={{ borderColor: 'rgba(243,239,229,.15)', fontFamily: 'var(--font-os)' }}>
          <div style={{ color: 'rgba(243,239,229,.3)' }}>
            MPSTME · NMIMS · ALL RIGHTS RESERVED.
          </div>
          <div className="mt-1 font-semibold" style={{ color: 'var(--news-red)' }}>
            Website Engineered by Club Head Jay Naik
          </div>
        </div>
      </footer>
    </div>
  )
}

const FootLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li className="text-[9px] leading-[2.1] tracking-[0.04em]" style={{ fontFamily: 'var(--font-os)' }}>
    <a href={href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white" style={{ color: 'rgba(243,239,229,.45)' }}>
      {children}
    </a>
  </li>
)
const FootText = ({ children }: { children: React.ReactNode }) => (
  <li className="text-[9px] leading-[2.1] tracking-[0.04em]" style={{ color: 'rgba(243,239,229,.45)', fontFamily: 'var(--font-os)' }}>
    {children}
  </li>
)

const FootLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 text-[9px] uppercase tracking-[0.12em]" style={{ color: 'rgba(243,239,229,.3)', fontFamily: 'var(--font-os)' }}>
    {children}
  </div>
)
const FootList = ({ items }: { items: string[] }) => (
  <ul className="list-none">
    {items.map((i) => (
      <li key={i} className="text-[9px] leading-[2.1] tracking-[0.04em]" style={{ color: 'rgba(243,239,229,.45)', fontFamily: 'var(--font-os)' }}>
        {i}
      </li>
    ))}
  </ul>
)
