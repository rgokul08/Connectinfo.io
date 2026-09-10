import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineBell, HiOutlineUsers, HiOutlineCircleStack, HiOutlineUserCircle,
  HiOutlineArrowDownTray, HiOutlineArrowUpTray, HiOutlineTrash,
  HiOutlineArrowRightOnRectangle, HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import ConfirmModal from '../components/ConfirmModal.jsx'
import ImportModal from '../components/ImportModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getSettings, saveSettings } from '../utils/storage'
import { exportContactsJSON, exportContactsCSV } from '../utils/exportUtils'
import { SORT_OPTIONS } from '../utils/contactUtils'

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="card p-5 sm:p-6" aria-label={title}>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean dark:text-ocean-light">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Toggle({ label, hint, checked, onChange, id }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" aria-checked={checked} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-7 w-12 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-teal peer-checked:after:translate-x-5 dark:bg-slate-700"
      />
    </label>
  )
}

export default function Settings() {
  const { user, logout, deleteAccount } = useAuth()
  const { contacts, clearAllContacts, clearDemoContacts } = useContacts()
  const toast = useToast()
  const navigate = useNavigate()

  const [settings, setSettings] = useState(() => getSettings(user?.id))
  const [importOpen, setImportOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const demoCount = useMemo(() => contacts.filter((c) => c.isDemo).length, [contacts])

  const update = (patch) => {
    const next = saveSettings(user?.id, patch)
    setSettings(next)
  }

  const activeCount = contacts.filter((c) => !c.archived).length

  const doExport = (kind) => {
    if (activeCount === 0) return toast.error('No contacts to export yet.')
    kind === 'json' ? exportContactsJSON(contacts.filter((c) => !c.archived)) : exportContactsCSV(contacts.filter((c) => !c.archived))
    toast.success(`Contacts exported as ${kind.toUpperCase()}`)
  }

  const doClear = () => {
    clearAllContacts()
    toast.success('All contacts removed')
    setClearOpen(false)
  }

  const doDeleteAccount = () => {
    deleteAccount()
    toast.success('Your local account and data were deleted')
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Settings</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tune Connectinfo to the way you work.</p>
      </div>

      {/* Notifications */}
      <Section icon={HiOutlineBell} title="Notifications" description="In-app notification preferences (stored locally).">
        <Toggle
          id="st-email-notif"
          label="Email notifications"
          hint="Show confirmations when emails are sent"
          checked={settings.emailNotifications}
          onChange={(v) => { update({ emailNotifications: v }); toast.success('Preference saved') }}
        />
        <Toggle
          id="st-activity-notif"
          label="Activity notifications"
          hint="Celebrate new activity on your timeline"
          checked={settings.activityNotifications}
          onChange={(v) => { update({ activityNotifications: v }); toast.success('Preference saved') }}
        />
      </Section>

      {/* Contact preferences */}
      <Section icon={HiOutlineUsers} title="Contact preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="st-view" className="label">Default contact view</label>
            <select id="st-view" className="input" value={settings.defaultView} onChange={(e) => { update({ defaultView: e.target.value }); toast.success('Preference saved') }}>
              <option value="grid">Grid cards</option>
              <option value="list">Compact list</option>
            </select>
          </div>
          <div>
            <label htmlFor="st-sort" className="label">Default sorting</label>
            <select id="st-sort" className="input" value={settings.defaultSort} onChange={(e) => { update({ defaultSort: e.target.value }); toast.success('Preference saved') }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-2">
          <Toggle
            id="st-confirm"
            label="Confirm before deleting"
            hint="Ask for confirmation before a contact is deleted"
            checked={settings.confirmDelete}
            onChange={(v) => { update({ confirmDelete: v }); toast.success('Preference saved') }}
          />
        </div>
      </Section>

      {/* Data */}
      <Section icon={HiOutlineCircleStack} title="Your data" description="Your contacts are stored locally in this browser — export a backup any time.">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => doExport('json')} className="btn-outline btn-sm !px-3.5 !py-2">
            <HiOutlineArrowDownTray className="h-4 w-4" aria-hidden="true" /> Export JSON
          </button>
          <button onClick={() => doExport('csv')} className="btn-outline btn-sm !px-3.5 !py-2">
            <HiOutlineArrowDownTray className="h-4 w-4" aria-hidden="true" /> Export CSV
          </button>
          <button onClick={() => setImportOpen(true)} className="btn-outline btn-sm !px-3.5 !py-2">
            <HiOutlineArrowUpTray className="h-4 w-4" aria-hidden="true" /> Import JSON / CSV
          </button>
        </div>

        {demoCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">{demoCount} demo contacts</span> were added to help you explore.
            </p>
            <button onClick={() => { clearDemoContacts(); toast.success('Demo contacts cleared') }} className="btn-ghost btn-sm text-gold-dark dark:text-gold">
              Clear demo data
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 px-4 py-3 dark:border-red-500/30">
          <p className="text-sm text-slate-600 dark:text-slate-300">Remove every contact from your account.</p>
          <button onClick={() => setClearOpen(true)} className="btn-ghost btn-sm text-red-500 hover:bg-red-500/10">
            <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Clear contacts
          </button>
        </div>
      </Section>

      {/* Account */}
      <Section icon={HiOutlineUserCircle} title="Account" description="Demo authentication — your account lives in LocalStorage.">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">Signed in as {user?.email}</p>
              <p className="text-xs text-slate-400">Local demo account · no data leaves this browser</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} className="btn-outline btn-sm !px-3.5 !py-2">
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="flex items-center gap-2 text-sm text-red-500">
              <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />
              Delete this local account and all its data
            </p>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger btn-sm !px-3.5 !py-2">Delete account</button>
          </div>
        </div>
      </Section>

      {/* Modals */}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmModal
        open={clearOpen}
        title="Clear all contacts?"
        message={`This permanently removes all ${contacts.length} contacts from your account. Export a backup first if you're unsure.`}
        confirmLabel="Clear all"
        onConfirm={doClear}
        onCancel={() => setClearOpen(false)}
      />
      <ConfirmModal
        open={deleteOpen}
        title="Delete account?"
        message="This deletes your account, contacts, groups and activity history from this browser. This action cannot be undone."
        confirmLabel="Delete my account"
        onConfirm={doDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
