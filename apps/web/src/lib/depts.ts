// Department identity system — ported & extended from the reference DEPT_CFG.
// The accent color propagates through both worlds via the --acc CSS variable.

export type DeptId = 'dsa' | 'web' | 'sec'

export interface DeptConfig {
  id: DeptId
  acc: string
  label: string
  code: string
  icon: string
  name: string // landing card name (may contain \n)
  desc: string
  // landing hero
  h1: string[]
  haIdx: number
  module: string
  cta: string
  // newspaper
  newsHero: string // "LINE ONE\nLINE TWO"
  newsAccent: string
  newsSub: string
  newsQuote: string
  newsBody: string
}

export const DEPTS: Record<DeptId, DeptConfig> = {
  dsa: {
    id: 'dsa',
    acc: '#0055FF',
    label: '01 — DSA',
    code: 'DSA / CP',
    icon: '⚡',
    name: 'DSA &\nCompetitive',
    desc: 'Algorithms. Data structures.\nProblem sets. Contests.',
    h1: ['MAXIMUM', 'ALGORITHM', 'EFFICIENCY'],
    haIdx: 1,
    module: '[DSA_MODULE_v3.0]',
    cta: 'PROCEED >>',
    newsHero: 'THINK IN\nALGORITHMS.',
    newsAccent: 'ALGORITHMS.',
    newsSub: 'Big-O, graphs, and the cold logic of competitive programming.',
    newsQuote: '"An elegant algorithm is more powerful than brute force."',
    newsBody:
      'Algorithms are the DNA of computation. From dynamic programming to graph traversal, the DSA department trains problem-solvers who think recursively and act decisively.',
  },
  web: {
    id: 'web',
    acc: '#E0006E',
    label: '02 — WEB',
    code: 'Web Dev',
    icon: '🌐',
    name: 'Web\nDevelopment',
    desc: 'Frontend. Backend.\nFull-stack. Ship it.',
    h1: ['SHIP BEFORE', 'YOU', 'SLEEP.'],
    haIdx: 1,
    module: '[WEB_MODULE_v2.4]',
    cta: 'START BUILDING',
    newsHero: 'SHIP OR\nGO HOME.',
    newsAccent: 'GO HOME.',
    newsSub: 'The relentless pursuit of the perfect user experience.',
    newsQuote: '"Code is poetry, debugged into prose."',
    newsBody:
      'Modern web architecture is a battlefield of bytes. From server-side rendering to React Server Components, we build for the edge — fast, accessible, and relentlessly optimized.',
  },
  sec: {
    id: 'sec',
    acc: '#007A3D',
    label: '03 — SEC',
    code: 'CyberSec',
    icon: '🔐',
    name: 'Cyber\nSecurity',
    desc: 'CTF. Recon. Hacking.\nFind the flag.',
    h1: ['ACCESS', 'GRANTED', 'PROCEED.'],
    haIdx: 1,
    module: '[SEC_MODULE_v1.9]',
    cta: 'FIND THE FLAG',
    newsHero: 'BREACH &\nOWN IT.',
    newsAccent: 'OWN IT.',
    newsSub: 'Find the flag. Break the cipher. Every system has a crack.',
    newsQuote: '"The best offense is knowing every defense."',
    newsBody:
      'Cybersecurity is not paranoia — it is preparation. The CyberSec dept runs live CTF competitions, teaches ethical hacking, and builds the next generation of digital defenders.',
  },
}

export const DEPT_ORDER: DeptId[] = ['dsa', 'web', 'sec']

export function applyAccent(dept: DeptId) {
  document.documentElement.style.setProperty('--acc', DEPTS[dept].acc)
}
