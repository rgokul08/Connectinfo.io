import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineUserGroup, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineCheck, HiOutlineXMark, HiOutlineChevronRight,
} from 'react-icons/hi2'
import Avatar from '../components/Avatar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const GROUP_ACCENTS = ['from-ocean to-teal', 'from-coral to-gold', 'from-teal to-ocean', 'from-gold to-coral', 'from-ocean-dark to-coral']

export default function Groups() {
  const { contacts, groups, addGroup, renameGroup, deleteGroup } = useContacts()
  const toast = useToast()
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState({ id: null, name: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  const byGroup = useMemo(() => {
    const map = new Map(groups.map((g) => [g.name, []]))
    const ungrouped = []
    for (const c of contacts) {
      if (c.archived) continue
      if (c.group && map.has(c.group)) map.get(c.group).push(c)
      else ungrouped.push(c)
    }
    return { map, ungrouped }
  }, [contacts, groups])

  const createGroup = (e) => {
    e.preventDefault()
    const { error: err } = addGroup(newName)
    if (err) { setError(err); toast.error(err); return }
    toast.success(`Group "${newName.trim()}" created`)
    setNewName('')
    setError('')
  }

  const saveRename = (group) => {
    const { error: err } = renameGroup(group.id, editing.name)
    if (err) { toast.error(err); return }
    if (editing.name.trim() && editing.name.trim() !== group.name) toast.success('Group renamed')
    setEditing({ id: null, name: '' })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteGroup(deleteTarget.id)
    toast.success(`Group "${deleteTarget.name}" deleted`)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Groups</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Organize contacts into circles that make sense to you.</p>
      </div>

      {/* Create group */}
      <form onSubmit={createGroup} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label htmlFor="new-group" className="sr-only">New group name</label>
        <input
          id="new-group"
          className={`input flex-1 ${error ? 'input-error' : ''}`}
          placeholder="Create a new group… e.g. Investors"
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError('') }}
          maxLength={40}
        />
        <button type="submit" className="btn-primary" disabled={!newName.trim()}>
          <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
          Create group
        </button>
      </form>

      {groups.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No groups yet"
          message="Create your first group — Family, Work, Clients — then assign contacts from their edit screen."
          tint="ocean"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g, i) => {
            const members = byGroup.map.get(g.name) || []
            const isEditing = editing.id === g.id
            return (
              <article key={g.id} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${GROUP_ACCENTS[i % GROUP_ACCENTS.length]} font-display text-lg font-bold text-white shadow-soft`}>
                    {g.name[0]?.toUpperCase()}
                  </span>
                  <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button onClick={() => setEditing({ id: g.id, name: g.name })} className="icon-btn h-8 w-8" aria-label={`Rename group ${g.name}`} title="Rename">
                      <HiOutlinePencilSquare className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(g)} className="icon-btn h-8 w-8 hover:bg-red-500/10 hover:text-red-500" aria-label={`Delete group ${g.name}`} title="Delete">
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 flex items-center gap-1.5">
                    <label htmlFor={`rename-${g.id}`} className="sr-only">Rename {g.name}</label>
                    <input
                      id={`rename-${g.id}`}
                      className="input !py-1.5 text-sm"
                      value={editing.name}
                      autoFocus
                      maxLength={40}
                      onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveRename(g); if (e.key === 'Escape') setEditing({ id: null, name: '' }) }}
                    />
                    <button onClick={() => saveRename(g)} className="icon-btn h-8 w-8 text-teal" aria-label="Save new name"><HiOutlineCheck className="h-4 w-4" /></button>
                    <button onClick={() => setEditing({ id: null, name: '' })} className="icon-btn h-8 w-8" aria-label="Cancel rename"><HiOutlineXMark className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <h2 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">{g.name}</h2>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400">{members.length} contact{members.length === 1 ? '' : 's'}</p>

                {members.length > 0 && (
                  <div className="mt-3 flex -space-x-2.5">
                    {members.slice(0, 5).map((c) => (
                      <span key={c.id} className="rounded-full ring-2 ring-white dark:ring-slate-900" title={c.name}>
                        <Avatar name={c.name} src={c.avatar} size="xs" />
                      </span>
                    ))}
                    {members.length > 5 && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-900">
                        +{members.length - 5}
                      </span>
                    )}
                  </div>
                )}

                <Link
                  to={`/contacts?group=${encodeURIComponent(g.name)}`}
                  className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-ocean transition hover:border-ocean hover:bg-ocean/5 dark:border-slate-700 dark:text-ocean-light"
                >
                  View contacts
                  <HiOutlineChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            )
          })}

          {/* Ungrouped card */}
          {byGroup.ungrouped.length > 0 && (
            <article className="card border-dashed p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <HiOutlineUserGroup className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">Ungrouped</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{byGroup.ungrouped.length} contact{byGroup.ungrouped.length === 1 ? '' : 's'} without a group</p>
              <Link to="/contacts" className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-ocean hover:text-ocean dark:border-slate-700">
                Assign groups
                <HiOutlineChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          )}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete group?"
        message={deleteTarget ? `Delete the group "${deleteTarget.name}"? Contacts inside will be kept — they'll just lose this group.` : ''}
        confirmLabel="Delete group"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
