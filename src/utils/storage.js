/**
 * Centralised LocalStorage layer for Connectinfo.com.
 * ALL keys live here — never sprinkle raw keys around the app.
 *
 * Key map:
 *   ci_users       → [{ id, name, email, passwordHash, phone, avatar, createdAt }]
 *   ci_current     → current user id (localStorage = remembered, sessionStorage = session-only)
 *   ci_contacts    → [{ id, ownerId, ... }]
 *   ci_groups      → [{ id, ownerId, name }]
 *   ci_activities  → [{ id, userId, type, message, contactId, createdAt }]
 *   ci_settings    → { [userId]: { ... } }
 *   ci_theme       → 'light' | 'dark' | 'system'
 */

export const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`

const KEYS = {
  USERS: 'ci_users',
  CURRENT: 'ci_current',
  CONTACTS: 'ci_contacts',
  GROUPS: 'ci_groups',
  ACTIVITIES: 'ci_activities',
  SETTINGS: 'ci_settings',
  THEME: 'ci_theme',
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

/* ---------------- Users ---------------- */
export const getUsers = () => read(KEYS.USERS, [])
export const saveUsers = (users) => write(KEYS.USERS, users)

export function getCurrentUserId() {
  return sessionStorage.getItem(KEYS.CURRENT) || localStorage.getItem(KEYS.CURRENT) || null
}

export function setCurrentUserId(id, remember = true) {
  if (remember) {
    localStorage.setItem(KEYS.CURRENT, id)
    sessionStorage.removeItem(KEYS.CURRENT)
  } else {
    sessionStorage.setItem(KEYS.CURRENT, id)
    localStorage.removeItem(KEYS.CURRENT)
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(KEYS.CURRENT)
  sessionStorage.removeItem(KEYS.CURRENT)
}

export function getCurrentUser() {
  const id = getCurrentUserId()
  if (!id) return null
  return getUsers().find((u) => u.id === id) || null
}

/* ---------------- Contacts ---------------- */
export const getAllContacts = () => read(KEYS.CONTACTS, [])
export const saveAllContacts = (contacts) => write(KEYS.CONTACTS, contacts)
export const getContactsFor = (userId) => getAllContacts().filter((c) => c.ownerId === userId)

/* ---------------- Groups ---------------- */
export const getAllGroups = () => read(KEYS.GROUPS, [])
export const saveAllGroups = (groups) => write(KEYS.GROUPS, groups)
export const getGroupsFor = (userId) => getAllGroups().filter((g) => g.ownerId === userId)

/* ---------------- Activities ---------------- */
export const getAllActivities = () => read(KEYS.ACTIVITIES, [])
export const saveAllActivities = (activities) => write(KEYS.ACTIVITIES, activities)
export const getActivitiesFor = (userId) => getAllActivities().filter((a) => a.userId === userId)

export function appendActivity(entry) {
  const all = getAllActivities()
  all.unshift(entry)
  // keep storage lean — cap the global log
  saveAllActivities(all.slice(0, 600))
}

/* ---------------- Settings ---------------- */
export const DEFAULT_SETTINGS = {
  theme: 'system',
  emailNotifications: true,
  activityNotifications: true,
  defaultView: 'grid',
  defaultSort: 'name-asc',
  confirmDelete: true,
}

export function getSettings(userId) {
  const all = read(KEYS.SETTINGS, {})
  return { ...DEFAULT_SETTINGS, ...(all[userId] || {}) }
}

export function saveSettings(userId, patch) {
  const all = read(KEYS.SETTINGS, {})
  all[userId] = { ...DEFAULT_SETTINGS, ...(all[userId] || {}), ...patch }
  write(KEYS.SETTINGS, all)
  return all[userId]
}

/* ---------------- Theme ---------------- */
export const getThemePref = () => localStorage.getItem(KEYS.THEME) || 'system'
export const setThemePref = (theme) => localStorage.setItem(KEYS.THEME, theme)
