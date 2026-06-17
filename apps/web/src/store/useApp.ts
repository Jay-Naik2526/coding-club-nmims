import { create } from 'zustand'
import { applyAccent, type DeptId } from '@/lib/depts'
import api from '@/lib/api'

const STORAGE_KEY = 'cc_dept_v5'

function readStoredDept(): DeptId | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'dsa' || v === 'web' || v === 'sec') return v
  } catch {
    /* ignore */
  }
  return null
}

export interface User {
  _id: string;
  name: string;
  email: string;
  department: DeptId;
  year: number;
  branch: string;
  githubHandle?: string;
  xp: number;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
}

interface AppState {
  dept: DeptId
  deptChosen: boolean
  user: User | null
  loading: boolean
  setDept: (d: DeptId, persist?: boolean) => void
  setUser: (user: User | null) => void
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
  syncProfile: (data: { department?: DeptId; year?: number; branch?: string; githubHandle?: string }) => Promise<void>
}

export const useApp = create<AppState>((set, get) => {
  const stored = readStoredDept()
  // apply accent immediately on load so there's no color flash
  if (typeof document !== 'undefined') applyAccent(stored ?? 'dsa')
  return {
    dept: stored ?? 'dsa',
    deptChosen: stored !== null,
    user: null,
    loading: true,
    setDept: (d, persist = true) => {
      applyAccent(d)
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, d)
        } catch {
          /* ignore */
        }
      }
      set({ dept: d, deptChosen: true })
    },
    setUser: (user) => set({ user }),
    fetchUser: async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          const user = res.data.user;
          set({ user });
          // Sync department selection to backend choice
          if (user.department) {
            get().setDept(user.department, true);
          }
        } else {
          set({ user: null });
        }
      } catch (err) {
        set({ user: null });
      } finally {
        set({ loading: false });
      }
    },
    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        /* ignore */
      } finally {
        set({ user: null });
      }
    },
    syncProfile: async (data) => {
      try {
        const res = await api.post('/auth/sync-profile', data);
        if (res.data && res.data.user) {
          set({ user: res.data.user });
          if (res.data.user.department) {
            get().setDept(res.data.user.department, true);
          }
        }
      } catch (err) {
        console.error('Failed to sync profile:', err);
        throw err;
      }
    },
  }
})
