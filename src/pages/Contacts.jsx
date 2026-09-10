import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineUsers, HiOutlineStar,
  HiOutlineClock, HiOutlineArchiveBox, HiOutlineSquares2X2, HiOutlineListBullet,
  HiOutlineXMark, HiOutlineTag, HiOutlineEnvelope, HiOutlinePhone, HiOutlineTrash,
} from 'react-icons/hi2'
import ContactCard from '../components/ContactCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { SkeletonGrid } from '../components/LoadingSkeleton.jsx'
import Avatar from '../components/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { applyContactFilters, allTags, SORT_OPTIONS, tagStyle } from '../utils/contactUtils'
import { gmailComposeUrl, GMAIL_LINK_PROPS } from '../utils/gmail'
import { useDebouncedValue } from '../utils/hooks'
import { getSettings, saveSettings } from '../utils/storage'

const QUICK_FILTERS = [
  { id: 'all', label: 'All', icon: HiOutlineUsers },
  { id: 'favorites', label: 'Favorites', icon: HiOutlineStar },
  { id: 'recent', label: 'Recent', icon: HiOutlineClock },
  { id: 'archived', label: 'Archived', icon: HiOutlineArchiveBox },
]

export default function Contacts() {
  const { user } = useAuth()
  const { contacts, groups, loading, deleteContact } = useContacts()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const settings = useMemo(() => getSettings(user?.id), [user?.id])
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 180)
  const [filter, setFilter] = useState('all')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState(settings.defaultSort)
  const [view, setViewState] = useState(settings.defaultView)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const group = searchParams.get('group') || ''

  const setView = (v) => {
    setViewState(v)
    saveSettings(user?.id, { defaultView: v })
  }

  const tags = useMemo(() => allTags(contacts), [contacts])

  const filtered = useMemo(
    () => applyContactFilters(contacts, { query: debouncedQuery, filter, group, tag, sort }),
    [contacts, debouncedQuery, filter, group, tag, sort]
  )

  const hasActiveFilters = filter !== 'all' || group || tag || debouncedQuery

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteContact(deleteTarget.id)
    toast.success(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }

  const requestDelete = (ct) => {
    if (settings.confirmDelete) setDeleteTarget(ct)
    else {
      deleteContact(ct.id)
      toast.success(`${ct.name} deleted`)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} of {contacts.filter((c) => !c.archived).length} contacts
            {group && <> in <span className="font-semibold text-ocean">{group}</span></>}
          </p>
        </div>
        <Link to="/contacts/new" className="btn-coral">
          <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
          Add contact
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="contact-search"
              type="search"
              placeholder="Search contacts…  ( / )"
              className="input pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search contacts"
            />
          </div>

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto" aria-label="Sort contacts">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700" role="group" aria-label="View mode">
            {[
              { v: 'grid', icon: HiOutlineSquares2X2, label: 'Grid view' },
              { v: 'list', icon: HiOutlineListBullet, label: 'List view' },
            ].map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={label}
                aria-pressed={view === v}
                className={`p-2.5 transition ${view === v ? 'bg-ocean text-white' : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick filters + group/tag */}
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`chip border transition ${
                filter === id
                  ? 'border-ocean bg-ocean text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-ocean hover:text-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}

          <span className="mx-1 hidden h-5 w-px bg-slate-300 dark:bg-slate-700 sm:block" aria-hidden="true" />

          <select
            value={group}
            onChange={(e) => {
              const v = e.target.value
              if (v) setSearchParams({ group: v })
              else setSearchParams({})
            }}
            className="input w-auto py-1.5 text-xs"
            aria-label="Filter by group"
          >
            <option value="">All groups</option>
            {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          {tags.length > 0 && (
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="input w-auto py-1.5 text-xs" aria-label="Filter by tag">
              <option value="">All tags</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => { setQuery(''); setFilter('all'); setTag(''); setSearchParams({}) }}
              className="chip border border-dashed border-slate-300 text-slate-500 transition hover:border-coral hover:text-coral dark:border-slate-600"
            >
              <HiOutlineXMark className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {tag && (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <HiOutlineTag className="h-3.5 w-3.5" />
            Showing contacts tagged <span className={`chip ${tagStyle(tag)}`}>{tag}</span>
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={HiOutlineUsers}
          title="Your contact book is empty"
          message="Start building your network by adding your first contact."
          action={<Link to="/contacts/new" className="btn-primary"><HiOutlinePlus className="h-4 w-4" />Add contact</Link>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineMagnifyingGlass}
          title="No contacts found"
          message="No contacts match your search. Try different keywords or clear your filters."
          tint="gold"
          action={
            <button onClick={() => { setQuery(''); setFilter('all'); setTag(''); setSearchParams({}) }} className="btn-outline">
              Clear search & filters
            </button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <ContactCard key={c.id} contact={c} onDelete={requestDelete} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }} />
          ))}
        </div>
      ) : (
        /* List view */
        <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((c) => (
            <li key={c.id}>
              <div className="flex items-center gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <Avatar name={c.name} src={c.avatar} size="sm" />
                <Link to={`/contacts/${c.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {[c.jobTitle, c.company].filter(Boolean).join(' · ') || c.email || c.phone}
                  </p>
                </Link>
                <div className="hidden items-center gap-2 sm:flex">
                  {c.email && (
                    <a href={gmailComposeUrl(c.email)} {...GMAIL_LINK_PROPS} className="icon-btn" aria-label={`Email ${c.name} via Gmail`} title="Email via Gmail">
                      <HiOutlineEnvelope className="h-5 w-5" />
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="icon-btn" aria-label={`Call ${c.name}`} title="Call">
                      <HiOutlinePhone className="h-5 w-5" />
                    </a>
                  )}
                  <button onClick={() => requestDelete(c)} className="icon-btn hover:bg-red-500/10 hover:text-red-500" aria-label={`Delete ${c.name}`} title="Delete">
                    <HiOutlineTrash className="h-5 w-5" />
                  </button>
                </div>
                {c.favorite && <HiOutlineStar className="h-5 w-5 fill-gold text-gold" aria-label="Favorite" />}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete contact?"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
