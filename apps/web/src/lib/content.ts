// Official Coding Club NMIMS content pool. Single source for brand copy,
// stats, pillars, programs, people, contact, and social links.

export const BRAND = {
  catchphrase: 'Code. Collaborate. Create.',
  tagline: 'Unleash the infinite programming possibilities that await.',
  mission:
    'To build a robust culture of innovation and competitive programming across NMIMS campuses. We democratize technical education by delivering high-quality, practical engineering resources that transform students into industry-ready software developers.',
  pitch:
    'The Coding Club at NMIMS is a student-driven tech community operating out of the Mukesh Patel School of Technology Management & Engineering (MPSTME). We bridge the gap between academic theory and the software industry — empowering aspiring developers to sharpen logical execution, master modern tech stacks, and deploy real-world products.',
}

export const STATS = [
  { big: '500+', lbl: 'Active Members' },
  { big: '20+', lbl: 'Annual Initiatives' },
  { big: '15+', lbl: 'Industry Collaborators' },
  { big: '220+', lbl: 'Peak Registrations' },
]

export const PILLARS = [
  {
    title: 'Skill Development & Algorithmic Rigour',
    body: 'Master foundational data structures, algorithmic tracking, and competitive syntax through interactive peer coding assignments and structured technical labs.',
  },
  {
    title: 'Industry Readiness & Placement Support',
    body: 'Prepare for tech placements and software internships with portfolio advice, technical resume design, and targeted system mock interviews.',
  },
  {
    title: 'Collaborative Ecosystem & Innovation',
    body: 'Connect with industry tech leaders and global developer groups to build functional prototypes, applications, and decentralized networks during collaborative fests.',
  },
]

export interface Program {
  name: string
  tagline: string
  text: string
}

export const PROGRAMS: Program[] = [
  {
    name: 'Campus to Career Seminars',
    tagline: 'Crack Your Tech Placements.',
    text: 'A flagship development series to streamline placement cycles. Senior mentors, industry professionals, and corporate alumni guide students through high-signal GitHub repositories, system design interviews, and technical recruitment stages.',
  },
  {
    name: 'The Ambiora Hackathons',
    tagline: 'Build the Future in 36 Hours.',
    text: 'Our marquee multi-day hackathon, run with major college engineering fests. Teams race the clock to architect, code, and present functional prototypes for complex industrial problem statements — for validation and cash rewards.',
  },
  {
    name: 'NashSttrike',
    tagline: 'Dive into the Cyber Security Frontier.',
    text: 'A high-impact, immersive challenge focused on ethical hacking, network privacy, and modern encryption. Researchers solve cypher puzzles, locate vulnerabilities, and learn defensive threat-mitigation practices.',
  },
  {
    name: 'Web3 & Blockchain Bootcamps',
    tagline: 'Build Decentralised Applications.',
    text: 'Immersive bootcamps with leading data indexes and blockchain networks (such as Covalent). Students dive into smart contract architecture, cryptographic assets, and Ethereum development to earn specialized developer badges.',
  },
  {
    name: 'Web Development & App Intensives',
    tagline: 'Deploy Full-Stack Projects.',
    text: 'Fast-paced, project-driven labs on end-to-end framework deployment — from front-end basics (HTML5, CSS3, modern JavaScript) into advanced backend systems and deployment platforms.',
  },
]

export const FACULTY = [
  { name: 'Prof. Suraj Patil', role: 'Faculty Advisor', photo: '/team/SurajPatil.jpeg' },
  { name: 'Prof. Praveen Landge', role: 'Faculty Advisor', photo: '/team/PraveenLandge.jpeg' },
]

export const FACULTY_NOTE =
  'Providing strategic academic oversight, curriculum mapping, industry-institution interfaces, and compliance monitoring to the student committee.'

export const EXEC_BOARD = [
  { role: 'President / Chairperson', department: 'Executive Leadership' },
  { role: 'Vice President / Co-Chairperson', department: 'Strategic Operations' },
  { role: 'Technical Development Head', department: 'Code Quality & Labs' },
  { role: 'Public Relations & Marketing Lead', department: 'Community Growth' },
  { role: 'Operations & Logistics Manager', department: 'Event Coordination' },
]

export const CAMPUSES = [
  { name: 'MPSTME — Shirpur & Mumbai', note: 'The flagship core of the Coding Club tech ecosystem.' },
  { name: 'NMIMS Hyderabad — CodeIT', note: 'A specialized engineering wing running technical bootcamps for STME.' },
  { name: 'NMIMS Navi Mumbai', note: 'Coordinates with regional forums (Infinix Club, TechCider) on cross-campus coding leagues.' },
]

export const CONTACT = {
  header: 'Connect With the NMIMS Developer Community',
  subtext:
    'Have questions about upcoming hackathons, sponsorship options, or recruitment slots? Drop your details and our core committee will respond.',
  fields: [
    { name: 'fullName', label: 'Full Name', type: 'text' as const },
    { name: 'sapId', label: 'SAP ID / Roll Number', type: 'text' as const, inputMode: 'numeric' as const },
    { name: 'campusDept', label: 'Campus & Academic Department', type: 'select' as const, options: ['MPSTME Mumbai', 'NMIMS Shirpur', 'NMIMS Hyderabad', 'NMIMS Navi Mumbai', 'Other'] },
    { name: 'email', label: 'Primary Email Address', type: 'email' as const },
    { name: 'message', label: 'Message / Query Details', type: 'textarea' as const },
  ],
}

export const SOCIAL = {
  email: 'nmims.codingclub@gmail.com',
  location: 'Mukesh Patel School of Technology Management & Engineering, NMIMS University',
  linkedin: 'https://in.linkedin.com/company/codingclubnmims',
  instagram: 'https://www.instagram.com/codingclubnmims/',
  medium: 'https://medium.com/@nmims.codingclub',
  shirpur: 'https://shirpur.nmims.edu/student-clubs/coding-club/',
}
