import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { io, Socket } from 'socket.io-client'

interface GlobalUser {
  _id: string
  name: string
  email: string
  department: 'dsa' | 'web' | 'sec'
  branch: string
  year: number
  githubHandle?: string
  xp: number
}

interface EventStandingsItem {
  registrationId?: string
  user?: GlobalUser
  teamName?: string
  leader?: GlobalUser
  members?: GlobalUser[]
  score: number
  lastSolvedAt: string
  solvedCount: number
  /** Present only for manually-judged events (round scores entered by an admin). */
  rounds?: { round: number; label: string; points: number }[]
}

export function LeaderboardPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'global' | 'event'>('global')
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('')
  const [ticker, setTicker] = useState<{ userName: string; challengeTitle: string; points: number; firstBlood: boolean; id: number }[]>([])

  // Fetch events list for dropdown
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events')
      return res.data
    }
  })

  const relevantEvents = events.filter((e: any) => e.status === 'live' || e.status === 'closed')

  // Auto-select first event if none selected
  useEffect(() => {
    if (relevantEvents.length > 0 && !selectedEventSlug) {
      setSelectedEventSlug(relevantEvents[0].slug)
    }
  }, [relevantEvents, selectedEventSlug])

  // Query global standings
  const { data: globalUsers = [], isLoading: globalLoading } = useQuery<GlobalUser[]>({
    queryKey: ['globalLeaderboard'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/global')
      return res.data
    },
    enabled: activeTab === 'global',
  })

  // Query specific event standings
  const { data: eventData, isLoading: eventLoading } = useQuery<{ type: 'SOLO' | 'TEAM'; manual?: boolean; standings: EventStandingsItem[] }>({
    queryKey: ['eventLeaderboard', selectedEventSlug],
    queryFn: async () => {
      const res = await api.get(`/leaderboard/event/${selectedEventSlug}`)
      return res.data
    },
    enabled: activeTab === 'event' && !!selectedEventSlug,
  })

  // Socket.IO integration
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7860'
    const socket: Socket = io(apiUrl, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
    })

    socket.on('connect', () => {
      console.log('Leaderboard connected to socket gateway')
      // Join leaderboard room or event specific room
      socket.emit('join', 'leaderboard')
    })

    socket.on('leaderboard_update', (data: { eventId: string }) => {
      console.log('Received live leaderboard update request:', data)
      // Invalidate queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['globalLeaderboard'] })
      if (selectedEventSlug) {
        queryClient.invalidateQueries({ queryKey: ['eventLeaderboard', selectedEventSlug] })
      }
    })

    socket.on('challenge_solved', (data: { userName: string; challengeTitle: string; points: number; firstBlood: boolean }) => {
      console.log('Notification: Challenge solved!', data)
      setTicker((prev) => [
        {
          userName: data.userName,
          challengeTitle: data.challengeTitle,
          points: data.points,
          firstBlood: data.firstBlood,
          id: Date.now() + Math.random(),
        },
        ...prev.slice(0, 4),
      ])
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient, selectedEventSlug])

  const selectedEventDetails = events.find((e: any) => e.slug === selectedEventSlug)

  return (
    <>
      <header className="mx-auto max-w-5xl px-5 pb-8 pt-10 text-center sm:px-10 sm:pt-12">
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § The Standings Desk · Real-time Feed
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.4rem,7vw,5rem)' }}>
          The <span style={{ color: 'var(--news-red)' }}>Standings</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-serif)] text-base italic leading-relaxed sm:text-lg" style={{ color: 'rgba(26,22,18,.55)' }}>
          Review our student dossiers, overall achievements, and real-time scores from active programming and cybersecurity challenges.
        </p>
      </header>

      {/* Live Solve Ticker (Micro-Animations & Dynamic Notification Feed) */}
      {ticker.length > 0 && (
        <section className="mx-auto mb-8 max-w-5xl px-5 sm:px-10">
          <div className="border border-dashed p-4" style={{ borderColor: 'var(--news-red)', background: 'rgba(224, 0, 0, 0.02)' }}>
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
              ✦ Live Solve Ticker
            </div>
            <div className="space-y-1.5">
              {ticker.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between text-xs transition-opacity duration-300">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{item.userName}</span>
                    <span className="opacity-60">solved</span>
                    <span className="font-semibold italic">{item.challengeTitle}</span>
                    <span className="px-1.5 py-0.2 text-[9px] tracking-wider uppercase font-bold text-white bg-[var(--news-ink)]" style={{ fontFamily: 'var(--font-os)' }}>
                      +{item.points} XP
                    </span>
                  </div>
                  {item.firstBlood && (
                    <span className="text-[9px] uppercase tracking-[0.1em] font-bold blink" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                      🩸 FIRST BLOOD
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="mx-auto max-w-5xl px-5 sm:px-10">
        <div className="flex border-b-2" style={{ borderColor: 'var(--news-ink)' }}>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] border-t-2 border-r-2 -mb-[2px] transition-colors ${
              activeTab === 'global'
                ? 'bg-transparent font-bold border-l-2'
                : 'opacity-50 hover:bg-black/[0.02]'
            }`}
            style={{
              borderColor: activeTab === 'global' ? 'var(--news-ink) var(--news-ink) transparent var(--news-ink)' : 'transparent',
              fontFamily: 'var(--font-os)',
            }}
          >
            Global Rankings
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] border-t-2 border-r-2 -mb-[2px] transition-colors ${
              activeTab === 'event'
                ? 'bg-transparent font-bold border-l-2'
                : 'opacity-50 hover:bg-black/[0.02]'
            }`}
            style={{
              borderColor: activeTab === 'event' ? 'var(--news-ink) var(--news-ink) transparent var(--news-ink)' : 'transparent',
              fontFamily: 'var(--font-os)',
            }}
          >
            Event Standings
          </button>
        </div>

        {/* Tab content */}
        <div className="py-8">
          {activeTab === 'global' ? (
            <div>
              <div className="mb-4 flex items-baseline justify-between border-b pb-2" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
                <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Global Overall Standings</h2>
                <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
                  Aggregated Member XP scores
                </span>
              </div>

              {globalLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] opacity-65" style={{ fontFamily: 'var(--font-os)' }}>Loading rankings...</p>
                </div>
              ) : globalUsers.length === 0 ? (
                <div className="py-12 text-center italic opacity-60">No members ranked yet.</div>
              ) : (
                <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                        <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Rank</th>
                        <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Name</th>
                        <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Academic Dossier</th>
                        <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Branch</th>
                        <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>GitHub</th>
                        <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right" style={{ fontFamily: 'var(--font-os)' }}>Total XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalUsers.map((user, index) => {
                        const rank = index + 1
                        const isTopThree = rank <= 3
                        const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}`

                        return (
                          <tr
                            key={user._id}
                            className="border-b hover:bg-black/[0.01] transition-colors"
                            style={{ borderColor: 'rgba(26,22,18,.1)' }}
                          >
                            <td className="p-3 font-semibold" style={{ color: isTopThree ? 'var(--news-red)' : 'inherit' }}>
                              {isTopThree ? `✦ ${rankText}` : rankText}
                            </td>
                            <td className="p-3 font-[family-name:var(--font-serif)] font-bold text-base">{user.name}</td>
                            <td className="p-3 text-xs opacity-75">
                              Yr {user.year} · <span className="uppercase">{user.department}</span> Track
                            </td>
                            <td className="p-3 text-xs opacity-75">{user.branch}</td>
                            <td className="p-3 text-xs">
                              {user.githubHandle ? (
                                <a
                                  href={`https://github.com/${user.githubHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-[var(--news-red)]"
                                >
                                  @{user.githubHandle}
                                </a>
                              ) : (
                                <span className="opacity-40">-</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-black" style={{ fontFamily: 'var(--font-os)', fontSize: '15px' }}>
                              {user.xp.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Event specific Standings */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
                <div>
                  <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Contest Live Leaderboard</h2>
                  {selectedEventDetails && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(26,22,18,.6)' }}>
                      Active: <strong style={{ color: 'var(--news-red)' }}>{selectedEventDetails.title}</strong> ({selectedEventDetails.type} event · <span className="uppercase">{selectedEventDetails.department}</span>)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="event-select" className="text-[10px] uppercase tracking-[0.12em] opacity-60" style={{ fontFamily: 'var(--font-os)' }}>
                    Select Contest:
                  </label>
                  <select
                    id="event-select"
                    value={selectedEventSlug}
                    onChange={(e) => setSelectedEventSlug(e.target.value)}
                    className="border bg-transparent px-3 py-1.5 text-xs outline-none focus:border-[var(--news-red)]"
                    style={{ borderColor: 'rgba(26,22,18,.3)' }}
                  >
                    {relevantEvents.map((e: any) => (
                      <option key={e.slug} value={e.slug}>
                        {e.title} {e.status === 'live' ? '• LIVE' : '• Closed'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedEventSlug ? (
                <div className="py-12 text-center italic opacity-60">No active or completed contests found.</div>
              ) : eventLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] opacity-65" style={{ fontFamily: 'var(--font-os)' }}>Computing scores...</p>
                </div>
              ) : !eventData || eventData.standings.length === 0 ? (
                <div className="py-12 text-center border p-8" style={{ borderColor: 'rgba(26,22,18,.12)' }}>
                  <div className="font-[family-name:var(--font-serif)] text-lg italic">No teams or participants registered.</div>
                  <p className="text-xs opacity-60 mt-1">Registrations might be closed or empty.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                  {eventData.manual ? (
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Rank</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Participant</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Rounds</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right" style={{ fontFamily: 'var(--font-os)' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventData.standings.map((item, index) => {
                          const rank = index + 1
                          const isTopThree = rank <= 3
                          const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}`
                          const name = item.teamName || item.user?.name || item.leader?.name || 'Unknown'
                          return (
                            <tr key={item.registrationId || index} className="border-b" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                              <td className="p-3 font-bold" style={{ color: isTopThree ? 'var(--news-red)' : undefined }}>{rankText}</td>
                              <td className="p-3">
                                <div className="font-[family-name:var(--font-serif)] font-bold">{name}</div>
                                {item.members && item.members.length > 0 && (
                                  <div className="text-[10px] opacity-50">+{item.members.length} member(s)</div>
                                )}
                              </td>
                              <td className="p-3 text-xs">
                                {(item.rounds || []).map((r) => (
                                  <span key={r.round} className="mr-2 inline-block border px-1.5 py-0.5" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
                                    R{r.round}: {r.points}
                                  </span>
                                ))}
                              </td>
                              <td className="p-3 text-right font-black" style={{ fontFamily: 'var(--font-os)', fontSize: '15px' }}>{item.score}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : eventData.type === 'SOLO' ? (
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Rank</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Name</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Academic Detail</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-center" style={{ fontFamily: 'var(--font-os)' }}>Solves</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Last Submission</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right" style={{ fontFamily: 'var(--font-os)' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventData.standings.map((item, index) => {
                          const rank = index + 1
                          const isTopThree = rank <= 3
                          const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}`
                          const user = item.user

                          if (!user) return null

                          return (
                            <tr
                              key={user._id}
                              className="border-b hover:bg-black/[0.01] transition-colors"
                              style={{ borderColor: 'rgba(26,22,18,.1)' }}
                            >
                              <td className="p-3 font-semibold" style={{ color: isTopThree ? 'var(--news-red)' : 'inherit' }}>
                                {isTopThree ? `✦ ${rankText}` : rankText}
                              </td>
                              <td className="p-3 font-[family-name:var(--font-serif)] font-bold text-base">{user.name}</td>
                              <td className="p-3 text-xs opacity-75">
                                Yr {user.year} · {user.branch}
                              </td>
                              <td className="p-3 text-xs text-center font-bold">{item.solvedCount} challenge(s)</td>
                              <td className="p-3 text-xs opacity-65">
                                {item.solvedCount > 0 && item.lastSolvedAt
                                  ? new Date(item.lastSolvedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                  : '-'}
                              </td>
                              <td className="p-3 text-right font-black" style={{ fontFamily: 'var(--font-os)', fontSize: '15px' }}>
                                {item.score}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    // Team leaderboard table
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Rank</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Team Name</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Leader & Roster</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-center" style={{ fontFamily: 'var(--font-os)' }}>Solves</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-os)' }}>Last Submission</th>
                          <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right" style={{ fontFamily: 'var(--font-os)' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventData.standings.map((item, index) => {
                          const rank = index + 1
                          const isTopThree = rank <= 3
                          const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}`
                          const roster = item.members || []

                          return (
                            <tr
                              key={item.registrationId}
                              className="border-b hover:bg-black/[0.01] transition-colors"
                              style={{ borderColor: 'rgba(26,22,18,.1)' }}
                            >
                              <td className="p-3 font-semibold" style={{ color: isTopThree ? 'var(--news-red)' : 'inherit' }}>
                                {isTopThree ? `✦ ${rankText}` : rankText}
                              </td>
                              <td className="p-3 font-[family-name:var(--font-serif)] font-bold text-base" style={{ color: 'var(--news-red)' }}>
                                {item.teamName}
                              </td>
                              <td className="p-3 text-xs opacity-75">
                                <div className="font-semibold">Leader: {item.leader?.name}</div>
                                <div className="mt-1 flex flex-wrap gap-x-2 opacity-80">
                                  <span>Members:</span>
                                  {roster.filter(m => m._id !== item.leader?._id).map((m: any) => m.name).join(', ') || <span className="italic">None</span>}
                                </div>
                              </td>
                              <td className="p-3 text-xs text-center font-bold">{item.solvedCount} solves</td>
                              <td className="p-3 text-xs opacity-65">
                                {item.solvedCount > 0 && item.lastSolvedAt
                                  ? new Date(item.lastSolvedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                  : '-'}
                              </td>
                              <td className="p-3 text-right font-black" style={{ fontFamily: 'var(--font-os)', fontSize: '15px' }}>
                                {item.score}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
