import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineStar, HiOutlineEnvelope, HiOutlinePhone, HiOutlineUserPlus } from 'react-icons/hi2'
import ContactCard from '../components/ContactCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { SkeletonGrid } from '../components/LoadingSkeleton.jsx'
import Avatar from '../components/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { gmailComposeUrl, GMAIL_LINK_PROPS } from '../utils/gmail'
import { getSettings } from '../utils/storage'

export default function Favorites() {
  const { user } = useAuth()
  const { contacts, loading, deleteContact } = useContacts()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const favorites = useMemo(
    () => contacts.filter((c) => c.favorite && !c.archived).sort((a, b) => a.name.localeCompare(b.name)),
    [contacts]
  )

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteContact(deleteTarget.id)
    toast.success(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Favorites</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">The people you reach most — one tap to email or call.</p>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={HiOutlineStar}
          title="No favorite contacts yet"
          message="Mark important people as favorites for quick access — tap the star on any contact."
          tint="gold"
          action={<Link to="/contacts" className="btn-primary">Browse contacts</Link>}
        />
      ) : (
        <>
          {/* Quick dial strip */}
          <section aria-label="Quick contact strip" className="card flex gap-4 overflow-x-auto p-4 nice-scroll">
            {favorites.map((c) => (
              <div key={c.id} className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center">
                <Link to={`/contacts/${c.id}`} className="transition hover:scale-105">
                  <Avatar name={c.name} src={c.avatar} size="lg" />
                </Link>
                <p className="w-full truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{c.name.split(' ')[0]}</p>
                <div className="flex gap-1">
                  {c.email && (
                    <a href={gmailComposeUrl(c.email)} {...GMAIL_LINK_PROPS} className="icon-btn h-8 w-8 text-ocean" aria-label={`Email ${c.name} via Gmail`} title="Email via Gmail">
                      <HiOutlineEnvelope className="h-4 w-4" />
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="icon-btn h-8 w-8 text-teal" aria-label={`Call ${c.name}`} title="Call">
                      <HiOutlinePhone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onDelete={getSettings(user?.id).confirmDelete ? setDeleteTarget : (ct) => { deleteContact(ct.id); toast.success(`${ct.name} deleted`) }}
              />
            ))}
          </div>
        </>
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
