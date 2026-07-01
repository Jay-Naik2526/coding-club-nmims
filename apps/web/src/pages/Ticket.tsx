import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useApp } from '@/store/useApp'
import { DEPTS, type DeptId } from '@/lib/depts'
import { downloadTicketPdf } from '@/lib/download'

interface TicketData {
  dataUrl: string
  registration: { id: string; teamName?: string; attended: boolean; attendedAt: string | null }
  event: { title: string; slug: string; startDate: string; department: DeptId }
  owner: { name: string; email: string }
  teamMembers: { name: string; email: string }[]
}

export function TicketPage() {
  const { id } = useParams()
  const loggedInUser = useApp((s) => s.user)

  const { data, isLoading, error } = useQuery<TicketData>({
    queryKey: ['ticketQr', id],
    queryFn: async () => (await api.get(`/registrations/${id}/qr`)).data,
    enabled: !!loggedInUser && !!id,
  })

  if (!loggedInUser) {
    return (
      <section className="mx-auto max-w-[600px] px-5 py-24 text-center sm:px-10">
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Session Intercept
        </div>
        <h1 className="mb-4 font-[family-name:var(--font-serif)] font-black text-3xl leading-none">Sign in required</h1>
        <Link to="/login" className="mt-2 inline-block border px-6 py-2.5 text-[10px] uppercase tracking-[0.14em]" style={{ borderColor: 'var(--news-ink)' }}>
          Sign In →
        </Link>
      </section>
    )
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
        <p className="mt-2 text-[10px] uppercase tracking-[0.15em] opacity-65" style={{ fontFamily: 'var(--font-os)' }}>Generating ticket…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="font-bold text-red-800">Could not load this ticket.</p>
        <p className="mt-1 text-xs opacity-60">It may not belong to you, or the registration doesn't exist.</p>
        <Link to="/profile" className="mt-4 inline-block text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)' }}>← Back to profile</Link>
      </div>
    )
  }

  const { dataUrl, registration, event, owner, teamMembers } = data
  const accent = DEPTS[event.department]?.acc ?? 'var(--news-red)'

  return (
    <section className="mx-auto max-w-md px-5 py-12 sm:px-10">
      <div className="mb-6 text-center">
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Entry Pass
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-tight" style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)' }}>
          {event.title}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden border-2 bg-white"
        style={{ borderColor: 'var(--news-ink)' }}
      >
        <div className="h-2" style={{ background: accent }} />

        <div className="p-6 text-center">
          <div className="mb-1 text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(26,22,18,.45)', fontFamily: 'var(--font-os)' }}>
            {registration.teamName ? 'Team' : 'Participant'}
          </div>
          <div className="font-[family-name:var(--font-serif)] text-xl font-bold">
            {registration.teamName || owner.name}
          </div>
          {registration.teamName && (
            <div className="mt-1 text-xs opacity-60">{owner.name} (leader){teamMembers.length > 0 && ` + ${teamMembers.length} member${teamMembers.length > 1 ? 's' : ''}`}</div>
          )}

          <div className="my-6 flex justify-center">
            <img src={dataUrl} alt="Entry ticket QR code" className="h-64 w-64" />
          </div>

          <div
            className="inline-block border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{
              borderColor: registration.attended ? '#0a7a3d' : 'rgba(26,22,18,.3)',
              color: registration.attended ? '#0a7a3d' : 'rgba(26,22,18,.5)',
              fontFamily: 'var(--font-os)',
            }}
          >
            {registration.attended ? '✓ Checked In' : 'Not Checked In Yet'}
          </div>

          <p className="mt-5 text-[11px] leading-relaxed" style={{ color: 'rgba(26,22,18,.5)' }}>
            Show this screen to a Coding Club coordinator at the venue entrance to be scanned in.
          </p>
        </div>

        <div className="border-t px-6 py-3 text-center text-[9px] uppercase tracking-[0.1em]" style={{ borderColor: 'rgba(26,22,18,.15)', color: 'rgba(26,22,18,.4)', fontFamily: 'var(--font-os)' }}>
          Ticket ID: {registration.id}
        </div>
      </motion.div>

      <div className="mt-6 flex items-center justify-center gap-5 text-[10px] uppercase tracking-[0.1em]">
        <button
          onClick={() => downloadTicketPdf(registration.id, event.slug)}
          style={{ color: 'var(--news-ink)' }}
          className="underline hover:text-[var(--news-red)]"
        >
          Download PDF pass
        </button>
        <Link to="/profile" style={{ color: 'var(--news-ink)' }} className="underline hover:text-[var(--news-red)]">
          ← Back to profile
        </Link>
      </div>
    </section>
  )
}
