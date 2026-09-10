import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineUsers, HiOutlineStar, HiOutlineUserGroup, HiOutlineClock,
  HiOutlineUserPlus, HiOutlineEnvelope, HiOutlineArchiveBox, HiOutlineArrowRight,
} from 'react-icons/hi2'
import StatsCard from '../components/StatsCard.jsx'
import ContactCard from '../components/ContactCard.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import EmailComposer from '../components/EmailComposer.jsx'
import { SkeletonGrid } from '../components/LoadingSkeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getSettings } from '../utils/storage'

export default function Dashboard() {
  const { user } = useAuth()
  const { contacts, groups, activities, loading, deleteContact } = useContacts()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [emailContact, setEmailContact] = useState(null)

  const stats = useMemo(() => {
    const week = 7 * 24 * 60 * 60 * 1000
    const active = contacts.filter((c) => !c.archived)
    return {
      total: active.length,
      favorites: active.filter((c) => c.favorite).length,
      groups: groups.length,
      weekly: active.filter((c) => Date.now() - new Date(c.createdAt) < week).length,
      archived: contacts.filter((c) => c.archived).length,
    }
  }, [contacts, groups])

  const recent = useMemo(
    () => [...contacts].filter((c) => !c.archived).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [contacts]
  )

  const emailTarget = emailContact || contacts.find((c) => c.email)

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteContact(deleteTarget.id)
    toast.success(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {greeting}, {user?.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Here's what's happening in your network.</p>
        </div>
        <Link to="/contacts/new" className="btn-coral">
          <HiOutlineUserPlus className="h-4 w-4" aria-hidden="true" />
          Add contact
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard icon={HiOutlineUsers} label="Total contacts" value={stats.total} accent="ocean" hint={stats.archived ? `${stats.archived} archived` : undefined} />
        <StatsCard icon={HiOutlineStar} label="Favorites" value={stats.favorites} accent="gold" />
        <StatsCard icon={HiOutlineUserGroup} label="Groups" value={stats.groups} accent="teal" />
        <StatsCard icon={HiOutlineClock} label="Added this week" value={stats.weekly} accent="coral" />
      </div>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/contacts/new', icon: HiOutlineUserPlus, label: 'Add contact', cls: 'from-coral to-gold' },
            { to: '/favorites', icon: HiOutlineStar, label: 'View favorites', cls: 'from-gold to-coral' },
            ...(emailTarget ? [{ onClick: () => setEmailContact(emailTarget), icon: HiOutlineEnvelope, label: 'Send email', cls: 'from-ocean to-teal' }] : []),
            { to: '/groups', icon: HiOutlineUserGroup, label: 'Manage groups', cls: 'from-teal to-ocean' },
          ].map(({ to, onClick, icon: Icon, label, cls }) => {
            const inner = (
              <>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cls} text-white shadow-soft transition group-hover:scale-110`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
              </>
            )
            return to ? (
              <Link key={label} to={to} className="card group flex flex-col items-start p-4 transition hover:-translate-y-0.5 hover:shadow-lift">{inner}</Link>
            ) : (
              <button key={label} onClick={onClick} className="card group flex flex-col items-start p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift">{inner}</button>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent contacts */}
        <section aria-label="Recent contacts">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent contacts</h2>
            <Link to="/contacts" className="flex items-center gap-1 text-sm font-semibold text-ocean hover:underline">
              View all <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={3} />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={HiOutlineUsers}
              title="Your contact book is empty"
              message="Start building your network by adding your first contact."
              action={<Link to="/contacts/new" className="btn-primary"><HiOutlineUserPlus className="h-4 w-4" />Add contact</Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recent.map((c) => (
                <ContactCard key={c.id} contact={c} onDelete={getSettings(user?.id).confirmDelete ? setDeleteTarget : (ct) => { deleteContact(ct.id); toast.success(`${ct.name} deleted`) }} />
              ))}
            </div>
          )}
        </section>

        {/* Activity feed */}
        <section aria-label="Recent activity" className="card self-start p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Activity</h2>
            <Link to="/activity" className="text-sm font-semibold text-ocean hover:underline">See all</Link>
          </div>
          <ActivityTimeline activities={activities.slice(0, 6)} compact />
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete contact?"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <EmailComposer open={Boolean(emailContact)} onClose={() => setEmailContact(null)} contact={emailContact} />
    </div>
  )
}
