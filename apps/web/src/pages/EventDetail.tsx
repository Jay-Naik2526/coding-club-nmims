import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DEPTS } from '@/lib/depts'
import { archiveBySlug } from '@/lib/archive'
import { Recap } from './Recap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useApp } from '@/store/useApp'
import { api } from '@/lib/api'
import { toDirectImageUrl } from '@/lib/image'

export function EventDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useApp()

  // Inline states for registration flow
  const [isRegistering, setIsRegistering] = useState(false)
  const [localRegSuccess, setLocalRegSuccess] = useState<any>(null)
  const [errMessage, setErrMessage] = useState('')
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [memberEmails, setMemberEmails] = useState<string[]>([''])

  // 1. Past Ambiora events render as a rich editorial recap with a 3D photo gallery.
  const archived = slug ? archiveBySlug(slug) : undefined
  if (archived) return <Recap ev={archived} />

  // 2. Fetch event details dynamically from the database
  const { data: ev, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const res = await api.get(`/events/${slug}`)
      return res.data
    },
    enabled: !!slug && !archived
  })

  // 3. Fetch user registrations
  const { data: myRegistrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const res = await api.get('/registrations/my-registrations')
      return res.data
    },
    enabled: !!user,
  })

  // Check if already registered for this event
  const dbRegistration = ev && myRegistrations?.find(
    (r: any) => String(r.eventId?._id || r.eventId) === String(ev._id)
  )
  const activeReg = localRegSuccess || dbRegistration

  if (isLoading) {
    return (
      <div className="px-5 py-24 text-center sm:px-10">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
        <div className="mt-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
          Loading specifications...
        </div>
      </div>
    )
  }

  if (error || !ev) {
    return (
      <div className="px-5 py-24 text-center sm:px-10">
        <div className="font-[family-name:var(--font-serif)] text-3xl font-black">Spec Not Found</div>
        <button onClick={() => navigate('/events')} className="mt-4 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)' }}>
          ← Back to events
        </button>
      </div>
    )
  }

  const closed = ev.status === 'closed'
  const cfg = DEPTS[ev.department as keyof typeof DEPTS]
  const bannerSrc = toDirectImageUrl(ev.bannerUrl)

  const handleSoloRegister = async () => {
    if (!user) {
      alert('Please sign in first — use the Login link at the top right of the page.');
      return;
    }
    setIsRegistering(true);
    setErrMessage('');
    try {
      const res = await api.post(`/registrations/${ev.slug}/register`, {});
      setLocalRegSuccess(res.data.registration);
      // Invalidate query to refresh registration status
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    } catch (err: any) {
      setErrMessage(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTeamRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in first — use the Login link at the top right of the page.');
      return;
    }
    if (!teamName.trim()) {
      setErrMessage('Team name is required');
      return;
    }

    setIsRegistering(true);
    setErrMessage('');
    // Remove empty emails
    const filteredEmails = memberEmails.map(m => m.trim()).filter(Boolean);

    try {
      const res = await api.post(`/registrations/${ev.slug}/register`, {
        teamName: teamName.trim(),
        memberEmails: filteredEmails,
      });
      setLocalRegSuccess(res.data.registration);
      setShowTeamForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    } catch (err: any) {
      setErrMessage(err.response?.data?.error || 'Team registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const addMemberEmail = () => {
    if (memberEmails.length < ev.maxTeamSize - 1) {
      setMemberEmails([...memberEmails, '']);
    }
  };

  const removeMemberEmail = (idx: number) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== idx));
  };

  const updateMemberEmail = (idx: number, val: string) => {
    const updated = [...memberEmails];
    updated[idx] = val;
    setMemberEmails(updated);
  };

  return (
    <article className="mx-auto max-w-[1000px] px-5 py-8 sm:px-10">
      <div className="mb-2 text-[9px] uppercase tracking-[0.15em]" style={{ color: cfg.acc, fontFamily: 'var(--font-os)' }}>
        {cfg.code} · {ev.type} · DIFFICULTY {ev.difficulty}/5
      </div>
      <h1 className="mb-3 font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)' }}>
        {ev.title}
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-4 border-y py-2 text-[10px] uppercase tracking-[0.1em]" style={{ borderColor: 'var(--news-ink)', fontFamily: 'var(--font-os)', color: 'rgba(26,22,18,.5)' }}>
        <span>DATE — {new Date(ev.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span className={ev.status === 'live' ? 'blink' : ''} style={{ color: ev.status === 'live' ? 'var(--news-red)' : undefined }}>
          STATUS — {ev.status.toUpperCase()}
        </span>
      </div>

      {bannerSrc && (
        <img
          src={bannerSrc}
          alt={ev.title}
          className="mb-8 h-64 w-full border object-cover sm:h-96"
          style={{ borderColor: 'var(--news-ink)' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="drop-cap text-[15px] leading-[1.85]" style={{ color: 'rgba(26,22,18,.78)' }}>
          <p>{ev.description} This initiative is part of the {cfg.code} track at Coding Club NMIMS Shirpur. Participants will be tested on real-world engineering concepts and logic under time pressure.</p>
          <h3 className="mb-2 mt-6 font-[family-name:var(--font-serif)] text-xl font-bold">Rules</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>Registration via the form below — {ev.type === 'TEAM' ? `teams of ${ev.minTeamSize}–${ev.maxTeamSize}` : 'solo entry'}.</li>
            <li>Bring your own laptop and charger.</li>
            <li>Plagiarism results in immediate disqualification.</li>
          </ul>
          <h3 className="mb-2 mt-6 font-[family-name:var(--font-serif)] text-xl font-bold">Schedule</h3>
          <p>Briefing → Contest window → Editorial & prize distribution.</p>
        </div>

        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="border p-5" style={{ borderColor: 'var(--news-ink)', background: 'rgba(26,22,18,.02)' }}>
            <div className="mb-3 text-[9px] uppercase tracking-[0.12em]" style={{ color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
              Registration Panel
            </div>

            {activeReg ? (
              // 1. SUCCESS / ALREADY REGISTERED STATE
              <div className="text-left">
                <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-white bg-green-700 mb-2" style={{ fontFamily: 'var(--font-os)' }}>
                  ✓ Registered
                </span>
                <p className="text-xs leading-relaxed mb-4 text-gray-700">
                  Your entry pass is active. View your QR ticket below and show it at the venue entrance.
                </p>
                <Link
                  to={`/ticket/${activeReg._id}`}
                  className="cc-hover block w-full py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                  style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
                >
                  View QR Ticket →
                </Link>
              </div>
            ) : showTeamForm ? (
              // 2. INLINE TEAM FORM STATE
              <form onSubmit={handleTeamRegister} className="text-left space-y-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.1em] text-gray-500 mb-1" style={{ fontFamily: 'var(--font-os)' }}>
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full border px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    style={{ borderColor: 'var(--news-ink)' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[9px] uppercase tracking-[0.1em] text-gray-500" style={{ fontFamily: 'var(--font-os)' }}>
                    Member Emails (Excluding Yours)
                  </label>
                  {memberEmails.map((email, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="email"
                        required
                        placeholder={`Member #${idx + 2} Email`}
                        value={email}
                        onChange={(e) => updateMemberEmail(idx, e.target.value)}
                        className="flex-1 border px-2.5 py-1 text-xs bg-white focus:outline-none"
                        style={{ borderColor: 'var(--news-ink)' }}
                      />
                      {memberEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMemberEmail(idx)}
                          className="text-red-600 text-xs px-1 hover:underline"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {memberEmails.length < ev.maxTeamSize - 1 && (
                    <button
                      type="button"
                      onClick={addMemberEmail}
                      className="text-[9px] uppercase tracking-[0.05em] hover:underline"
                      style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}
                    >
                      + Add Member Email
                    </button>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="cc-hover flex-1 py-2 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-white"
                    style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
                  >
                    {isRegistering ? 'Registering…' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowTeamForm(false); setErrMessage(''); }}
                    className="border px-3 py-2 text-center text-[9px] font-bold uppercase tracking-[0.12em]"
                    style={{ borderColor: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // 3. INITIAL REGISTER STATE
              <div>
                <button
                  disabled={closed || isRegistering}
                  onClick={ev.type === 'SOLO' ? handleSoloRegister : () => setShowTeamForm(true)}
                  className="cc-hover w-full py-3 text-[11px] uppercase tracking-[0.12em] text-center"
                  style={{
                    background: closed ? 'rgba(26,22,18,.15)' : 'var(--news-ink)',
                    color: closed ? 'rgba(26,22,18,.5)' : 'var(--news-bg)',
                    fontFamily: 'var(--font-os)',
                    cursor: closed ? 'not-allowed' : 'pointer',
                  }}
                >
                  {closed ? 'REGISTRATION CLOSED' : isRegistering ? 'REGISTERING…' : `REGISTER — ${ev.type}`}
                </button>
              </div>
            )}

            {/* Error alerts */}
            {errMessage && (
              <div className="mt-3 border border-red-200 bg-red-50 p-2.5 text-left text-red-800">
                <p className="text-[10px] font-bold leading-tight">{errMessage}</p>
              </div>
            )}

            {ev.department === 'sec' && (
              <button onClick={() => navigate(`/ide/ctf/${ev.slug}`)} className="cc-hover mt-2 w-full border py-3 text-[11px] uppercase tracking-[0.12em]" style={{ borderColor: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}>
                ENTER CTF →
              </button>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}
