// Coding Club core-committee recruitment form. The on-site form is styled by us
// but submissions POST straight to the linked Google Form, so responses land in
// the Form (and its linked Sheet) for the faculty advisor.
//
// Entry IDs were read directly from the live Google Form's FB_PUBLIC_LOAD_DATA_.

export const GOOGLE_FORM_ID =
  '1FAIpQLSca2Q8o3Yng2zPSXKylptd8CAjkzeSdHXGzQA-6nSoHLRqy7Q'

export const GOOGLE_FORM_ACTION = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`

export type FieldType = 'text' | 'email' | 'tel' | 'paragraph' | 'radio' | 'dropdown'

export interface RecruitField {
  entry: string // Google entry.NNN name
  label: string
  type: FieldType
  required: boolean
  options?: string[]
  placeholder?: string
}

const DEPARTMENTS = [
  'Event Management Committee',
  'Web Development Committee',
  'Cybersecurity Committee',
  'Documentation Committee',
  'Marketing & Public Relations Committee',
  'Creative & Social Media Committee',
]

export const RECRUIT_FIELDS: RecruitField[] = [
  { entry: 'entry.1339039699', label: 'Email', type: 'email', required: true },
  { entry: 'entry.1751572590', label: 'Name', type: 'text', required: true },
  { entry: 'entry.1701782884', label: 'Roll Number', type: 'text', required: true },
  { entry: 'entry.647128734', label: 'Year of Study', type: 'radio', required: true, options: ['2nd Year', '3rd Year'] },
  { entry: 'entry.1451533973', label: 'Phone Number', type: 'tel', required: true },
  { entry: 'entry.495930781', label: 'Branch', type: 'radio', required: true, options: ['B.Tech', 'MBA Tech'] },
  { entry: 'entry.529303455', label: 'Department — First Preference', type: 'dropdown', required: true, options: DEPARTMENTS },
  { entry: 'entry.53795616', label: 'Department — Second Preference', type: 'dropdown', required: false, options: DEPARTMENTS },
  { entry: 'entry.951767200', label: 'Past Experience?', type: 'paragraph', required: true, placeholder: 'Projects, clubs, hackathons, anything relevant…' },
  {
    entry: 'entry.1962564838',
    label: 'If you could plan one event for the Coding Club this year — a hackathon, coding contest, CTF, workshop, or anything else — what would it be and why?',
    type: 'paragraph',
    required: true,
    placeholder: 'Pitch your event…',
  },
]
