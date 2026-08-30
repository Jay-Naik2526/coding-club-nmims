// Organising Committee 2026–27 roster.
//
// Sourced from the per-division selection sheets. Deliberately NO contact data
// (email / phone / SAP ID / roll no.) — this renders on a public page, so it
// carries only what's needed to celebrate the members: name, year, branch.
//
// Core committee members who appeared on a division sheet are intentionally
// omitted here — they belong on the Team page, not the OC roster.

export type Year = '1st' | '2nd'

export interface OcMember {
  name: string
  year: Year
  branch: string
}

export interface OcDivision {
  id: string
  name: string
  short: string
  color: string
  blurb: string
  members: OcMember[]
  /** Selection still in progress — renders a "coming soon" panel instead of cards. */
  pending?: boolean
}

export const OC_DIVISIONS: OcDivision[] = [
  {
    id: 'web',
    name: 'Web Development',
    short: 'Web',
    color: '#0055ff',
    blurb: 'Ships the club platform, dashboards, and everything you are looking at right now.',
    members: [
      { name: 'Aditya Shrivastava', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Dhanashree Laddha', year: '1st', branch: 'B.Tech CSDS' },
      { name: 'Chetan Mittal', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Akshat Tidke', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Archit Tidke', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Eesha Saxena', year: '1st', branch: 'B.Tech AIML' },
      { name: 'Aayush Wani', year: '1st', branch: 'B.Tech CE' },
      { name: 'Krish Mehta', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Dirgh Desai', year: '1st', branch: 'B.Tech CS' },
      { name: 'Smit Patil', year: '1st', branch: 'B.Tech CSDS' },
      { name: 'Abhi Jain', year: '1st', branch: 'B.Tech CS' },
      { name: 'Jal Desai', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Parv Shah', year: '1st', branch: 'B.Tech CE' },
      { name: 'Nishtha Mathur', year: '2nd', branch: 'B.Tech CE' },
      { name: 'Pahal Jain', year: '1st', branch: 'B.Tech CSDS' },
      { name: 'Pranit Chaudhari', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Bhagyashree Talole', year: '1st', branch: 'B.Tech CE' },
    ],
  },
  {
    id: 'sec',
    name: 'Cybersecurity',
    short: 'Cyber',
    color: '#e0006e',
    blurb: 'Runs the CTFs, breaks things on purpose, and defends the club infrastructure.',
    members: [
      { name: 'Aryan Prajapati', year: '1st', branch: 'B.Tech CS' },
      { name: 'Tanay Rathore', year: '1st', branch: 'B.Tech CS' },
      { name: 'Aditya Talekar', year: '1st', branch: 'B.Tech CS' },
      { name: 'Aditi Talekar', year: '1st', branch: 'B.Tech CS' },
      { name: 'Vansh Gaur', year: '1st', branch: 'B.Tech CE' },
      { name: 'Harshita Zope', year: '1st', branch: 'B.Tech CS' },
      { name: 'Maulika Tiwari', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Yash Vardhan Purohit', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Devendra Narvekar', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Parag Singh', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Vedant Patil', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Prem Dadhaniya', year: '1st', branch: 'B.Tech CS' },
      { name: 'Ritika Agrawal', year: '2nd', branch: 'MBA Tech CE' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Sponsorships',
    short: 'Marketing',
    color: '#b86800',
    blurb: 'Brings in the sponsors, the crowds, and the reason anyone shows up.',
    members: [
      { name: 'Diya Kothari', year: '1st', branch: 'B.Tech CSDS' },
      { name: 'Darshil Jain', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Divij Kothari', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Bhavya Soni', year: '1st', branch: 'B.Tech AIML' },
      { name: 'Aayush Singh', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Suhani Paliwal', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Janvi Prajapati', year: '1st', branch: 'B.Tech CSDS' },
      { name: 'Prakhar Tibdewal', year: '2nd', branch: 'B.Tech CE' },
      { name: 'Manan Khandelwal', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Aryan Bargaje', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Om Desai', year: '2nd', branch: 'B.Tech CE' },
      { name: 'Ronak Jadhwani', year: '1st', branch: 'B.Tech CSDS' },
    ],
  },
  {
    id: 'creative',
    name: 'Creative & Social Media',
    short: 'Creative',
    color: '#6D3B8E',
    blurb: 'Designs the posters, shoots the reels, and owns the club’s entire visual identity.',
    members: [
      { name: 'Arnav Srisant', year: '1st', branch: 'B.Tech CS' },
      { name: 'Sanket Patil', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Sushil Dighe', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Shubham Jain', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Dhruv Kawde', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Manyata Kanungo', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Harish Mahajan', year: '2nd', branch: 'B.Tech AIML' },
      { name: 'Dhruv Ubhad', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Arnav Agrawal', year: '2nd', branch: 'MBA Tech CE' },
      { name: 'Tanvi Sarda', year: '1st', branch: 'B.Tech AIML' },
    ],
  },
  {
    id: 'docs',
    name: 'Documentation & PR',
    short: 'Docs & PR',
    color: '#007a3d',
    blurb: 'Writes the record — reports, recaps, and every word the club puts its name on.',
    members: [
      { name: 'Disha Bharade', year: '1st', branch: 'B.Tech CSDS' },
      { name: 'Yash Khelkar', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Kunal Bhadane', year: '2nd', branch: 'B.Tech CS' },
      { name: 'Kavya Shah', year: '2nd', branch: 'B.Tech CE' },
      { name: 'Suneeth Pai', year: '1st', branch: 'MBA Tech CE' },
      { name: 'Shyam Savani', year: '1st', branch: 'B.Tech CS' },
    ],
  },
  {
    id: 'events',
    name: 'Event Management',
    short: 'Events',
    color: '#c8002a',
    blurb: 'Plans, schedules, and actually runs every event the club puts on.',
    pending: true,
    members: [],
  },
]

/** Fun, deterministic alias per member — same name always gets the same title. */
const ALIASES: Record<string, string[]> = {
  web: ['Pixel Pusher', 'Bug Whisperer', 'Midnight Deployer', 'CSS Alchemist', 'Commit Machine', 'Localhost Legend', 'Merge Conflict Survivor', 'Semicolon Sheriff'],
  sec: ['Packet Ninja', 'Flag Hunter', 'Payload Poet', 'Firewall Gremlin', 'Zero-Day Rookie', 'Hash Cracker', 'Shell Sorcerer', 'Log Detective'],
  marketing: ['Deal Closer', 'Hype Engineer', 'Sponsor Whisperer', 'Reach Architect', 'Crowd Summoner', 'Pitch Perfect', 'Footfall Wizard', 'Cold-Mail Sniper'],
  creative: ['Pixel Painter', 'Reel Wizard', 'Palette Boss', 'Frame Fanatic', 'Poster Prodigy', 'Vibe Curator', 'Kerning Nerd', 'Story Stitcher'],
  docs: ['Word Smith', 'Deadline Dodger', 'Minute Master', 'Byline Boss', 'Draft Dynamo', 'Archive Keeper', 'Footnote Fiend', 'Press Pass'],
  events: ['Chaos Coordinator', 'Logistics Legend', 'Stage Commander', 'Clipboard Warrior'],
}

export function aliasFor(divisionId: string, name: string): string {
  const pool = ALIASES[divisionId] ?? ALIASES.web
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return pool[h % pool.length]
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export const OC_TOTAL = OC_DIVISIONS.reduce((n, d) => n + d.members.length, 0)
