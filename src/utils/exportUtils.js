/* JSON / CSV export & import for contacts */
import { isValidEmail, isValidPhone } from './validation'

const EXPORT_FIELDS = ['name', 'email', 'phone', 'company', 'jobTitle', 'website', 'notes', 'tags', 'group', 'favorite']

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportContactsJSON(contacts) {
  const data = contacts.map((c) =>
    Object.fromEntries(EXPORT_FIELDS.map((f) => [f, c[f] ?? (f === 'tags' ? [] : f === 'favorite' ? false : '')]))
  )
  download(`connectinfo-contacts-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json')
}

function csvEscape(value) {
  const s = Array.isArray(value) ? value.join('; ') : String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportContactsCSV(contacts) {
  const header = EXPORT_FIELDS.join(',')
  const rows = contacts.map((c) => EXPORT_FIELDS.map((f) => csvEscape(c[f])).join(','))
  download(`connectinfo-contacts-${stamp()}.csv`, [header, ...rows].join('\n'), 'text/csv')
}

/** Minimal but robust CSV parser (handles quoted cells + commas). */
export function parseCSV(text) {
  const rows = []
  let row = [], cell = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') inQuotes = false
      else cell += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some((v) => v !== '')) rows.push(row)
  return rows
}

/** Normalize an imported record into our contact shape (imports w/o owner fields). */
function normalizeImported(raw) {
  const get = (obj, keys) => {
    for (const k of keys) {
      const hit = Object.keys(obj).find((ok) => ok.toLowerCase().replace(/[\s_-]/g, '') === k)
      if (hit) return obj[hit]
    }
    return ''
  }
  const tagsRaw = get(raw, ['tags'])
  return {
    name: String(get(raw, ['name', 'fullname']) || '').trim(),
    email: String(get(raw, ['email', 'mail']) || '').trim(),
    phone: String(get(raw, ['phone', 'phonenumber', 'mobile']) || '').trim(),
    company: String(get(raw, ['company', 'organization', 'org']) || '').trim(),
    jobTitle: String(get(raw, ['jobtitle', 'title', 'role']) || '').trim(),
    website: String(get(raw, ['website', 'url']) || '').trim(),
    notes: String(get(raw, ['notes', 'note']) || '').trim(),
    tags: Array.isArray(tagsRaw)
      ? tagsRaw.map(String).map((t) => t.trim()).filter(Boolean)
      : String(tagsRaw || '').split(/[;,]/).map((t) => t.trim()).filter(Boolean),
    group: String(get(raw, ['group', 'category']) || '').trim(),
    favorite: raw.favorite === true || String(get(raw, ['favorite', 'favourite'])).toLowerCase() === 'true',
  }
}

/**
 * Parse imported file text (JSON array or CSV) → { valid: [], invalid: [{row, reason}] }
 */
export function parseImport(text, filename = '') {
  let records = []
  const isJSON = filename.toLowerCase().endsWith('.json') || text.trim().startsWith('[')
  try {
    if (isJSON) {
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error('JSON must be an array of contacts.')
      records = data
    } else {
      const rows = parseCSV(text)
      if (rows.length < 2) throw new Error('CSV needs a header row and at least one contact row.')
      const headers = rows[0].map((h) => h.trim())
      records = rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])))
    }
  } catch (err) {
    return { error: err.message || 'Could not parse the file.', valid: [], invalid: [] }
  }

  const valid = [], invalid = []
  for (const raw of records) {
    const c = normalizeImported(raw)
    if (!c.name) { invalid.push({ row: c.name || c.email || c.phone || '(empty row)', reason: 'Missing name' }); continue }
    if (!c.email && !c.phone) { invalid.push({ row: c.name, reason: 'Needs an email or phone' }); continue }
    if (c.email && !isValidEmail(c.email)) { invalid.push({ row: c.name, reason: `Invalid email (${c.email})` }); continue }
    if (c.phone && !isValidPhone(c.phone)) { invalid.push({ row: c.name, reason: `Invalid phone (${c.phone})` }); continue }
    valid.push(c)
  }
  return { valid, invalid, error: null }
}
