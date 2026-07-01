import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '@/lib/api'

const BRANCHES = ['CS', 'CE', 'IT', 'AIML', 'CSDS']
const COURSES = ['B.Tech', 'MBA Tech']

interface UserRow {
  _id: string
  name: string
  email: string
  department: 'dsa' | 'web' | 'sec'
  year: number
  branch: string
  course?: string
  sapId?: string
  githubHandle?: string
  xp: number
  role: 'STUDENT' | 'ADMIN'
  createdAt: string
}

/** Admin CRUD for user accounts — students appear on the public leaderboard,
 *  so admins need a way to correct, promote, or remove accounts. */
export function UsersView({
  users,
  isLoading,
  queryClient,
  currentUserId,
}: {
  users: UserRow[]
  isLoading: boolean
  queryClient: QueryClient
  currentUserId: string
}) {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState<'dsa' | 'web' | 'sec'>('dsa')
  const [year, setYear] = useState(1)
  const [branch, setBranch] = useState(BRANCHES[0])
  const [course, setCourse] = useState(COURSES[0])
  const [sapId, setSapId] = useState('')
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT')
  const [xp, setXp] = useState(0)

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.sapId || '').toLowerCase().includes(q)
  })

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setDepartment('dsa')
    setYear(1)
    setBranch(BRANCHES[0])
    setCourse(COURSES[0])
    setSapId('')
    setRole('STUDENT')
    setXp(0)
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    resetForm()
    setFormError('')
    setFormSuccess('')
    setFormOpen(true)
  }

  const handleOpenEdit = (u: UserRow) => {
    setEditingUser(u)
    setName(u.name)
    setEmail(u.email)
    setPassword('')
    setDepartment(u.department)
    setYear(u.year)
    setBranch(u.branch)
    setCourse(u.course || COURSES[0])
    setSapId(u.sapId || '')
    setRole(u.role)
    setXp(u.xp)
    setFormError('')
    setFormSuccess('')
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    try {
      if (editingUser) {
        await api.post(`/admin/users/${editingUser._id}/update`, {
          name, email, department, year, branch, course, sapId, role, xp,
        })
        setFormSuccess('User updated successfully!')
      } else {
        if (!password) {
          setFormError('Password is required for a new account')
          return
        }
        await api.post('/admin/users', {
          name, email, password, department, year, branch, course, sapId, role,
        })
        setFormSuccess('User created successfully!')
      }
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setTimeout(() => setFormOpen(false), 1200)
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
      setFormError(message || 'Failed to save user')
    }
  }

  const handleDelete = async (u: UserRow) => {
    if (u._id === currentUserId) {
      alert("You can't delete your own account while logged in as it.")
      return
    }
    if (!window.confirm(`Permanently delete ${u.name} (${u.email})? This removes their registrations and badges too.`)) return
    setDeletingId(u._id)
    try {
      await api.post(`/admin/users/${u._id}/delete`)
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined
      alert(message || 'Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-baseline gap-4 border-b pb-3" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
        <div>
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold italic">Registered Users</h2>
          <p className="text-xs opacity-60">Every account visible on the public leaderboard. Edit, promote, or remove any of them here.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-1.5 text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[var(--news-red)]"
          style={{ fontFamily: 'var(--font-os)' }}
        >
          + Add User
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or SAP ID…"
        className="w-full max-w-sm border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]"
        style={{ borderColor: 'rgba(26,22,18,.3)' }}
      />

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
              {editingUser ? `Edit ${editingUser.name}` : 'Create New User'}
            </h3>

            {formError && <div className="mb-4 text-xs font-bold text-red-600">{formError}</div>}
            {formSuccess && <div className="mb-4 text-xs font-bold text-emerald-700">{formSuccess}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Full Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>

              {!editingUser && (
                <div className="flex flex-col sm:col-span-2">
                  <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Password</label>
                  <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                </div>
              )}

              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">SAP ID</label>
                <input value={sapId} onChange={(e) => setSapId(e.target.value)} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Year</label>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Course</label>
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  {(course === 'MBA Tech' ? ['CE'] : BRANCHES).map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Dept Track (theming)</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value as 'dsa' | 'web' | 'sec')} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  <option value="dsa">DSA</option>
                  <option value="web">WEB</option>
                  <option value="sec">SEC</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as 'STUDENT' | 'ADMIN')} className="border bg-transparent p-2 text-sm outline-none" style={{ borderColor: 'rgba(26,22,18,.3)' }}>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {editingUser && (
                <div className="flex flex-col">
                  <label className="mb-1 text-[9px] uppercase tracking-[0.1em] opacity-60">XP</label>
                  <input type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="border bg-transparent p-2 text-sm outline-none focus:border-[var(--news-red)]" style={{ borderColor: 'rgba(26,22,18,.3)' }} />
                </div>
              )}

              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white bg-[var(--news-ink)]" style={{ fontFamily: 'var(--font-os)' }}>
                  {editingUser ? 'Save Changes' : 'Create User'}
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
        <div className="text-center py-8">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center italic opacity-60 border p-8">No users match your search.</div>
      ) : (
        <div className="overflow-x-auto border" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(26,22,18,.18)', background: 'rgba(26,22,18,.02)' }}>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Name & Email</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Academic Profile</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em]">Track</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-center">XP</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-center">Role</th>
                <th className="p-3 text-[10px] uppercase tracking-[0.12em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b hover:bg-black/[0.01]" style={{ borderColor: 'rgba(26,22,18,.1)' }}>
                  <td className="p-3">
                    <div className="font-[family-name:var(--font-serif)] font-bold">{u.name}</div>
                    <div className="text-xs opacity-60">{u.email}</div>
                  </td>
                  <td className="p-3 text-xs opacity-75">
                    {u.course || '—'} · {u.branch} · Yr {u.year}
                    {u.sapId && <div className="opacity-60">SAP: {u.sapId}</div>}
                  </td>
                  <td className="p-3 text-xs uppercase font-bold">{u.department}</td>
                  <td className="p-3 text-center font-black" style={{ fontFamily: 'var(--font-os)' }}>{u.xp}</td>
                  <td className="p-3 text-center">
                    <span
                      className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white"
                      style={{ fontFamily: 'var(--font-os)', background: u.role === 'ADMIN' ? 'var(--news-red)' : 'rgba(26,22,18,.4)' }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2 text-[9px] font-bold uppercase tracking-[0.1em]">
                      <button onClick={() => handleOpenEdit(u)} className="px-2.5 py-1 border hover:bg-black/[0.04]">Edit</button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deletingId === u._id || u._id === currentUserId}
                        className="px-2.5 py-1 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        title={u._id === currentUserId ? "You can't delete your own account" : undefined}
                      >
                        {deletingId === u._id ? '…' : 'Delete'}
                      </button>
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
