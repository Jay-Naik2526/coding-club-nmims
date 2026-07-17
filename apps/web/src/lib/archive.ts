// Past events from Ambiora 2026 / last academic session. Content + photos
// sourced from the official Coding Club event reports. Photos live in
// public/events/<slug>/{1..4}.jpeg
import type { DeptId } from './depts'

export interface Highlight {
  time?: string
  head: string
  body: string
}

export interface ArchiveEvent {
  slug: string
  title: string
  dept: DeptId
  color: string
  date: string
  time: string
  venue: string
  fest: string
  tagline: string
  byline: string[] // leads / presenters
  bylineLabel: string
  summary: string
  highlights: Highlight[]
  conclusion: string
  photoCount: number // photos at /events/<slug>/{1..n}.jpeg
}

export const ARCHIVE: ArchiveEvent[] = [
  {
    slug: 'deepfake-hisence',
    title: 'Deepfake Hisence',
    dept: 'sec',
    color: '#007A3D',
    date: '21 February 2026',
    time: '10:00 AM – 4:00 PM',
    venue: 'Computer Lab',
    fest: 'Ambiora 2026',
    tagline: 'A browser-based cybersecurity investigation: trace the breach, name the culprit.',
    byline: ['Coding Club — Cybersecurity'],
    bylineLabel: 'Organized by',
    summary:
      'Deepfake Hisence was an immersive, browser-based cybersecurity investigation event conducted as part of Ambiora 2026. Participants acted as digital forensic investigators navigating a fictional compromised network — the DFH system — to uncover what had gone wrong, who was responsible, and how the breach occurred. Spanning a full day, it wove web-based puzzle-solving, file analysis, steganography, SQL injection, Morse code decoding, and AI-assisted log analysis into a single cohesive investigative challenge.',
    highlights: [
      { time: '10:00 AM', head: 'System Briefing', body: 'Participants accessed a fictional internal "Investigation Headquarters", navigating top to bottom to uncover hidden clues, interact with bots, and analyze files. AI tools were encouraged — think like a real analyst.' },
      { time: '10:20 AM', head: 'The Void & First Clue', body: 'A hidden Bell icon redirected to void.html. Inspecting the source revealed a redacted "PR preferred value"; repeatedly interacting until a cycle counter crossed it unlocked generator.html.' },
      { time: '10:40 AM', head: 'The Janitor Bot', body: 'The DFH Maintenance Utility exposed an interactive terminal. Commands like list, status, and scan flagged UID 4472 — an account "that should not exist at night" — as the key suspect from the start.' },
      { time: '11:00 AM', head: 'Multi-Bot Exploration', body: 'Participants met the Janitor, Phantom, Ghost, Echobot, and Archist; cracked an access-key challenge, the Archist passphrase, and an SQL injection portal while piecing together hidden files.' },
    ],
    conclusion:
      'Deepfake Hisence stood out as a uniquely layered, technically demanding event. By weaving web exploration, bot interaction, steganography, SQL injection, Morse code, log forensics, and AI-assisted analysis into one narrative, it gave participants a hands-on taste of real-world cybersecurity investigation — demonstrating how misconfigured services, compromised credentials, and social engineering combine to bring down a system.',
    photoCount: 4,
  },
  {
    slug: 'code-relay',
    title: 'Code-Relay',
    dept: 'dsa',
    color: '#0055FF',
    date: '21 February 2026',
    time: '02:00 PM onward',
    venue: 'Computer Lab',
    fest: 'Ambiora 2026',
    tagline: 'Three islands. Aptitude, code, and cipher — sail through or sink.',
    byline: ['Niyati J', 'Tisha Chandani'],
    bylineLabel: 'Leads',
    summary:
      'Code-Relay was a multi-stage technical event testing participants across aptitude, programming, and cryptography. An island-based theme guided contestants through three progressively challenging rounds — on entry, three islands appeared on screen, each a distinct stage, creating an immersive, gamified experience from the very beginning.',
    highlights: [
      { head: 'Scoring — Blue & Red Ships', body: 'Each island held questions as ships: blue (easier, +10 / −5) and red (harder, +20 / −10), each under a strict time limit — balancing accuracy against speed.' },
      { time: '2:15 PM', head: 'Island 1 — Aptitude', body: 'Quantitative and logical questions spanning PMI concepts, probability & statistics, AP/GP, and mathematical reasoning, under time pressure with negative marking.' },
      { time: '3:15 PM', head: 'Island 2 — Coding', body: 'Functional code under the clock: Fibonacci, Armstrong numbers, string and number reversal, and similar algorithmic tasks — harder problems carrying higher risk and reward.' },
      { time: '4:15 PM', head: 'Island 3 — Cypher', body: 'A cryptography and codebreaking round: armed with a cipher key, participants decoded the most intellectually layered challenge of the event.' },
      { head: 'White Ship Bonus', body: 'Between rounds, time-limited white ships let the fastest correct responder either boost their own score or attack an opponent — a strategic, game-show-like twist.' },
    ],
    conclusion:
      'Code-Relay brought aptitude, programming, and cryptography under one creatively themed format. The island structure kept participants engaged; the dual-difficulty ships, timed constraints, and negative marking kept it fair and challenging; and the white-ship bonus rounds added strategy beyond raw knowledge — embodying the spirit of Ambiora 2026.',
    photoCount: 4,
  },
  {
    slug: 'nash-sttrike',
    title: 'Nash Sttrike',
    dept: 'sec',
    color: '#007A3D',
    date: '17 January 2026',
    time: '10:30 AM – 4:00 PM',
    venue: 'Seminar Hall',
    fest: 'Coding Club',
    tagline: 'From digital footprints to OSINT — a full-day cybersecurity awareness deep dive.',
    byline: ['Vrind Rajvanshi', 'Rohan Painter', 'Jay Naik'],
    bylineLabel: 'Presenters',
    summary:
      'Nash Sttrike was a cybersecurity awareness event designed to build both theoretical knowledge and practical investigation skills. Spanning a full day in the Seminar Hall, it was structured into two segments separated by a lunch break, each deepening participants’ understanding of ethical hacking, digital forensics, and online safety.',
    highlights: [
      { time: '10:30 AM', head: 'Cybersecurity Overview', body: 'Co-Lead Rohan Painter introduced the landscape — Black/Grey/White Hat hackers and Red/Blue/Green subtypes, plus Red, Blue, and Purple Team roles.' },
      { time: '11:00 AM', head: 'Digital Footprint Hunt', body: 'Participants analyzed a fictional Instagram account, following clues (an exposed ID card, a pet name, a Twitter link) across Twitter, Facebook, LinkedIn, and GitHub — where a mistakenly uploaded .env file leaked API keys.' },
      { time: '11:45 AM', head: 'White-Hat & OSINT', body: 'A custom Coding Club website simulated a white-hat scenario; using backtracking and OSINT, participants identified a hacker’s identity and learned password psychology.' },
      { time: '12:15 PM', head: 'Steganography & Metadata', body: 'Hidden messages in image pixel data and metadata were revealed using online steganography and metadata-inspection tools.' },
      { time: '2:00 PM', head: 'Hands-On Hacking Challenge', body: 'Assuming a hacker’s role, participants tracked a victim across Instagram, Facebook, LinkedIn, and GitHub — clues hidden via steganography, Base64, and metadata leading step by step to login credentials.' },
    ],
    conclusion:
      'Nash Sttrike combined theoretical instruction with a multi-stage practical challenge, fostering a strong understanding of digital safety, ethical-hacking principles, and the real risks of oversharing personal information online.',
    photoCount: 4,
  },
]

export const archiveBySlug = (slug: string) => ARCHIVE.find((e) => e.slug === slug)
export const photoPath = (slug: string, n: number) => `/events/${slug}/${n}.jpeg`
