import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  uid,
  getAllContacts,
  saveAllContacts,
  getAllGroups,
  saveAllGroups,
  getAllActivities,
  saveAllActivities,
  appendActivity,
} from '../utils/storage'
import { findDuplicateContact } from '../utils/contactUtils'

const ContactContext = createContext(null)
export const useContacts = () => useContext(ContactContext)

export function ContactProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id

  /* Hydrate synchronously from LocalStorage so deep links (e.g. /contacts/:id)
     render the right record on first paint. */
  const loadFor = useCallback((uid) => ({
    contacts: uid ? getAllContacts().filter((c) => c.ownerId === uid) : [],
    groups: uid ? getAllGroups().filter((g) => g.ownerId === uid) : [],
    activities: uid ? getAllActivities().filter((a) => a.userId === uid) : [],
  }), [])

  const [contacts, setContacts] = useState(() => loadFor(userId).contacts)
  const [groups, setGroups] = useState(() => loadFor(userId).groups)
  const [activities, setActivities] = useState(() => loadFor(userId).activities)
  const [loading, setLoading] = useState(false)
  const loadedFor = useRef(userId || null)

  /* Reload this user's slice of the store whenever the account changes. */
  useEffect(() => {
    if (!userId) {
      setContacts([]); setGroups([]); setActivities([])
      loadedFor.current = null
      return
    }
    if (loadedFor.current === userId) return
    loadedFor.current = userId
    setLoading(true)
    const data = loadFor(userId)
    setContacts(data.contacts)
    setGroups(data.groups)
    setActivities(data.activities)
    const t = setTimeout(() => setLoading(false), 350) // lets skeletons render once
    return () => clearTimeout(t)
  }, [userId, loadFor])

  /* ---------------- persistence helpers ---------------- */
  const persistContacts = useCallback(
    (next) => {
      const others = getAllContacts().filter((c) => c.ownerId !== userId)
      saveAllContacts([...others, ...next])
      setContacts(next)
    },
    [userId]
  )

  const persistGroups = useCallback(
    (next) => {
      const others = getAllGroups().filter((g) => g.ownerId !== userId)
      saveAllGroups([...others, ...next])
      setGroups(next)
    },
    [userId]
  )

  /* ---------------- activity log ---------------- */
  const log = useCallback(
    (type, message, contactId = null) => {
      if (!userId) return
      const entry = { id: uid('act'), userId, type, message, contactId, createdAt: new Date().toISOString() }
      appendActivity(entry)
      setActivities((a) => [entry, ...a])
    },
    [userId]
  )

  const clearActivities = useCallback(() => {
    saveAllActivities(getAllActivities().filter((a) => a.userId !== userId))
    setActivities([])
  }, [userId])

  /* ---------------- contact CRUD ---------------- */
  const buildContact = useCallback(
    (data) => ({
      id: uid('ct'),
      ownerId: userId,
      name: data.name.trim(),
      email: (data.email || '').trim(),
      phone: (data.phone || '').trim(),
      company: (data.company || '').trim(),
      jobTitle: (data.jobTitle || '').trim(),
      website: (data.website || '').trim(),
      notes: data.notes || '',
      tags: data.tags || [],
      group: data.group || '',
      favorite: Boolean(data.favorite),
      archived: Boolean(data.archived),
      avatar: data.avatar || '',
      isDemo: Boolean(data.isDemo),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [userId]
  )

  const findDuplicate = useCallback(
    (data, excludeId = null) => findDuplicateContact(contacts, data, excludeId),
    [contacts]
  )

  const addContact = useCallback(
    (data, { ignoreDuplicate = false, replaceId = null } = {}) => {
      if (!ignoreDuplicate && !replaceId) {
        const existing = findDuplicate(data)
        if (existing) return { status: 'duplicate', existing }
      }
      if (replaceId) {
        const next = contacts.map((c) =>
          c.id === replaceId ? { ...buildContact(data), id: replaceId, createdAt: c.createdAt } : c
        )
        persistContacts(next)
        log('contact_updated', `Updated ${data.name.trim()}`, replaceId)
        return { status: 'replaced', contact: next.find((c) => c.id === replaceId), replacedId: replaceId }
      }
      const contact = buildContact(data)
      persistContacts([contact, ...contacts])
      log('contact_created', `Added ${contact.name}`, contact.id)
      return { status: 'created', contact }
    },
    [contacts, buildContact, findDuplicate, log, persistContacts]
  )

  /** Atomically overwrite `toId` with new data while removing `fromId` (used for "Replace existing" during edit). */
  const mergeContacts = useCallback(
    (fromId, toId, data) => {
      const next = contacts
        .filter((c) => c.id !== fromId)
        .map((c) => (c.id === toId ? { ...buildContact(data), id: toId, createdAt: c.createdAt } : c))
      persistContacts(next)
      log('contact_updated', `Updated ${data.name.trim()}`, toId)
      return { status: 'replaced', contact: next.find((c) => c.id === toId) }
    },
    [contacts, buildContact, log, persistContacts]
  )

  const updateContact = useCallback(
    (id, patch) => {
      const target = contacts.find((c) => c.id === id)
      if (!target) return
      const next = contacts.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c))
      persistContacts(next)
      if (patch.notes !== undefined && Object.keys(patch).length === 1) {
        log('note_updated', `Updated notes for ${target.name}`, id)
      } else {
        log('contact_updated', `Updated ${target.name}`, id)
      }
    },
    [contacts, log, persistContacts]
  )

  const toggleFavorite = useCallback(
    (id) => {
      const target = contacts.find((c) => c.id === id)
      if (!target) return
      persistContacts(
        contacts.map((c) => (c.id === id ? { ...c, favorite: !c.favorite, updatedAt: new Date().toISOString() } : c))
      )
      const fav = !target.favorite
      log(fav ? 'contact_favorited' : 'contact_updated', fav ? `Favorited ${target.name}` : `Removed ${target.name} from favorites`, id)
      return fav
    },
    [contacts, log, persistContacts]
  )

  const toggleArchive = useCallback(
    (id) => {
      const target = contacts.find((c) => c.id === id)
      if (!target) return
      const archived = !target.archived
      persistContacts(
        contacts.map((c) => (c.id === id ? { ...c, archived, updatedAt: new Date().toISOString() } : c))
      )
      log(archived ? 'contact_archived' : 'contact_restored', archived ? `Archived ${target.name}` : `Restored ${target.name}`, id)
      return archived
    },
    [contacts, log, persistContacts]
  )

  const deleteContact = useCallback(
    (id) => {
      const target = contacts.find((c) => c.id === id)
      persistContacts(contacts.filter((c) => c.id !== id))
      if (target) log('contact_deleted', `Deleted ${target.name}`)
    },
    [contacts, log, persistContacts]
  )

  /* ---------------- groups ---------------- */
  const addGroup = useCallback(
    (name) => {
      const clean = name.trim()
      if (!clean) return { error: 'Group name is required.' }
      if (groups.some((g) => g.name.toLowerCase() === clean.toLowerCase()))
        return { error: 'A group with that name already exists.' }
      const group = { id: uid('grp'), ownerId: userId, name: clean }
      persistGroups([...groups, group])
      log('group_created', `Created group "${clean}"`)
      return { group }
    },
    [groups, log, persistGroups, userId]
  )

  const renameGroup = useCallback(
    (id, name) => {
      const clean = name.trim()
      const target = groups.find((g) => g.id === id)
      if (!clean || !target || clean === target.name) return
      if (groups.some((g) => g.id !== id && g.name.toLowerCase() === clean.toLowerCase()))
        return { error: 'A group with that name already exists.' }
      persistGroups(groups.map((g) => (g.id === id ? { ...g, name: clean } : g)))
      persistContacts(contacts.map((c) => (c.group === target.name ? { ...c, group: clean } : c)))
      log('group_renamed', `Renamed group "${target.name}" to "${clean}"`)
      return {}
    },
    [contacts, groups, log, persistContacts, persistGroups]
  )

  const deleteGroup = useCallback(
    (id) => {
      const target = groups.find((g) => g.id === id)
      if (!target) return
      persistGroups(groups.filter((g) => g.id !== id))
      persistContacts(contacts.map((c) => (c.group === target.name ? { ...c, group: '' } : c)))
      log('group_deleted', `Deleted group "${target.name}"`)
    },
    [contacts, groups, log, persistContacts, persistGroups]
  )

  /* ---------------- import / clear ---------------- */
  const importContacts = useCallback(
    (records, onDuplicates = 'skip') => {
      let imported = 0, skipped = 0
      const fresh = []
      const pool = [...contacts]
      for (const rec of records) {
        const dup = findDuplicateContact(pool, rec)
        if (dup && onDuplicates === 'skip') { skipped++; continue }
        if (dup && onDuplicates === 'replace') {
          const target = dup.id
          const next = pool.map((c) => (c.id === target ? { ...c, ...rec, id: target, createdAt: c.createdAt } : c))
          pool.splice(0, pool.length, ...next)
          imported++; continue
        }
        const built = buildContact({ ...rec, tags: rec.tags || [] })
        pool.unshift(built); fresh.push(built); imported++
      }
      persistContacts(pool)
      if (imported > 0) log('contacts_imported', `Imported ${imported} contact${imported === 1 ? '' : 's'}`)
      // ensure imported groups exist
      const newGroupNames = [...new Set(records.map((r) => (r.group || '').trim()).filter(Boolean))]
        .filter((n) => !groups.some((g) => g.name.toLowerCase() === n.toLowerCase()))
      if (newGroupNames.length) {
        persistGroups([...groups, ...newGroupNames.map((name) => ({ id: uid('grp'), ownerId: userId, name }))])
      }
      return { imported, skipped }
    },
    [buildContact, contacts, groups, log, persistContacts, persistGroups, userId]
  )

  const clearAllContacts = useCallback(() => {
    persistContacts([])
  }, [persistContacts])

  const clearDemoContacts = useCallback(() => {
    persistContacts(contacts.filter((c) => !c.isDemo))
  }, [contacts, persistContacts])

  const getContact = useCallback((id) => contacts.find((c) => c.id === id) || null, [contacts])

  const value = useMemo(
    () => ({
      contacts, groups, activities, loading,
      getContact, addContact, updateContact, deleteContact, mergeContacts,
      toggleFavorite, toggleArchive,
      addGroup, renameGroup, deleteGroup,
      importContacts, clearAllContacts, clearDemoContacts,
      log, clearActivities, findDuplicate,
    }),
    [contacts, groups, activities, loading, getContact, addContact, updateContact, deleteContact, mergeContacts, toggleFavorite, toggleArchive, addGroup, renameGroup, deleteGroup, importContacts, clearAllContacts, clearDemoContacts, log, clearActivities, findDuplicate]
  )

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}
