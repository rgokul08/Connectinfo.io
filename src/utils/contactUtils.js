import { normalizePhone } from './validation'

/* ---------------- Avatar helpers ---------------- */
const AVATAR_GRADIENTS = [
  'from-coral to-gold',
  'from-ocean to-teal',
  'from-coral to-ocean',
  'from-teal to-ocean',
  'from-gold to-coral',
  'from-ocean-dark to-coral',
]

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?'
}

export function avatarGradient(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
}

/* ---------------- Tag chips ---------------- */
const TAG_STYLES = [
  'bg-teal/10 text-teal-dark dark:text-teal-light',
  'bg-coral/10 text-coral-dark dark:text-coral-light',
  'bg-ocean/10 text-ocean dark:text-ocean-light',
  'bg-gold/25 text-gold-dark dark:text-gold',
]
export function tagStyle(tag = '') {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return TAG_STYLES[h % TAG_STYLES.length]
}

/* ---------------- Dates ---------------- */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function timeAgo(iso) {
  if (!iso) return ''
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return formatDate(iso)
}

/* ---------------- Search / Filter / Sort ---------------- */
export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'newest', label: 'Recently added' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'company', label: 'Company' },
  { value: 'favorites', label: 'Favorites first' },
]

export function contactMatchesQuery(c, q) {
  const hay = [c.name, c.email, c.phone, c.company, c.jobTitle, ...(c.tags || []), c.group]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token))
}

export function sortContacts(list, sort) {
  const arr = [...list]
  const byName = (a, b) => a.name.localeCompare(b.name)
  switch (sort) {
    case 'name-desc': return arr.sort((a, b) => b.name.localeCompare(a.name))
    case 'newest': return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'updated': return arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    case 'company': return arr.sort((a, b) => (a.company || '￿').localeCompare(b.company || '￿') || byName(a, b))
    case 'favorites': return arr.sort((a, b) => Number(b.favorite) - Number(a.favorite) || byName(a, b))
    case 'name-asc':
    default: return arr.sort(byName)
  }
}

export function applyContactFilters(contacts, { query = '', filter = 'all', group = '', tag = '', sort = 'name-asc' } = {}) {
  let list = [...contacts]
  const week = 7 * 24 * 60 * 60 * 1000
  switch (filter) {
    case 'favorites': list = list.filter((c) => c.favorite && !c.archived); break
    case 'recent': list = list.filter((c) => !c.archived && Date.now() - new Date(c.createdAt) < week); break
    case 'archived': list = list.filter((c) => c.archived); break
    default: list = list.filter((c) => !c.archived)
  }
  if (group) list = list.filter((c) => c.group === group)
  if (tag) list = list.filter((c) => (c.tags || []).includes(tag))
  if (query.trim()) list = list.filter((c) => contactMatchesQuery(c, query))
  return sortContacts(list, sort)
}

/* ---------------- Duplicates ---------------- */
export function findDuplicateContact(contacts, { email, phone }, excludeId = null) {
  const e = (email || '').trim().toLowerCase()
  const p = normalizePhone(phone)
  if (!e && !p) return null
  return (
    contacts.find((c) => {
      if (c.id === excludeId) return false
      const matchEmail = e && (c.email || '').trim().toLowerCase() === e
      const matchPhone = p && normalizePhone(c.phone) && normalizePhone(c.phone) === p
      return matchEmail || matchPhone
    }) || null
  )
}

/* ---------------- Share / copy text ---------------- */
export function contactToText(c) {
  const lines = [c.name]
  if (c.jobTitle || c.company) lines.push([c.jobTitle, c.company].filter(Boolean).join(' at '))
  if (c.email) lines.push(`Email: ${c.email}`)
  if (c.phone) lines.push(`Phone: ${c.phone}`)
  if (c.website) lines.push(`Website: ${c.website}`)
  return lines.join('\n')
}

export function contactToVCard(c) {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${c.name}`,
    c.email && `EMAIL:${c.email}`,
    c.phone && `TEL:${c.phone}`,
    (c.company || c.jobTitle) && `ORG:${c.company || ''}`,
    c.jobTitle && `TITLE:${c.jobTitle}`,
    c.website && `URL:${c.website}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers / insecure contexts
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    document.body.removeChild(ta)
    return ok
  }
}

export function allTags(contacts) {
  const set = new Set()
  contacts.forEach((c) => (c.tags || []).forEach((t) => set.add(t)))
  return [...set].sort()
}

export const ACTIVITY_META = {
  contact_created: { icon: 'plus', label: 'Contact' },
  contact_updated: { icon: 'pencil', label: 'Contact' },
  contact_deleted: { icon: 'trash', label: 'Contact' },
  contact_favorited: { icon: 'star', label: 'Favorite' },
  contact_archived: { icon: 'archive', label: 'Archive' },
  contact_restored: { icon: 'restore', label: 'Archive' },
  email_sent: { icon: 'mail', label: 'Email' },
  group_created: { icon: 'group', label: 'Group' },
  group_renamed: { icon: 'group', label: 'Group' },
  group_deleted: { icon: 'group', label: 'Group' },
  contacts_imported: { icon: 'upload', label: 'Import' },
  note_updated: { icon: 'note', label: 'Note' },
}
