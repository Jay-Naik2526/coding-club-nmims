// Coding Club Organizing Committee (OC) 2026–27 recruitment form. The on-site
// form is styled by us but submissions POST straight to the linked Google
// Form, so responses land in the Form (and its linked Sheet) for the faculty
// advisor.
//
// Entry IDs were read directly from the live Google Form's FB_PUBLIC_LOAD_DATA_.

export const GOOGLE_FORM_ID =
  '1FAIpQLScHg2j4Qh-jiQ6w7nU2-y9BJVoc-u4SH6yQevFpaSGnpWQuNw'

export const GOOGLE_FORM_ACTION = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`

export const GOOGLE_FORM_VIEW = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/viewform`

export type FieldType = 'text' | 'email' | 'tel' | 'paragraph' | 'radio' | 'dropdown'

export interface RecruitField {
  entry: string // Google entry.NNN name
  label: string
  type: FieldType
  required: boolean
  options?: string[]
  placeholder?: string
  section?: string
  hint?: string
}

const BRANCHES = ['B.Tech CS', 'B.Tech CE', 'B.Tech AIML', 'B.Tech IT', 'B.Tech CSDS', 'MBA Tech CE']

const DEPARTMENTS = [
  'Web Development',
  'Cybersecurity',
  'Event Management',
  'Marketing & Sponsorships',
  'Documentation & PR',
  'Creative & Social Media',
]

export const RECRUIT_FIELDS: RecruitField[] = [
  { entry: 'entry.1346659396', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Aarav Sharma', section: '01 · Who you are' },
  { entry: 'entry.1567786159', label: 'Email', type: 'email', required: true, placeholder: 'your.email@example.com', section: '01 · Who you are' },
  { entry: 'entry.1793840963', label: 'WhatsApp Number', type: 'tel', required: true, placeholder: '10-digit number', section: '01 · Who you are' },
  { entry: 'entry.1203702725', label: 'Roll No.', type: 'text', required: true, placeholder: 'e.g. B123', section: '02 · On the record' },
  { entry: 'entry.1906535667', label: 'SAP ID', type: 'text', required: true, placeholder: 'e.g. 70552400xxx', section: '02 · On the record' },
  { entry: 'entry.630891200', label: 'Year', type: 'radio', required: true, options: ['1st', '2nd'], section: '02 · On the record' },
  { entry: 'entry.764773396', label: 'Branch', type: 'dropdown', required: true, options: BRANCHES, section: '02 · On the record' },
  { entry: 'entry.564310956', label: 'Division', type: 'radio', required: true, options: ['A', 'B'], section: '02 · On the record' },
  {
    entry: 'entry.61463576',
    label: 'Department Preference 1',
    type: 'dropdown',
    required: true,
    options: DEPARTMENTS,
    section: '03 · Where you belong',
  },
  {
    entry: 'entry.1739502013',
    label: 'Department Preference 2',
    type: 'dropdown',
    required: true,
    options: DEPARTMENTS,
    section: '03 · Where you belong',
  },
  {
    entry: 'entry.561435615',
    label: 'Why Coding Club — what specifically drew you here?',
    type: 'paragraph',
    required: true,
    placeholder: "No jargon needed — tell us what you'd love to build, break, design, or organise.",
    section: '04 · In your own words',
  },
]
