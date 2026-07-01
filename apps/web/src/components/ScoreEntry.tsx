import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface EventOption {
  _id: string
  title: string
  slug: string
}

interface ScoreRow {
  registrationId: string
  displayName: string
  teamName?: string
  teamMembers: { name: string; email: string }[]
  scores: { round: number; label: string; points: number }[]
  total: number
}

const ROUNDS = [1, 2, 3]

/** Admin score-entry sheet for manually-judged, live events (e.g. PromptCraft
 *  Arena). Punch in points per round per participant/team; the public
 *  /leaderboard page picks these up automatically once any exist. */
export function ScoreEntry({ events }: { events: EventOption[] }) {
  const queryClient = useQueryClient()
  const [selectedEventId, setSelectedEventId] = useState('')
  const [drafts, setDrafts] = useState<Record<string, Record<number, string>>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  // Default to the first event without an effect: fall back to events[0]
  // at render time until the admin explicitly picks a different one.
  const eventId = selectedEventId || events[0]?._id || ''

  const { data: rows = [], isLoading } = useQuery<ScoreRow[]>({
    queryKey: ['adminScores', eventId],
    queryFn: async () => (await api.get(`/admin/scores/${eventId}`)).data,
    enabled: !!eventId,
  })

  const draftValue = (registrationId: string, round: number, fallback: number) => {
    const draft = drafts[registrationId]?.[round]
    return draft !== undefined ? draft : String(fallback)
  }

  const setDraft = (registrationId: string, round: number, value: string) => {
    setDrafts((d) => ({ ...d, [registrationId]: { ...d[registrationId], [round]: value } }))
  }

  const saveScore = async (registrationId: string, round: number) => {
    const value = drafts[registrationId]?.[round]
    if (value === undefined) return
    const points = Number(value)
    if (Number.isNaN(points)) return

    const key = `${registrationId}-${round}`
    setSavingKey(key)
    try {
      await api.post('/admin/scores', { eventId, registrationId, round, label: `Round ${round}`, points })
      await queryClient.invalidateQueries({ queryKey: ['adminScores', eventId] })
      await queryClient.invalidateQueries({ queryKey: ['eventLeaderboard'] })
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-1">
        <label className="text-[9px] uppercase tracking-[0.1em] opacity-60">Event</label>
        <select
          value={eventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="max-w-sm border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]"
          style={{ borderColor: 'rgba(26,22,18,.3)' }}
        >
          {events.map((e) => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm opacity-60">Loading participants…</div>
      ) : rows.length === 0 ? (
        <div className="border p-8 text-center italic opacity-60" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
          No registrations yet for this event.
        </div>
      ) : (
        <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Participant / Team</th>
                {ROUNDS.map((r) => (
                  <th key={r} className="p-3 text-[10px] uppercase tracking-[0.12em] text-center">Round {r}</th>
                ))}
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.registrationId} className="border-b" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                  <td className="p-3">
                    <div className="font-bold">{row.displayName}</div>
                    {row.teamMembers.length > 0 && (
                      <div className="text-[10px] opacity-50">+{row.teamMembers.length} member(s)</div>
                    )}
                  </td>
                  {ROUNDS.map((round) => {
                    const existing = row.scores.find((s) => s.round === round)
                    const key = `${row.registrationId}-${round}`
                    return (
                      <td key={round} className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={draftValue(row.registrationId, round, existing?.points ?? 0)}
                            onChange={(e) => setDraft(row.registrationId, round, e.target.value)}
                            className="w-16 border bg-transparent p-1.5 text-center text-sm outline-none focus:border-[var(--news-red)]"
                            style={{ borderColor: 'rgba(26,22,18,.3)' }}
                          />
                          <button
                            onClick={() => saveScore(row.registrationId, round)}
                            disabled={savingKey === key}
                            className="px-2 py-1 text-[9px] font-bold uppercase text-white bg-[var(--news-ink)] hover:bg-black disabled:opacity-50"
                            style={{ fontFamily: 'var(--font-os)' }}
                          >
                            {savingKey === key ? '…' : '✓'}
                          </button>
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-3 text-right font-black" style={{ fontFamily: 'var(--font-os)', fontSize: '15px' }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
