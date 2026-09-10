import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass, HiOutlineUserPlus, HiOutlineStar, HiOutlineUserGroup,
  HiOutlineCog6Tooth, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle,
  HiOutlineSquares2X2, HiOutlineClock, HiOutlineUsers, HiOutlineChevronRight,
  HiOutlineCommandLine,
} from 'react-icons/hi2'
import Avatar from './Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { contactMatchesQuery, timeAgo } from '../utils/contactUtils'

/**
 * Global command palette + global search (Ctrl/⌘ + K).
 * Searches contacts, groups and recent activity, and exposes app actions.
 */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { contacts, groups, activities } = useContacts()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const listRef = useRef(null)

  useEffect(() => {
    if (open) { setQuery(''); setIndex(0) }
  }, [open])

  const actions = useMemo(
    () => [
      { id: 'a-add', label: 'Add contact', icon: HiOutlineUserPlus, hint: 'N', run: () => navigate('/contacts/new'), keywords: 'new create contact' },
      { id: 'a-dash', label: 'Go to Dashboard', icon: HiOutlineSquares2X2, run: () => navigate('/dashboard'), keywords: 'home overview' },
      { id: 'a-contacts', label: 'View all contacts', icon: HiOutlineUsers, run: () => navigate('/contacts'), keywords: 'list people' },
      { id: 'a-favs', label: 'Open Favorites', icon: HiOutlineStar, run: () => navigate('/favorites'), keywords: 'star favourite' },
      { id: 'a-group', label: 'Manage groups', icon: HiOutlineUserGroup, run: () => navigate('/groups'), keywords: 'organize create group' },
      { id: 'a-activity', label: 'Recent activity', icon: HiOutlineClock, run: () => navigate('/activity'), keywords: 'log history' },
      { id: 'a-profile', label: 'Your profile', icon: HiOutlineUserCircle, run: () => navigate('/profile'), keywords: 'account me' },
      { id: 'a-settings', label: 'Settings', icon: HiOutlineCog6Tooth, run: () => navigate('/settings'), keywords: 'theme preferences dark' },
      { id: 'a-logout', label: 'Log out', icon: HiOutlineArrowRightOnRectangle, run: () => { logout(); navigate('/login') }, keywords: 'signout exit' },
    ],
    [navigate, logout]
  )

  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    const matchedActions = q
      ? actions.filter((a) => a.label.toLowerCase().includes(q) || a.keywords.includes(q)).slice(0, 4)
      : actions.slice(0, 5)
    const matchedContacts = q ? contacts.filter((c) => contactMatchesQuery(c, q)).slice(0, 5) : []
    const matchedGroups = q ? groups.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 3) : []
    const matchedActivity = q ? activities.filter((a) => a.message.toLowerCase().includes(q)).slice(0, 3) : []
    return [
      ...matchedActions.map((a) => ({ type: 'action', ...a })),
      ...matchedContacts.map((c) => ({ type: 'contact', id: `c-${c.id}`, label: c.name, sub: c.email || c.phone, contact: c })),
      ...matchedGroups.map((g) => ({ type: 'group', id: `g-${g.id}`, label: g.name, group: g })),
      ...matchedActivity.map((a) => ({ type: 'activity', id: `ac-${a.id}`, label: a.message, sub: timeAgo(a.createdAt), item: a })),
    ]
  }, [q, actions, contacts, groups, activities])

  const run = useCallback(
    (item) => {
      if (!item) return
      onClose()
      if (item.type === 'action') item.run()
      else if (item.type === 'contact') navigate(`/contacts/${item.contact.id}`)
      else if (item.type === 'group') navigate(`/contacts?group=${encodeURIComponent(item.group.name)}`)
      else if (item.type === 'activity') navigate('/activity')
    },
    [navigate, onClose]
  )

  useEffect(() => setIndex(0), [query])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(results[index]) }
    else if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${index}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [index])

  if (!open) return null

  const SECTION = { action: 'Actions', contact: 'Contacts', group: 'Groups', activity: 'Activity' }
  let lastSection = null

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-lift animate-scale-in">
        <div className="flex items-center gap-3 border-b border-slate-200/70 px-4 dark:border-slate-700/70">
          <HiOutlineMagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search Connectinfo…"
            className="h-14 w-full bg-transparent text-base text-slate-900 outline-none placeholder-slate-400 dark:text-white"
            aria-label="Search contacts, groups and actions"
          />
          <kbd className="hidden shrink-0 rounded-md border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-600 sm:block">ESC</kbd>
        </div>

        <div ref={listRef} className="nice-scroll max-h-[52vh] overflow-y-auto p-2" role="listbox">
          {results.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              No results for “{query}”. Try a different search.
            </p>
          )}
          {results.map((item, i) => {
            const showHeader = SECTION[item.type] !== lastSection
            lastSection = SECTION[item.type]
            const Icon = item.icon
            return (
              <div key={item.id}>
                {showHeader && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{SECTION[item.type]}</p>
                )}
                <button
                  data-idx={i}
                  role="option"
                  aria-selected={i === index}
                  onClick={() => run(item)}
                  onMouseEnter={() => setIndex(i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    i === index ? 'bg-ocean/10 dark:bg-ocean/15' : ''
                  }`}
                >
                  {item.type === 'contact' ? (
                    <Avatar name={item.contact.name} src={item.contact.avatar} size="xs" />
                  ) : item.type === 'group' ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal/15 text-teal"><HiOutlineUserGroup className="h-4 w-4" /></span>
                  ) : item.type === 'activity' ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10 text-slate-400"><HiOutlineClock className="h-4 w-4" /></span>
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ocean/10 text-ocean dark:text-ocean-light">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.label}</span>
                    {item.sub && <span className="block truncate text-xs text-slate-400">{item.sub}</span>}
                  </span>
                  {item.hint ? (
                    <kbd className="rounded-md border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-600">{item.hint}</kbd>
                  ) : (
                    <HiOutlineChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-200/70 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-700/70">
          <span className="flex items-center gap-1.5"><HiOutlineCommandLine className="h-3.5 w-3.5" />Ctrl + K to open</span>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span className="ml-auto hidden sm:block">{user ? `Signed in as ${user.name}` : ''}</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
