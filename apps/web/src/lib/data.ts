// Seed/placeholder content — mirrors the reference data arrays.
// Phase 6 swaps these reads for the live API.
import type { DeptId } from './depts'

export type EventStatus = 'open' | 'live' | 'upcoming' | 'closed'

export interface EventItem {
  slug: string
  dept: DeptId
  name: string
  desc: string
  date: string
  status: EventStatus
  diff: number // 1..5
  type: 'SOLO' | 'TEAM'
  color: string
}

export const EVENTS: EventItem[] = [
  { slug: 'codeblitz-4', dept: 'dsa', name: 'CodeBlitz 4.0', desc: '50 problems. 3 hours.', date: 'Jun 14', status: 'open', diff: 3, type: 'SOLO', color: '#0055FF' },
  { slug: 'graph-wars', dept: 'dsa', name: 'Graph Wars', desc: 'BFS, DFS, Dijkstra.', date: 'Jul 2', status: 'upcoming', diff: 4, type: 'SOLO', color: '#0055FF' },
  { slug: 'mock-interviews', dept: 'dsa', name: 'Mock Interviews', desc: 'Live DSA interview sim.', date: 'Jun 28', status: 'upcoming', diff: 3, type: 'SOLO', color: '#0055FF' },
  { slug: 'pixel-perfect', dept: 'web', name: 'PixelPerfect', desc: 'Replicate a design in HTML/CSS.', date: 'Jun 18', status: 'open', diff: 2, type: 'SOLO', color: '#E0006E' },
  { slug: 'api-rumble', dept: 'web', name: 'API Rumble', desc: 'Mystery API. Build fast.', date: 'Jul 5', status: 'upcoming', diff: 3, type: 'TEAM', color: '#E0006E' },
  { slug: 'react-blitz', dept: 'web', name: 'React Blitz', desc: 'Component speed challenge.', date: 'Jun 30', status: 'open', diff: 2, type: 'SOLO', color: '#E0006E' },
  { slug: 'rootkit-ctf', dept: 'sec', name: 'RootKit CTF', desc: 'Multi-category CTF.', date: 'LIVE NOW', status: 'live', diff: 5, type: 'TEAM', color: '#007A3D' },
  { slug: 'cipher-wars', dept: 'sec', name: 'Cipher Wars', desc: 'Pure cryptography.', date: 'Jul 8', status: 'upcoming', diff: 4, type: 'SOLO', color: '#007A3D' },
  { slug: 'recon-league', dept: 'sec', name: 'Recon League', desc: 'OSINT & network recon.', date: 'Jun 22', status: 'open', diff: 3, type: 'TEAM', color: '#007A3D' },
]

export interface SidebarStory {
  kick: string
  head: string
  date: string
  body: string
}

export const SIDEBAR: Record<DeptId, SidebarStory[]> = {
  dsa: [
    { kick: 'OCT 12 — COMPETITION', head: 'Dynamic Programming Demystified', date: 'Oct 12, 18:00', body: 'A breakdown of memoization techniques for competitive programming.' },
    { kick: 'OCT 20 — LAB', head: 'Trees & Graphs Intensive', date: 'Oct 20, 16:00', body: 'Hands-on tree traversal and graph algorithm session.' },
    { kick: 'NOV 05 — SEMINAR', head: 'FAANG Interview Prep', date: 'Nov 5, 15:00', body: 'Common patterns for technical interviews at top companies.' },
  ],
  web: [
    { kick: 'OCT 20 — COMPETITION', head: 'React Server Components Challenge', date: 'Oct 20, 16:00', body: 'The paradigm is shifting — stop shipping monolith bundles.' },
    { kick: 'NOV 02 — WORKSHOP', head: 'Full-Stack in 48 Hours', date: 'Nov 2, 09:00', body: 'Build and deploy a complete product from zero in two days.' },
    { kick: 'NOV 15 — SEMINAR', head: 'Design Systems That Scale', date: 'Nov 15, 14:00', body: 'Tokens, components, and the anatomy of great systems.' },
  ],
  sec: [
    { kick: 'NOV 02 — COMPETITION', head: 'Capture the Flag: Qualifier', date: 'Nov 2, 19:00', body: 'Find vulnerabilities. Exploit the system. Win the simulation.' },
    { kick: 'OCT 30 — WORKSHOP', head: 'Penetration Testing: Zero-Day', date: 'Oct 30, 16:00', body: 'Hands-on ethical hacking with real-world CVE scenarios.' },
    { kick: 'NOV 10 — SEMINAR', head: 'Networking Beyond TCP/IP', date: 'Nov 10, 15:00', body: 'Deep dive into advanced network protocols with alumni.' },
  ],
}

export interface TeamMember {
  role: string
  name: string
  q: string
}

export const TEAM: TeamMember[] = [
  { role: 'Club Head', name: 'Jay Naik', q: '"Build things that last."' },
  { role: 'DSA Lead', name: 'Aryan Sharma', q: '"Code is logic made elegant."' },
  { role: 'Web Lead', name: 'Riya Patel', q: '"Ship or go home."' },
  { role: 'CyberSec Lead', name: 'Omar Shaikh', q: '"Trust no input."' },
  { role: 'Design Lead', name: 'Sneha Desai', q: '"Form follows function."' },
  { role: 'Operations', name: 'Kaden Singh', q: '"Details make the product."' },
]

export const CLUB_STATS = [
  { big: '340+', lbl: 'Members' },
  { big: '18', lbl: 'Events / Year' },
  { big: '2.1K', lbl: 'Problems Solved' },
  { big: '06', lbl: 'Hackathons Won' },
]
