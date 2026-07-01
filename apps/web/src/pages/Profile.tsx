import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useApp } from '@/store/useApp'

interface ProfileData {
  user: {
    _id: string
    name: string
    email: string
    department: 'dsa' | 'web' | 'sec'
    year: number
    branch: string
    githubHandle?: string
    xp: number
    role: string
  }
  registrations: any[]
  solves: any[]
  submissions: any[]
  badges: any[]
  activity: Record<string, number>
}

export function ProfilePage() {
  const loggedInUser = useApp((s) => s.user)

  // Fetch full profile details
  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await api.get('/profile')
      return res.data
    },
    enabled: !!loggedInUser,
  })

  if (!loggedInUser) {
    return (
      <section className="mx-auto max-w-[800px] px-5 py-24 text-center sm:px-10">
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Session Intercept
        </div>
        <h1 className="mb-4 font-[family-name:var(--font-serif)] font-black text-3xl leading-none">
          Dossier Locked
        </h1>
        <p className="mx-auto max-w-[480px] text-sm italic opacity-60">
          You need to be signed in to view your student portfolio, earned badges, and contribution heatmaps.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block border px-6 py-2.5 text-[10px] uppercase tracking-[0.14em] transition-colors hover:bg-[var(--news-ink)] hover:text-white"
          style={{ borderColor: 'var(--news-ink)', color: 'var(--news-ink)' }}
        >
          Sign In →
        </a>
      </section>
    )
  }


  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
        <p className="mt-2 text-[10px] uppercase tracking-[0.15em] opacity-65" style={{ fontFamily: 'var(--font-os)' }}>Retrieving dossier...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center text-red-800">
        <p className="font-bold">Failed to synchronize profile dossier.</p>
        <p className="text-xs mt-1">Make sure you are connected to the network.</p>
      </div>
    )
  }

  const { user, registrations, solves, submissions, badges, activity } = profile

  return (
    <>
      <header className="mx-auto max-w-5xl px-5 pb-6 pt-10 text-center sm:px-10">
        <div className="mb-2 text-[9px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § STUDENT DOSSIER · CONFIDENTIAL
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
          {user.name.split(' ')[0]}’s <span style={{ color: 'var(--news-red)' }}>Dossier</span>
        </h1>
      </header>

      {/* Main Grid */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Column 1: Info & XP Card */}
          <div className="md:col-span-1 space-y-6">
            {/* Identity Card */}
            <div className="border p-5 relative overflow-hidden" style={{ borderColor: 'var(--news-ink)' }}>
              <div className="absolute top-0 right-0 px-2 py-0.5 text-[8px] uppercase font-bold text-white bg-[var(--news-red)]" style={{ fontFamily: 'var(--font-os)' }}>
                {user.role}
              </div>
              <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold leading-tight mb-4">{user.name}</h2>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider" style={{ fontFamily: 'var(--font-os)' }}>Email Address</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider" style={{ fontFamily: 'var(--font-os)' }}>Track / Focus</span>
                  <span className="font-semibold uppercase">{user.department} Track</span>
                </div>
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider" style={{ fontFamily: 'var(--font-os)' }}>Academic Year & Branch</span>
                  <span className="font-semibold">Year {user.year} · {user.branch}</span>
                </div>
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider" style={{ fontFamily: 'var(--font-os)' }}>GitHub Handle</span>
                  {user.githubHandle ? (
                    <a href={`https://github.com/${user.githubHandle}`} target="_blank" rel="noreferrer" className="font-semibold underline hover:text-[var(--news-red)]">
                      @{user.githubHandle}
                    </a>
                  ) : (
                    <span className="italic opacity-40">Not connected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Gamified Score Card */}
            <div className="border p-5 text-center" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.01)' }}>
              <div className="text-[10px] uppercase tracking-[0.15em] opacity-60" style={{ fontFamily: 'var(--font-os)' }}>Accumulated Power</div>
              <div className="my-2 font-[family-name:var(--font-serif)] text-5xl font-black" style={{ color: 'var(--news-red)' }}>{user.xp}</div>
              <div className="text-[9px] uppercase tracking-[0.1em] font-bold" style={{ fontFamily: 'var(--font-os)' }}>Experience Points (XP)</div>
            </div>

            {/* Badges Dock */}
            <div className="border p-5" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              <h3 className="mb-3 font-[family-name:var(--font-serif)] text-lg font-bold border-b pb-1">Awarded Badges</h3>
              {badges.length === 0 ? (
                <p className="text-xs italic opacity-50">No badges awarded yet. Complete challenges to earn them!</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((b: any) => (
                    <div key={b._id} className="border p-2 text-center" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                      <div className="mx-auto w-10 h-10 flex items-center justify-center bg-black/[0.03] rounded-full border mb-1.5" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                        <span className="text-lg">🏅</span>
                      </div>
                      <div className="text-[10px] font-bold leading-tight">{b.badgeId?.name}</div>
                      <div className="text-[8px] opacity-60 mt-0.5 leading-none">
                        {b.badgeId?.criteria?.description || 'Achievement'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2 & 3: Activity, Submissions, Registrations */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Heatmap Section */}
            <div className="border p-5" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              <h3 className="mb-4 font-[family-name:var(--font-serif)] text-lg font-bold border-b pb-1">Contribution Ledger</h3>
              <ContributionHeatmap activity={activity} />
            </div>

            {/* Event Registrations */}
            <div className="border p-5" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              <h3 className="mb-4 font-[family-name:var(--font-serif)] text-lg font-bold border-b pb-1">Registered Lines</h3>
              {registrations.length === 0 ? (
                <p className="text-xs italic opacity-50">You are not registered for any active events.</p>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg: any) => (
                    <div key={reg._id} className="flex justify-between items-center border p-3.5" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                      <div>
                        <h4 className="font-bold text-sm">{reg.eventId?.title}</h4>
                        <div className="text-[10px] opacity-60 uppercase mt-0.5">
                          {reg.eventId?.type} · Track: {reg.eventId?.department?.toUpperCase()}
                        </div>
                        {reg.teamName && (
                          <div className="text-[10px] font-bold mt-1" style={{ color: 'var(--news-red)' }}>
                            Team: {reg.teamName}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/ticket/${reg._id}`}
                          className="px-3 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white"
                          style={{ fontFamily: 'var(--font-os)', background: 'var(--news-red)' }}
                        >
                          📱 View Ticket
                        </Link>
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:7860'}/registrations/${reg._id}/ticket`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-ink)] hover:bg-black"
                          style={{ fontFamily: 'var(--font-os)' }}
                        >
                          🎟 PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="border p-5" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              <h3 className="mb-4 font-[family-name:var(--font-serif)] text-lg font-bold border-b pb-1">Submission Log</h3>
              {submissions.length === 0 && solves.length === 0 ? (
                <p className="text-xs italic opacity-50">No submissions recorded in this portfolio.</p>
              ) : (
                <div className="space-y-3">
                  {/* DSA Submissions */}
                  {submissions.slice(0, 5).map((sub: any) => {
                    const isAC = sub.verdict === 'AC';
                    return (
                      <div key={sub._id} className="flex justify-between items-center border-b pb-2 text-xs" style={{ borderColor: 'rgba(26,22,18,.07)' }}>
                        <div>
                          <div className="font-bold">{sub.problemId?.title || 'Coding Problem'}</div>
                          <div className="text-[9px] opacity-50 mt-0.5">
                            Language: <span className="uppercase">{sub.language}</span> · {new Date(sub.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: isAC ? '#e2f7eb' : '#fde7e7',
                              color: isAC ? '#1b5e20' : '#b71c1c',
                            }}
                          >
                            {sub.verdict}
                          </span>
                          <span className="font-bold">{isAC ? `+${(sub.problemId?.difficulty || 1) * 100} XP` : '0 XP'}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* CTF Solves */}
                  {solves.slice(0, 5).map((solve: any) => (
                    <div key={solve._id} className="flex justify-between items-center border-b pb-2 text-xs" style={{ borderColor: 'rgba(26,22,18,.07)' }}>
                      <div>
                        <div className="font-bold">{solve.challengeId?.title || 'CTF Challenge'}</div>
                        <div className="text-[9px] opacity-50 mt-0.5">
                          Category: {solve.challengeId?.category} · Solve: {new Date(solve.solvedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                          SOLVED
                        </span>
                        <span className="font-bold">+{solve.pointsAwarded} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}

// HEATMAP DRAW COMPONENT
function ContributionHeatmap({ activity }: { activity: Record<string, number> }) {
  // Generate dates for the last 365 days, ending on today
  const today = new Date()
  const dates: Date[] = []
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    dates.push(d)
  }

  // Group by weeks for the grid (each week is a column of 7 days)
  // To keep it simple, we can group array index: dates
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Pad the first week if the oldest day is not a Sunday (getDay = 0)
  const firstDayOfWeek = dates[0].getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    const dummy = new Date(dates[0])
    dummy.setDate(dates[0].getDate() - (firstDayOfWeek - i))
    currentWeek.push(dummy)
  }

  dates.forEach((date) => {
    currentWeek.push(date)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    // Pad last week to 7 days
    const lastDayOfWeek = currentWeek[currentWeek.length - 1].getDay()
    for (let i = lastDayOfWeek + 1; i <= 6; i++) {
      const dummy = new Date(currentWeek[currentWeek.length - 1])
      dummy.setDate(currentWeek[currentWeek.length - 1].getDate() + (i - lastDayOfWeek))
      currentWeek.push(dummy)
    }
    weeks.push(currentWeek)
  }

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'rgba(26,22,18,.04)'
    if (count === 1) return 'rgba(224,0,0,0.25)'
    if (count === 2) return 'rgba(224,0,0,0.5)'
    if (count === 3) return 'rgba(224,0,0,0.75)'
    return 'rgba(224,0,0,1)' // 4+
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-[3px] min-w-[650px] py-2">
        {/* Render columns (weeks) */}
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-[3px]">
            {week.map((day, dIdx) => {
              const dateString = day.toISOString().split('T')[0]
              // Check if date falls in dates range, otherwise it's padding
              const isPadding = day < dates[0] || day > dates[dates.length - 1]
              const count = isPadding ? 0 : (activity[dateString] || 0)

              return (
                <div
                  key={dIdx}
                  className="w-[10px] h-[10px] transition-colors relative group"
                  style={{
                    backgroundColor: isPadding ? 'transparent' : getIntensityColor(count),
                    outline: isPadding ? 'none' : '1px solid rgba(26,22,18,.06)'
                  }}
                  title={isPadding ? undefined : `${dateString}: ${count} activity/activities`}
                />
              )
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.1em] mt-3 opacity-60" style={{ fontFamily: 'var(--font-os)' }}>
        <span>Past Year Calendar Feed</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 outline outline-1 outline-black/[0.06]" style={{ backgroundColor: 'rgba(26,22,18,.04)' }} />
          <div className="w-2.5 h-2.5 outline outline-1 outline-black/[0.06]" style={{ backgroundColor: 'rgba(224,0,0,0.25)' }} />
          <div className="w-2.5 h-2.5 outline outline-1 outline-black/[0.06]" style={{ backgroundColor: 'rgba(224,0,0,0.5)' }} />
          <div className="w-2.5 h-2.5 outline outline-1 outline-black/[0.06]" style={{ backgroundColor: 'rgba(224,0,0,0.75)' }} />
          <div className="w-2.5 h-2.5 outline outline-1 outline-black/[0.06]" style={{ backgroundColor: 'rgba(224,0,0,1)' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
