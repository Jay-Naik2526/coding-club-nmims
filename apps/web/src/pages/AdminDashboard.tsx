import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useApp } from '@/store/useApp'
import { motion, AnimatePresence } from 'framer-motion'
import { QrScanner } from '@/components/QrScanner'
import { ScoreEntry } from '@/components/ScoreEntry'

interface AdminStats {
  users: number
  registrations: number
  events: number
  submissions: number
  distribution: {
    dsa: number
    web: number
    sec: number
  }
}

interface FormFieldInput {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox'
  required: boolean
  optionsString: string // comma-separated options for select
}

export function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const user = useApp((s) => s.user)
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'regs' | 'forms' | 'messages' | 'scanner' | 'scores'>('stats')

  // Auth guard: Require admin role
  if (!user || user.role !== 'ADMIN') {
    return (
      <section className="mx-auto max-w-[800px] px-5 py-24 text-center sm:px-10">
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § Security Intercept
        </div>
        <h1 className="mb-4 font-[family-name:var(--font-serif)] font-black text-3xl leading-none">
          Access Denied
        </h1>
        <p className="mx-auto max-w-[480px] text-sm italic opacity-60">
          This terminal is restricted to central administrative board members. Please verify your credentials or contact the site administrator.
        </p>
      </section>
    )
  }

  // --- QUERY STATE ---
  // Stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats')
      return res.data
    }
  })

  // Events
  const { data: events = [], isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events')
      return res.data
    }
  })

  // Registrations
  const { data: registrations = [], isLoading: regsLoading } = useQuery<any[]>({
    queryKey: ['adminRegistrations'],
    queryFn: async () => {
      const res = await api.get('/admin/registrations')
      return res.data
    }
  })

  // Forms
  const { data: forms = [], isLoading: formsLoading } = useQuery<any[]>({
    queryKey: ['adminForms'],
    queryFn: async () => {
      const res = await api.get('/admin/forms')
      return res.data
    }
  })

  // Messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ['adminMessages'],
    queryFn: async () => {
      const res = await api.get('/admin/messages')
      return res.data
    }
  })

  return (
    <>
      <header className="mx-auto max-w-5xl px-5 pb-6 pt-10 text-center sm:px-10">
        <div className="mb-2 text-[9px] uppercase tracking-[0.25em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          § CENTRAL COMMITTEE CONTROLS
        </div>
        <h1 className="font-[family-name:var(--font-serif)] font-black leading-[0.9]" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
          Club <span style={{ color: 'var(--news-red)' }}>Administration</span>
        </h1>
      </header>

      {/* Admin Submenu Tabs */}
      <section className="mx-auto max-w-5xl px-5 sm:px-10">
        <div className="flex flex-wrap gap-2 border-b-2 pb-2" style={{ borderColor: 'var(--news-ink)' }}>
          {[
            { id: 'stats', label: '📊 Stats Overview' },
            { id: 'events', label: '📅 Event CRUD' },
            { id: 'regs', label: '👥 Registrations' },
            { id: 'forms', label: '📝 Form Builder' },
            { id: 'messages', label: '📨 Contact Messages' },
            { id: 'scanner', label: '🎫 Ticket Scanner' },
            { id: 'scores', label: '🏆 Live Scores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.12em] font-bold border transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--news-ink)] text-white'
                  : 'hover:bg-black/[0.03]'
              }`}
              style={{
                fontFamily: 'var(--font-os)',
                borderColor: 'var(--news-ink)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'stats' && <StatsView stats={stats} />}
          {activeTab === 'events' && <EventsCrudView events={events} isLoading={eventsLoading} queryClient={queryClient} />}
          {activeTab === 'regs' && <RegistrationsView registrations={registrations} isLoading={regsLoading} events={events} queryClient={queryClient} />}
          {activeTab === 'forms' && <FormBuilderView forms={forms} isLoading={formsLoading} events={events} queryClient={queryClient} />}
          {activeTab === 'scanner' && <QrScanner />}
          {activeTab === 'scores' && <ScoreEntry events={events} />}
          {activeTab === 'messages' && <MessagesView messages={messages} isLoading={messagesLoading} />}
        </div>
      </section>
    </>
  )
}

// ==================== SUB-VIEWS ====================

// 1. STATS VIEW
function StatsView({ stats }: { stats?: AdminStats }) {
  if (!stats) return <div className="py-6 text-center italic opacity-60">Gathering statistics...</div>

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Members', value: stats.users, detail: 'Registered Students' },
          { label: 'Total Entries', value: stats.registrations, detail: 'Solo/Team registrations' },
          { label: 'Active Lines', value: stats.events, detail: 'Seeded/Custom events' },
          { label: 'Submissions', value: stats.submissions, detail: 'Judge executions' },
        ].map((card, i) => (
          <div key={i} className="border p-5" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
            <div className="text-[10px] uppercase tracking-[0.1em] opacity-60" style={{ fontFamily: 'var(--font-os)' }}>{card.label}</div>
            <div className="my-1 font-[family-name:var(--font-serif)] text-3xl font-black">{card.value}</div>
            <div className="text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>{card.detail}</div>
          </div>
        ))}
      </div>

      <div className="border p-6" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
        <h3 className="mb-4 font-[family-name:var(--font-serif)] text-xl font-bold border-b pb-2" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
          Lineup Distribution (Entries)
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { track: 'Algorithms (DSA)', count: stats.distribution.dsa, color: 'var(--news-red)' },
            { track: 'Development (Web)', count: stats.distribution.web, color: '#008080' },
            { track: 'Cybersecurity (SEC)', count: stats.distribution.sec, color: '#4b0082' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>{item.track}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-2 bg-black/[0.05] w-full">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    backgroundColor: item.color,
                    width: stats.registrations > 0 ? `${(item.count / stats.registrations) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 2. EVENTS CRUD VIEW
function EventsCrudView({ events, isLoading, queryClient }: { events: any[]; isLoading: boolean; queryClient: any }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  
  // Form values
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState<'dsa' | 'web' | 'sec'>('dsa')
  const [type, setType] = useState<'SOLO' | 'TEAM'>('SOLO')
  const [minTeamSize, setMinTeamSize] = useState(1)
  const [maxTeamSize, setMaxTeamSize] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [bannerUrl, setBannerUrl] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const handleOpenCreate = () => {
    setEditingEvent(null)
    setTitle('')
    setSlug('')
    setDescription('')
    setDepartment('dsa')
    setType('SOLO')
    setMinTeamSize(1)
    setMaxTeamSize(1)
    setStartDate('')
    setEndDate('')
    setRegistrationDeadline('')
    setDifficulty(3)
    setBannerUrl('')
    setIsPublished(true)
    setFormError('')
    setFormSuccess('')
    setFormOpen(true)
  }

  const handleOpenEdit = (ev: any) => {
    setEditingEvent(ev)
    setTitle(ev.title)
    setSlug(ev.slug)
    setDescription(ev.description)
    setDepartment(ev.department)
    setType(ev.type)
    setMinTeamSize(ev.minTeamSize || 1)
    setMaxTeamSize(ev.maxTeamSize || 1)
    setStartDate(new Date(ev.startDate).toISOString().slice(0, 16))
    setEndDate(new Date(ev.endDate).toISOString().slice(0, 16))
    setRegistrationDeadline(new Date(ev.registrationDeadline).toISOString().slice(0, 16))
    setDifficulty(ev.difficulty)
    setBannerUrl(ev.bannerUrl || '')
    setIsPublished(ev.isPublished !== false)
    setFormError('')
    setFormSuccess('')
    setFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const payload = {
      title,
      slug,
      description,
      department,
      type,
      minTeamSize: type === 'SOLO' ? 1 : minTeamSize,
      maxTeamSize: type === 'SOLO' ? 1 : maxTeamSize,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      difficulty,
      bannerUrl: bannerUrl || undefined,
      isPublished,
    }

    try {
      if (editingEvent) {
        // Update
        await api.post(`/events/${editingEvent._id}/update`, payload)
        setFormSuccess('Event updated successfully!')
      } else {
        // Create
        await api.post('/events', payload)
        setFormSuccess('Event created successfully!')
      }
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setTimeout(() => {
        setFormOpen(false)
      }, 1200)
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This will orphan registrations.')) return
    try {
      await api.post(`/events/${id}/delete`)
      queryClient.invalidateQueries({ queryKey: ['events'] })
    } catch (err) {
      alert('Failed to delete event')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline border-b pb-2" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Manage Coding Events</h2>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-red)] transition-colors hover:bg-red-800"
          style={{ fontFamily: 'var(--font-os)' }}
        >
          + Create Event
        </button>
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border p-6 overflow-hidden bg-black/[0.01]"
            style={{ borderColor: 'var(--news-ink)' }}
          >
            <h3 className="mb-4 font-[family-name:var(--font-serif)] text-xl font-bold">
              {editingEvent ? 'Modify Event Details' : 'Design New Event Lineup'}
            </h3>

            {formError && <div className="mb-4 text-xs font-bold text-red-600">{formError}</div>}
            {formSuccess && <div className="mb-4 text-xs font-bold text-emerald-700">{formSuccess}</div>}

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Title</label>
                <input required value={title} onChange={e => { setTitle(e.target.value); if(!editingEvent) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')) }} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Slug (URL Route)</label>
                <input required value={slug} onChange={e => setSlug(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Description</label>
                <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Department Track</label>
                <select value={department} onChange={e => setDepartment(e.target.value as any)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  <option value="dsa">DSA (Competitive Coding)</option>
                  <option value="web">WEB (Full-Stack/Design)</option>
                  <option value="sec">SEC (Cybersecurity/CTF)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Participation Type</label>
                <select value={type} onChange={e => setType(e.target.value as any)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  <option value="SOLO">Solo (1 Member)</option>
                  <option value="TEAM">Team Event</option>
                </select>
              </div>

              {type === 'TEAM' && (
                <>
                  <div className="flex flex-col">
                    <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Min Team Size</label>
                    <input type="number" min={1} max={10} value={minTeamSize} onChange={e => setMinTeamSize(Number(e.target.value))} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Max Team Size</label>
                    <input type="number" min={1} max={10} value={maxTeamSize} onChange={e => setMaxTeamSize(Number(e.target.value))} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                  </div>
                </>
              )}

              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Start Time</label>
                <input required type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">End Time</label>
                <input required type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Registration Deadline</label>
                <input required type="datetime-local" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Difficulty Rating (1 to 5)</label>
                <input required type="number" min={1} max={5} value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Banner Image URL (Optional)</label>
                <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>

              <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer border p-3" style={{ borderColor: isPublished ? 'rgba(26,22,18,.18)' : 'var(--news-red)', background: isPublished ? 'transparent' : 'rgba(200,0,42,0.04)' }}>
                <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-4 w-4 accent-[var(--news-red)]" />
                <span className="text-[10px] uppercase tracking-[0.1em]">
                  {isPublished ? 'Published — visible on the public site' : 'Draft — hidden from everyone except admins'}
                </span>
              </label>

              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white bg-[var(--news-ink)]" style={{ fontFamily: 'var(--font-os)' }}>
                  {editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] border border-black" style={{ fontFamily: 'var(--font-os)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-8">Loading events list...</div>
      ) : events.length === 0 ? (
        <div className="text-center italic opacity-60 border p-8">No events currently listed.</div>
      ) : (
        <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Event Title</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Track</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Mode</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Status</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Timeline</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id} className="border-b hover:bg-black/[0.01]" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                  <td className="p-3 font-[family-name:var(--font-serif)] font-bold text-base">
                    {ev.title}
                    {ev.isPublished === false && (
                      <span className="ml-2 border border-[var(--news-red)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--news-red)]" style={{ fontFamily: 'var(--font-os)' }}>
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-xs uppercase font-bold">{ev.department}</td>
                  <td className="p-3 text-xs">{ev.type}</td>
                  <td className="p-3 text-xs uppercase tracking-wider">{ev.status}</td>
                  <td className="p-3 text-xs opacity-75">
                    {new Date(ev.startDate).toLocaleDateString()} · {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2 text-[9px] font-bold uppercase tracking-[0.1em]">
                      <button onClick={() => handleOpenEdit(ev)} className="px-2.5 py-1 border hover:bg-black/[0.04]">Edit</button>
                      <button onClick={() => handleDelete(ev._id)} className="px-2.5 py-1 border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// 3. REGISTRATIONS VIEW
function RegistrationsView({ registrations, isLoading, events, queryClient }: { registrations: any[]; isLoading: boolean; events: any[]; queryClient: any }) {
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'not_attended'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter logic
  const filtered = registrations.filter((reg) => {
    if (selectedDept !== 'all' && reg.eventId?.department !== selectedDept) return false
    if (selectedEventId !== 'all' && reg.eventId?._id !== selectedEventId) return false
    if (attendanceFilter === 'attended' && !reg.attended) return false
    if (attendanceFilter === 'not_attended' && reg.attended) return false
    return true
  })
  const attendedCount = filtered.filter((r) => r.attended).length

  const handleDelete = async (reg: any) => {
    const label = reg.teamName || reg.userId?.name || 'this entry'
    if (!window.confirm(`Remove ${label}'s registration for "${reg.eventId?.title}"? This cannot be undone.`)) return
    setDeletingId(reg._id)
    try {
      await api.post(`/admin/registrations/${reg._id}/delete`)
      queryClient.invalidateQueries({ queryKey: ['adminRegistrations'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    } catch {
      alert('Failed to remove registration')
    } finally {
      setDeletingId(null)
    }
  }

  // Export CSV locally. When certificatesOnly is true, only rows with
  // attended === true are included — that's the roster that should
  // actually receive certificates, not everyone who merely registered.
  const exportCSV = (rows: any[], certificatesOnly: boolean) => {
    const source = certificatesOnly ? rows.filter((r) => r.attended) : rows
    const headers = certificatesOnly
      ? ['Event Title', 'Track', 'Name', 'Email', 'Team Name', 'Checked In At']
      : ['Registration Date', 'Event Title', 'Track', 'Type', 'User/Leader Name', 'Email', 'Team Name', 'Members Roster', 'Attended']
    const csvRows = [headers]

    source.forEach((reg) => {
      const rosterNames = reg.teamMembers ? reg.teamMembers.map((m: any) => m.name).join('; ') : ''
      csvRows.push(
        certificatesOnly
          ? [
              reg.eventId?.title || 'Unknown Event',
              reg.eventId?.department?.toUpperCase() || 'N/A',
              reg.userId?.name || 'N/A',
              reg.userId?.email || 'N/A',
              reg.teamName || '',
              reg.attendedAt ? new Date(reg.attendedAt).toLocaleString() : '',
            ]
          : [
              new Date(reg.createdAt).toLocaleString(),
              reg.eventId?.title || 'Unknown Event',
              reg.eventId?.department?.toUpperCase() || 'N/A',
              reg.eventId?.type || 'N/A',
              reg.userId?.name || 'N/A',
              reg.userId?.email || 'N/A',
              reg.teamName || '',
              rosterNames,
              reg.attended ? 'Yes' : 'No',
            ]
      )
    })

    const csvContent = 'data:text/csv;charset=utf-8,'
      + csvRows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `coding_club_${certificatesOnly ? 'attendees_for_certificates' : 'registrations'}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-baseline gap-4 border-b pb-3" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <div>
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Student Registrations</h2>
          <p className="text-xs opacity-60">Browse entry lists and filter down by department, contest, or attendance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportCSV(filtered, false)}
            disabled={filtered.length === 0}
            className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-ink)] disabled:opacity-40"
            style={{ fontFamily: 'var(--font-os)' }}
          >
            📥 Export CSV ({filtered.length})
          </button>
          <button
            onClick={() => exportCSV(filtered, true)}
            disabled={attendedCount === 0}
            className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-red)] disabled:opacity-40"
            style={{ fontFamily: 'var(--font-os)' }}
            title="Only students marked attended via the ticket scanner — the correct list for certificate issuance"
          >
            📜 Export for Certificates ({attendedCount})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.1em] opacity-60">Filter Department</label>
          <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedEventId('all') }} className="border bg-transparent p-1.5 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
            <option value="all">All Tracks</option>
            <option value="dsa">DSA Track</option>
            <option value="web">WEB Track</option>
            <option value="sec">Cybersec Track</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.1em] opacity-60">Filter Specific Event</label>
          <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="border bg-transparent p-1.5 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
            <option value="all">All Contests</option>
            {events.filter(e => selectedDept === 'all' || e.department === selectedDept).map((e) => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.1em] opacity-60">Filter Attendance</label>
          <select value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value as any)} className="border bg-transparent p-1.5 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
            <option value="all">All</option>
            <option value="attended">Attended Only</option>
            <option value="not_attended">Not Yet Attended</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading rosters...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center italic opacity-60 border p-8">No registrations match current filters.</div>
      ) : (
        <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Date</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Contest</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Mode</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Name & Email</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Academic Profile</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Team Info</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-center">Attendance</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg._id} className="border-b hover:bg-black/[0.01]" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                  <td className="p-3 text-xs opacity-75">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-bold">{reg.eventId?.title}</td>
                  <td className="p-3 text-xs uppercase">{reg.eventId?.type}</td>
                  <td className="p-3">
                    <div className="font-[family-name:var(--font-serif)] font-bold">{reg.userId?.name}</div>
                    <div className="text-xs opacity-60">{reg.userId?.email}</div>
                  </td>
                  <td className="p-3 text-xs opacity-75">
                    Yr {reg.userId?.year} · {reg.userId?.branch}
                  </td>
                  <td className="p-3 text-xs">
                    {reg.teamName ? (
                      <div>
                        <strong className="text-[var(--news-red)]">{reg.teamName}</strong>
                        <div className="opacity-60 text-[10px] mt-0.5">
                          Roster: {reg.teamMembers?.map((m: any) => m.name).join(', ') || 'No members listed'}
                        </div>
                      </div>
                    ) : (
                      <span className="italic opacity-40">Solo Entry</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {reg.attended ? (
                      <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white bg-green-700" style={{ fontFamily: 'var(--font-os)' }}>
                        ✓ Attended
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] border border-gray-300 opacity-50" style={{ fontFamily: 'var(--font-os)' }}>
                        Not Yet
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(reg)}
                      disabled={deletingId === reg._id}
                      className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-os)' }}
                    >
                      {deletingId === reg._id ? '…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// 4. FORM BUILDER & SUBMISSIONS VIEW
function FormBuilderView({ forms, isLoading, events, queryClient }: { forms: any[]; isLoading: boolean; events: any[]; queryClient: any }) {
  const [formOpen, setFormOpen] = useState(false)
  const [activeFormResponses, setActiveFormResponses] = useState<any | null>(null)
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [eventId, setEventId] = useState('')
  const [fields, setFields] = useState<FormFieldInput[]>([
    { name: 'reason', label: 'Why do you want to join?', type: 'textarea', required: true, optionsString: '' }
  ])

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: `field_${Date.now()}`, label: 'New Question', type: 'text', required: true, optionsString: '' }
    ])
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, key: keyof FormFieldInput, val: any) => {
    const updated = [...fields]
    updated[index] = {
      ...updated[index],
      [key]: val
    } as any
    setFields(updated)
  }

  const handleFormBuilderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const formattedFields = fields.map((f) => ({
      name: f.name.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
      label: f.label.trim(),
      type: f.type,
      required: f.required,
      options: f.type === 'select' ? f.optionsString.split(',').map((o) => o.trim()).filter(Boolean) : undefined
    }))

    const payload = {
      title,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-'),
      eventId: eventId || undefined,
      fields: formattedFields,
      isPublished: true
    }

    try {
      await api.post('/admin/forms', payload)
      setFormSuccess('Dynamic Form Builder published successfully!')
      queryClient.invalidateQueries({ queryKey: ['adminForms'] })
      setTimeout(() => {
        setFormOpen(false)
      }, 1200)
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to publish form')
    }
  }

  const viewResponses = async (form: any) => {
    try {
      const res = await api.get(`/admin/forms/${form._id}/responses`)
      setActiveFormResponses(res.data)
    } catch (err) {
      alert('Failed to load responses')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline border-b pb-2" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Dynamic Questionnaire Forms</h2>
        <div className="flex gap-2">
          {activeFormResponses && (
            <button
              onClick={() => setActiveFormResponses(null)}
              className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold border border-black hover:bg-black/[0.03]"
              style={{ fontFamily: 'var(--font-os)' }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => { setFormOpen(true); setActiveFormResponses(null) }}
            className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-red)] transition-colors hover:bg-red-800"
            style={{ fontFamily: 'var(--font-os)' }}
          >
            + Create New Form
          </button>
        </div>
      </div>

      {activeFormResponses ? (
        // RESPONSES VIEW
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-black/[0.02] p-4 border" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
            <div>
              <h3 className="font-[family-name:var(--font-serif)] text-xl font-bold italic">{activeFormResponses.form.title} Responses</h3>
              <p className="text-xs opacity-60 mt-0.5">Total submissions: {activeFormResponses.responses.length}</p>
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:7860'}/admin/forms/${activeFormResponses.form._id}/export`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-ink)] hover:bg-black"
              style={{ fontFamily: 'var(--font-os)' }}
            >
              📥 Download CSV Responses
            </a>
          </div>

          {activeFormResponses.responses.length === 0 ? (
            <div className="py-12 text-center border italic opacity-60">No responses submitted yet for this form.</div>
          ) : (
            <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                    <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Date</th>
                    <th className="p-3 text-[10px] uppercase tracking-[0.12em]">User</th>
                    {activeFormResponses.form.fields.map((f: any) => (
                      <th key={f.name} className="p-3 text-[10px] uppercase tracking-[0.12em]">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeFormResponses.responses.map((resp: any) => (
                    <tr key={resp._id} className="border-b hover:bg-black/[0.01]" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                      <td className="p-3 text-xs opacity-75">{new Date(resp.submittedAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="font-[family-name:var(--font-serif)] font-bold">{resp.userId?.name}</div>
                        <div className="text-[10px] opacity-60">{resp.userId?.email}</div>
                      </td>
                      {activeFormResponses.form.fields.map((f: any) => {
                        const val = resp.responseData[f.name]
                        return (
                          <td key={f.name} className="p-3 text-xs">
                            {Array.isArray(val) ? val.join('; ') : val?.toString() || <span className="opacity-40 italic">empty</span>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : formOpen ? (
        // FORM BUILDER DOCK
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border p-6 bg-black/[0.01]"
          style={{ borderColor: 'var(--news-ink)' }}
        >
          <h3 className="mb-4 font-[family-name:var(--font-serif)] text-xl font-bold">Dynamic Questionnaire Builder</h3>

          {formError && <div className="mb-4 text-xs font-bold text-red-600">{formError}</div>}
          {formSuccess && <div className="mb-4 text-xs font-bold text-emerald-700">{formSuccess}</div>}

          <form onSubmit={handleFormBuilderSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Form Title</label>
                <input required value={title} onChange={e => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')) }} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Form URL Slug</label>
                <input required value={slug} onChange={e => setSlug(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Link Event (Optional)</label>
                <select value={eventId} onChange={e => setEventId(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  <option value="">None (Independent Form)</option>
                  {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
              </div>
            </div>

            {/* Questions Layout */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="font-bold text-sm">Fields & Questions Config</h4>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-2.5 py-1 text-[9px] border hover:bg-black/[0.04] uppercase font-bold"
                >
                  + Add Question
                </button>
              </div>

              {fields.map((field, index) => (
                <div key={index} className="flex flex-wrap items-end gap-3 p-3 border border-dashed" style={{ borderColor: 'rgba(26,22,18,.25)' }}>
                  <div className="flex flex-col min-w-[150px] flex-1">
                    <label className="mb-1 text-[8px] uppercase opacity-55">Question label</label>
                    <input required value={field.label} onChange={e => handleFieldChange(index, 'label', e.target.value)} className="border bg-transparent px-2 py-1 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                  </div>
                  <div className="flex flex-col min-w-[120px]">
                    <label className="mb-1 text-[8px] uppercase opacity-55">Key (lowercase, letters only)</label>
                    <input required value={field.name} onChange={e => handleFieldChange(index, 'name', e.target.value)} className="border bg-transparent px-2 py-1 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                  </div>
                  <div className="flex flex-col min-w-[120px]">
                    <label className="mb-1 text-[8px] uppercase opacity-55">Input Type</label>
                    <select value={field.type} onChange={e => handleFieldChange(index, 'type', e.target.value as any)} className="border bg-transparent px-2 py-1 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                      <option value="email">Email Input</option>
                      <option value="textarea">Textarea (Paragraph)</option>
                      <option value="select">Dropdown Choice</option>
                      <option value="checkbox">Checkbox (Yes/No)</option>
                    </select>
                  </div>

                  {field.type === 'select' && (
                    <div className="flex flex-col min-w-[180px] flex-1">
                      <label className="mb-1 text-[8px] uppercase opacity-55">Options (comma-separated)</label>
                      <input required placeholder="Yes, No, Maybe" value={field.optionsString} onChange={e => handleFieldChange(index, 'optionsString', e.target.value)} className="border bg-transparent px-2 py-1 text-xs outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                    </div>
                  )}

                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider cursor-pointer">
                      <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(index, 'required', e.target.checked)} />
                      Required
                    </label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="text-[9px] uppercase font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button type="submit" className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white bg-[var(--news-ink)]" style={{ fontFamily: 'var(--font-os)' }}>
                Publish Builder Form
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] border border-black" style={{ fontFamily: 'var(--font-os)' }}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        // FORMS LIST
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isLoading ? (
            <div className="text-center py-6 col-span-2">Loading forms...</div>
          ) : forms.length === 0 ? (
            <div className="text-center italic opacity-60 border p-8 col-span-2">No questionnaires created yet.</div>
          ) : (
            forms.map((form) => (
              <div key={form._id} className="border p-5 flex flex-col justify-between" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                <div>
                  <h3 className="font-[family-name:var(--font-serif)] text-lg font-bold">{form.title}</h3>
                  <div className="text-[10px] uppercase tracking-[0.1em] font-semibold opacity-50 mt-1">
                    Slug: /{form.slug}
                  </div>
                  {form.eventId && (
                    <div className="text-[9px] uppercase tracking-[0.1em] mt-1" style={{ color: 'var(--news-red)' }}>
                      Linked to: {form.eventId.title}
                    </div>
                  )}
                  <p className="text-xs opacity-75 mt-3">Contains {form.fields.length} configure field question(s).</p>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-[0.1em] font-bold opacity-60">Status: Published</span>
                  <button
                    onClick={() => viewResponses(form)}
                    className="px-3 py-1 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-ink)] hover:bg-black"
                  >
                    View Responses →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// 5. CONTACT MESSAGES VIEW
function MessagesView({ messages, isLoading }: { messages: any[]; isLoading: boolean }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = messages.filter((msg) => {
    const term = searchTerm.toLowerCase()
    return (
      msg.fullName?.toLowerCase().includes(term) ||
      msg.sapId?.toLowerCase().includes(term) ||
      msg.email?.toLowerCase().includes(term) ||
      msg.campusDept?.toLowerCase().includes(term) ||
      msg.message?.toLowerCase().includes(term)
    )
  })

  // Export CSV locally
  const handleCSVExport = () => {
    const headers = ['Date', 'Full Name', 'SAP ID', 'Campus & Department', 'Email', 'Message']
    const rows = [headers]

    filtered.forEach((msg) => {
      rows.push([
        new Date(msg.createdAt).toLocaleString(),
        msg.fullName || 'N/A',
        msg.sapId || 'N/A',
        msg.campusDept || 'N/A',
        msg.email || 'N/A',
        msg.message || 'N/A'
      ])
    })

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `coding_club_messages_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-baseline gap-4 border-b pb-3" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <div>
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Contact Messages</h2>
          <p className="text-xs opacity-60">View queries submitted via the contact form on the Team page.</p>
        </div>
        <button
          onClick={handleCSVExport}
          disabled={filtered.length === 0}
          className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-red)] disabled:opacity-40"
          style={{ fontFamily: 'var(--font-os)' }}
        >
          📥 Export CSV ({filtered.length})
        </button>
      </div>

      {/* Filter/Search */}
      <div className="flex flex-wrap gap-4 p-4 border" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <div className="flex flex-col gap-1.5 w-full sm:w-72">
          <label className="text-[9px] uppercase tracking-[0.1em] opacity-60">Search Messages</label>
          <input
            type="text"
            placeholder="Search by name, SAP ID, email, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border bg-transparent p-1.5 text-xs outline-none focus:border-[var(--news-red)]"
            style={{ borderColor: 'rgba(26,22,18,.3)' }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center italic opacity-60 border p-8">No messages found.</div>
      ) : (
        <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
          <table className="w-full border-collapse text-left text-sm font-sans">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Date</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Sender Details</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Message Content</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((msg) => (
                <tr key={msg._id} className="border-b hover:bg-black/[0.01]" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                  <td className="p-3 text-xs opacity-75 whitespace-nowrap align-top">
                    {new Date(msg.createdAt).toLocaleDateString()}
                    <div className="text-[10px] opacity-50">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap align-top">
                    <div className="font-[family-name:var(--font-serif)] font-bold text-sm text-[var(--news-ink)]">{msg.fullName}</div>
                    <div className="text-xs opacity-70">{msg.email}</div>
                    <div className="text-[10px] opacity-60 mt-1">
                      SAP ID: <span className="font-semibold">{msg.sapId}</span>
                    </div>
                    <div className="text-[10px] opacity-60">
                      Dept/Campus: <span className="font-semibold">{msg.campusDept}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs align-top">
                    <div className="whitespace-pre-wrap leading-relaxed max-w-xl italic border-l-2 pl-3 py-1 bg-black/[0.01] border-black/20 text-[var(--news-ink)]">
                      "{msg.message}"
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
