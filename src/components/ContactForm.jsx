import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUser, HiOutlinePlus } from 'react-icons/hi2'
import TagInput from './TagInput.jsx'
import DuplicateModal from './DuplicateModal.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { validateContactForm } from '../utils/validation'
import { allTags } from '../utils/contactUtils'

const EMPTY = {
  name: '', email: '', phone: '', company: '', jobTitle: '',
  website: '', notes: '', tags: [], group: '', favorite: false,
}

export default function ContactForm({ initial = EMPTY, isEdit = false, contactId = null, onSaved }) {
  const { groups, contacts, addContact, updateContact, findDuplicate, mergeContacts, addGroup } = useContacts()
  const toast = useToast()
  const NEW_GROUP = '__new_group__'
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial, tags: initial.tags || [] }))
  const [newGroupName, setNewGroupName] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [dupModal, setDupModal] = useState({ open: false, existing: null })

  const tagSuggestions = useMemo(() => allTags(contacts), [contacts])

  const set = (field) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const fieldCls = (name) => `input ${errors[name] ? 'input-error' : ''}`
  const FieldError = ({ name }) =>
    errors[name] ? <p role="alert" className="mt-1 text-xs font-medium text-red-500">{errors[name]}</p> : null

  const finish = (result) => {
    setSaving(false)
    if (!result) return
    if (result.status === 'created') toast.success(`${result.contact.name} added to your contacts`)
    else if (result.status === 'replaced') toast.success('Existing contact replaced')
    else if (result.status === 'updated') toast.success('Contact updated')
    setDupModal({ open: false, existing: null })
    onSaved?.(result)
  }

  const submit = (e) => {
    e?.preventDefault()

    // Resolve the group — create a new one inline if requested.
    let payload = form
    if (form.group === NEW_GROUP) {
      if (!newGroupName.trim()) {
        setErrors((er) => ({ ...er, group: 'Give the new group a name, or pick an existing one.' }))
        toast.error('Please fix the highlighted fields.')
        return
      }
      const existing = groups.find((g) => g.name.toLowerCase() === newGroupName.trim().toLowerCase())
      let groupName = existing?.name
      if (!groupName) {
        const { error, group: created } = addGroup(newGroupName)
        if (error) {
          setErrors((er) => ({ ...er, group: error }))
          toast.error(error)
          return
        }
        groupName = created.name
        toast.success(`Group "${groupName}" created`)
      }
      payload = { ...form, group: groupName }
      setForm(payload)
    }

    const errs = validateContactForm(payload)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    setSaving(true)
    setTimeout(() => {
      if (isEdit && contactId) {
        // Still protect against colliding with a *different* contact
        const dup = findDuplicate(payload, contactId)
        if (dup) {
          setSaving(false)
          setDupModal({ open: true, existing: dup })
          return
        }
        updateContact(contactId, payload)
        finish({ status: 'updated', contact: { id: contactId } })
      } else {
        const result = addContact(payload)
        if (result.status === 'duplicate') {
          setSaving(false)
          setDupModal({ open: true, existing: result.existing })
          return
        }
        finish(result)
      }
    }, 350)
  }

  const handleKeepBoth = () => {
    if (isEdit && contactId) {
      updateContact(contactId, form)
      finish({ status: 'updated', contact: { id: contactId } })
    } else {
      finish(addContact(form, { ignoreDuplicate: true }))
    }
  }

  const handleReplace = () => {
    if (isEdit && contactId) {
      // Merge: overwrite the existing duplicate with the form data and drop the one being edited.
      finish(mergeContacts(contactId, dupModal.existing.id, form))
    } else {
      finish(addContact(form, { replaceId: dupModal.existing.id }))
    }
  }

  const inputCls = 'input'
  return (
    <>
      <form onSubmit={submit} className="card p-5 sm:p-7" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="cf-name" className="label">Full name <span className="text-coral">*</span></label>
            <div className="relative">
              <HiOutlineUser className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input id="cf-name" className={`${fieldCls('name')} pl-10`} placeholder="e.g. Arun Kumar"
                value={form.name} onChange={set('name')} autoComplete="name" />
            </div>
            <FieldError name="name" />
          </div>

          <div>
            <label htmlFor="cf-email" className="label">Email</label>
            <input id="cf-email" type="email" className={fieldCls('email')} placeholder="name@example.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
            <FieldError name="email" />
          </div>

          <div>
            <label htmlFor="cf-phone" className="label">Phone</label>
            <input id="cf-phone" type="tel" className={fieldCls('phone')} placeholder="+91 98765 43210"
              value={form.phone} onChange={set('phone')} autoComplete="tel" />
            <FieldError name="phone" />
          </div>

          <div>
            <label htmlFor="cf-company" className="label">Company</label>
            <input id="cf-company" className={inputCls} placeholder="e.g. TechNova Labs"
              value={form.company} onChange={set('company')} autoComplete="organization" />
          </div>

          <div>
            <label htmlFor="cf-job" className="label">Job title</label>
            <input id="cf-job" className={inputCls} placeholder="e.g. Software Engineer"
              value={form.jobTitle} onChange={set('jobTitle')} autoComplete="organization-title" />
          </div>

          <div>
            <label htmlFor="cf-website" className="label">Website</label>
            <input id="cf-website" className={fieldCls('website')} placeholder="example.com"
              value={form.website} onChange={set('website')} inputMode="url" />
            <FieldError name="website" />
          </div>

          <div>
            <label htmlFor="cf-group" className="label">Group</label>
            <select
              id="cf-group"
              className={`input ${errors.group ? 'input-error' : ''}`}
              value={form.group}
              onChange={(e) => {
                set('group')(e)
                if (e.target.value !== NEW_GROUP) {
                  setNewGroupName('')
                  setErrors((er) => ({ ...er, group: undefined }))
                }
              }}
            >
              <option value="">No group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
              <option value={NEW_GROUP}>＋ Create new group…</option>
            </select>
            {form.group === NEW_GROUP && (
              <input
                className={`input mt-2 ${errors.group ? 'input-error' : ''}`}
                placeholder="New group name — e.g. Investors"
                value={newGroupName}
                maxLength={40}
                autoFocus
                onChange={(e) => {
                  setNewGroupName(e.target.value)
                  setErrors((er) => ({ ...er, group: undefined }))
                }}
                aria-label="New group name"
              />
            )}
            {errors.group && <p role="alert" className="mt-1 text-xs font-medium text-red-500">{errors.group}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="label" id="cf-tags-label">Tags</label>
            <TagInput tags={form.tags} onChange={set('tags')} suggestions={tagSuggestions} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cf-notes" className="label">Private notes</label>
            <textarea id="cf-notes" rows={4} className={`${inputCls} resize-y`} placeholder="Met at the technology conference…"
              value={form.notes} onChange={set('notes')} />
            <p className="mt-1 text-xs text-slate-400">Only visible to you — stored locally in this browser.</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <input type="checkbox" checked={form.favorite} onChange={set('favorite')}
              className="h-5 w-5 rounded border-slate-300 text-gold accent-gold focus:ring-gold" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as favorite</span>
          </label>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
          <Link to={isEdit && contactId ? `/contacts/${contactId}` : '/contacts'} className="btn-ghost justify-center">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            ) : (
              <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
            )}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add contact'}
          </button>
        </div>
      </form>

      <DuplicateModal
        open={dupModal.open}
        existing={dupModal.existing}
        onCancel={() => setDupModal({ open: false, existing: null })}
        onKeepBoth={handleKeepBoth}
        onReplace={handleReplace}
      />
    </>
  )
}
