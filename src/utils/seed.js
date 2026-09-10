/* Optional demo data so a fresh account never looks empty. Clearly flagged. */
import { uid } from './storage'

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

const DEMO = [
  { name: 'Arun Kumar', jobTitle: 'Software Engineer', company: 'TechNova Labs', email: 'arun.kumar@example.com', phone: '+91 98410 22334', group: 'Work', tags: ['Developer', 'Important'], favorite: true, notes: 'Met at the Chennai JS meetup. Interested in collaborating on the design-system project.' },
  { name: 'Sarah Wilson', jobTitle: 'Product Designer', company: 'Brightline Studio', email: 'sarah.wilson@example.com', phone: '+1 415 555 0142', group: 'Work', tags: ['Designer'], favorite: true, notes: 'Prefers async communication over email.' },
  { name: 'David Martin', jobTitle: 'Business Consultant', company: 'Martin & Co', email: 'david.martin@example.com', phone: '+44 20 7946 0958', group: 'Clients', tags: ['Client', 'Business'], favorite: false, notes: '' },
  { name: 'Priya Sharma', jobTitle: 'Marketing Lead', company: 'Skyline Media', email: 'priya.sharma@example.com', phone: '+91 90031 45678', group: 'Friends', tags: ['College'], favorite: false, notes: 'College friend — planning the reunion committee.' },
  { name: 'James Chen', jobTitle: 'DevOps Engineer', company: 'CloudPeak', email: 'james.chen@example.com', phone: '+65 8123 4567', group: 'Work', tags: ['Developer'], favorite: false, notes: '' },
  { name: 'Meera Iyer', jobTitle: 'Doctor', company: 'Apollo Hospitals', email: 'meera.iyer@example.com', phone: '+91 98412 77889', group: 'Family', tags: ['Family'], favorite: true, notes: '' },
  { name: 'Tom Becker', jobTitle: 'Startup Founder', company: 'Northstar AI', email: 'tom.becker@example.com', phone: '+49 30 555 0199', group: 'Clients', tags: ['Client', 'Important'], favorite: false, notes: 'Follow up about Q4 retainer.' },
  { name: 'Ananya Rao', jobTitle: 'Data Analyst', company: 'FinEdge', email: 'ananya.rao@example.com', phone: '+91 88790 11223', group: 'Other', tags: ['College', 'Friend'], favorite: false, notes: '' },
]

export function buildDemoContacts(ownerId) {
  return DEMO.map((d, i) => ({
    id: uid('ct'),
    ownerId,
    website: '',
    archived: false,
    avatar: '',
    isDemo: true,
    ...d,
    createdAt: daysAgo(8 - i),
    updatedAt: daysAgo(3 - Math.min(i, 2)),
  }))
}

export function buildDemoGroups(ownerId) {
  return ['Family', 'Friends', 'Work', 'Clients', 'Other'].map((name) => ({ id: uid('grp'), ownerId, name }))
}
