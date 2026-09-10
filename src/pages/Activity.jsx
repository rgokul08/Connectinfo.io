import { useMemo, useState } from 'react'
import { HiOutlineClock, HiOutlineTrash } from 'react-icons/hi2'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const FILTERS = [
  { value: 'all', label: 'All activity' },
  { value: 'contact', label: 'Contacts' },
  { value: 'email', label: 'Emails' },
  { value: 'group', label: 'Groups' },
]

const match = (type, filter) => {
  if (filter === 'all') return true
  if (filter === 'contact') return type.startsWith('contact_') || type === 'note_updated' || type === 'contacts_imported'
  if (filter === 'email') return type === 'email_sent'
  if (filter === 'group') return type.startsWith('group_')
  return true
}

export default function Activity() {
  const { activities, clearActivities } = useContacts()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [clearOpen, setClearOpen] = useState(false)

  const filtered = useMemo(() => activities.filter((a) => match(a.type, filter)), [activities, filter])

  const doClear = () => {
    clearActivities()
    toast.success('Activity history cleared')
    setClearOpen(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Recent activity</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">A living timeline of everything happening in your network.</p>
        </div>
        {activities.length > 0 && (
          <button onClick={() => setClearOpen(true)} className="btn-ghost btn-sm text-red-500 hover:bg-red-500/10">
            <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
            Clear history
          </button>
        )}
      </div>

      <div className="flex gap-2" role="group" aria-label="Filter activity">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`chip border transition ${
              filter === f.value
                ? 'border-ocean bg-ocean text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-ocean hover:text-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="card p-5 sm:p-6" aria-label="Activity timeline">
        {filtered.length === 0 ? (
          <EmptyState
            icon={HiOutlineClock}
            title={activities.length === 0 ? 'No activity yet' : 'Nothing matches this filter'}
            message={activities.length === 0 ? 'As you add, edit, email and organize contacts, everything shows up here.' : 'Try a different filter.'}
            tint="ocean"
          />
        ) : (
          <ActivityTimeline activities={filtered} />
        )}
      </section>

      <ConfirmModal
        open={clearOpen}
        title="Clear activity history?"
        message="This removes the activity timeline for your account. Your contacts are not affected."
        confirmLabel="Clear history"
        onConfirm={doClear}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  )
}
