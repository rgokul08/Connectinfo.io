import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  HiOutlineEnvelope, HiOutlinePhone, HiOutlineGlobeAlt, HiOutlineStar, HiStar,
  HiOutlinePencilSquare, HiOutlineTrash, HiOutlineShare, HiOutlineQrCode,
  HiOutlineClipboardDocument, HiOutlinePaperAirplane, HiOutlineArchiveBox,
  HiOutlineArchiveBoxArrowDown, HiOutlineBuildingOffice2, HiOutlineBriefcase,
  HiOutlineCalendarDays, HiOutlineArrowLeft, HiOutlineUserPlus,
} from 'react-icons/hi2'
import Avatar from '../components/Avatar.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import EmailComposer from '../components/EmailComposer.jsx'
import QrModal from '../components/QrModal.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { tagStyle, formatDate, copyText, contactToText } from '../utils/contactUtils'
import { gmailComposeUrl, GMAIL_LINK_PROPS } from '../utils/gmail'
import { getSettings } from '../utils/storage'

function InfoRow({ icon: Icon, label, children, tint = 'text-ocean bg-ocean/10' }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{children}</div>
      </div>
    </div>
  )
}

export default function ContactDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getContact, toggleFavorite, toggleArchive, deleteContact, updateContact, log, activities } = useContacts()
  const toast = useToast()

  const contact = getContact(id)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [notes, setNotes] = useState(contact?.notes ?? '')
  const [notesDirty, setNotesDirty] = useState(false)

  const timeline = useMemo(
    () => activities.filter((a) => a.contactId === id).slice(0, 8),
    [activities, id]
  )

  if (!contact) {
    return (
      <EmptyState
        icon={HiOutlineUserPlus}
        title="Contact not found"
        message="This contact may have been deleted, or the link is incorrect."
        tint="coral"
        action={<Link to="/contacts" className="btn-primary"><HiOutlineArrowLeft className="h-4 w-4" />Back to contacts</Link>}
      />
    )
  }

  const cleanPhone = contact.phone.replace(/\s/g, '')

  const onFavorite = () => {
    const now = toggleFavorite(contact.id)
    toast.success(now ? 'Added to favorites' : 'Removed from favorites')
  }

  const onArchive = () => {
    const now = toggleArchive(contact.id)
    toast.success(now ? `${contact.name} archived` : `${contact.name} restored`)
  }

  const onDelete = () => {
    deleteContact(contact.id)
    toast.success(`${contact.name} deleted`)
    navigate('/contacts')
  }

  const onShare = async () => {
    const text = contactToText(contact)
    if (navigator.share) {
      try {
        await navigator.share({ title: `Contact: ${contact.name}`, text })
        log('contact_updated', `Shared ${contact.name}`, contact.id)
      } catch { /* user cancelled — nothing to do */ }
    } else {
      const ok = await copyText(text)
      ok ? toast.success('Contact details copied') : toast.error('Sharing is not supported in this browser.')
    }
  }

  const saveNotes = () => {
    updateContact(contact.id, { notes })
    setNotesDirty(false)
    toast.success('Notes saved')
  }

  const copy = async (text, what) => {
    if (await copyText(text)) toast.success(`${what} copied`)
    else toast.error(`Could not copy ${what.toLowerCase()}`)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <Link to="/contacts" className="btn-ghost btn-sm -ml-2 text-slate-500">
        <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
        Contacts
      </Link>

      {/* ---------- Header card ---------- */}
      <header className="card relative overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-ocean via-teal to-coral opacity-90 sm:h-28" aria-hidden="true" />
        <div className="relative px-5 pb-5 sm:px-7">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <div className="rounded-full ring-4 ring-white dark:ring-slate-900">
              <Avatar name={contact.name} src={contact.avatar} size="xl" />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {contact.name}
                </h1>
                {contact.archived && <span className="chip bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Archived</span>}
                {contact.isDemo && <span className="chip bg-gold/20 text-gold-dark dark:text-gold">Demo contact</span>}
              </div>
              {(contact.jobTitle || contact.company) && (
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  {[contact.jobTitle, contact.company].filter(Boolean).join(' at ')}
                </p>
              )}
            </div>
            <button
              onClick={onFavorite}
              aria-pressed={contact.favorite}
              aria-label={contact.favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`icon-btn h-11 w-11 ${contact.favorite ? 'text-gold' : 'text-slate-400'}`}
            >
              {contact.favorite ? <HiStar className="h-7 w-7" /> : <HiOutlineStar className="h-7 w-7" />}
            </button>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            {contact.email && (
              <a href={gmailComposeUrl(contact.email)} {...GMAIL_LINK_PROPS} className="btn-primary btn-sm !px-3.5 !py-2" title="Compose in Gmail">
                <HiOutlineEnvelope className="h-4 w-4" aria-hidden="true" /> Email
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${cleanPhone}`} className="btn-teal btn-sm !px-3.5 !py-2">
                <HiOutlinePhone className="h-4 w-4" aria-hidden="true" /> Call
              </a>
            )}
            {contact.email && (
              <button onClick={() => setComposerOpen(true)} className="btn-coral btn-sm !px-3.5 !py-2">
                <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" /> Send message
              </button>
            )}
            <Link to={`/contacts/${contact.id}/edit`} className="btn-outline btn-sm !px-3.5 !py-2">
              <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit
            </Link>
            <button onClick={onShare} className="btn-ghost btn-sm !px-3.5 !py-2">
              <HiOutlineShare className="h-4 w-4" aria-hidden="true" /> Share
            </button>
            <button onClick={() => setQrOpen(true)} className="btn-ghost btn-sm !px-3.5 !py-2">
              <HiOutlineQrCode className="h-4 w-4" aria-hidden="true" /> QR
            </button>
            <button onClick={onArchive} className="btn-ghost btn-sm !px-3.5 !py-2">
              {contact.archived ? <HiOutlineArchiveBoxArrowDown className="h-4 w-4" /> : <HiOutlineArchiveBox className="h-4 w-4" />}
              {contact.archived ? 'Restore' : 'Archive'}
            </button>
            <button onClick={() => setConfirmOpen(true)} className="btn-ghost btn-sm ml-auto !px-3.5 !py-2 text-red-500 hover:bg-red-500/10">
              <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Delete
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* ---------- Contact information ---------- */}
          <section aria-label="Contact information" className="card p-5 sm:p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-slate-900 dark:text-white">Contact information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {contact.email && (
                <InfoRow icon={HiOutlineEnvelope} label="Email">
                  <span className="flex items-center gap-1">
                    <a href={gmailComposeUrl(contact.email)} {...GMAIL_LINK_PROPS} title="Compose in Gmail" className="truncate text-ocean hover:underline dark:text-ocean-light">{contact.email}</a>
                    <button onClick={() => copy(contact.email, 'Email')} className="icon-btn h-7 w-7" aria-label="Copy email" title="Copy email">
                      <HiOutlineClipboardDocument className="h-4 w-4" />
                    </button>
                  </span>
                </InfoRow>
              )}
              {contact.phone && (
                <InfoRow icon={HiOutlinePhone} label="Phone" tint="text-teal bg-teal/10">
                  <span className="flex items-center gap-1">
                    <a href={`tel:${cleanPhone}`} className="truncate text-teal-dark hover:underline dark:text-teal-light">{contact.phone}</a>
                    <button onClick={() => copy(contact.phone, 'Phone')} className="icon-btn h-7 w-7" aria-label="Copy phone" title="Copy phone">
                      <HiOutlineClipboardDocument className="h-4 w-4" />
                    </button>
                  </span>
                </InfoRow>
              )}
              {contact.company && (
                <InfoRow icon={HiOutlineBuildingOffice2} label="Company" tint="text-coral bg-coral/10">
                  <span className="truncate">{contact.company}</span>
                </InfoRow>
              )}
              {contact.jobTitle && (
                <InfoRow icon={HiOutlineBriefcase} label="Job title" tint="text-gold-dark bg-gold/20">
                  <span className="truncate">{contact.jobTitle}</span>
                </InfoRow>
              )}
              {contact.website && (
                <InfoRow icon={HiOutlineGlobeAlt} label="Website">
                  <a
                    href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                    target="_blank" rel="noreferrer noopener"
                    className="truncate text-ocean hover:underline dark:text-ocean-light"
                  >
                    {contact.website.replace(/^https?:\/\//, '')}
                  </a>
                </InfoRow>
              )}
              <InfoRow icon={HiOutlineCalendarDays} label="Added" tint="text-slate-500 bg-slate-500/10">
                <span>{formatDate(contact.createdAt)}</span>
              </InfoRow>
            </div>

            {(contact.tags?.length > 0 || contact.group) && (
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                {contact.group && <span className="chip bg-ocean text-white">{contact.group}</span>}
                {contact.tags?.map((t) => <span key={t} className={`chip ${tagStyle(t)}`}>{t}</span>)}
              </div>
            )}
          </section>

          {/* ---------- Private notes ---------- */}
          <section aria-label="Private notes" className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Private notes</h2>
            <textarea
              className="input mt-4 resize-y"
              rows={5}
              placeholder="Met at the technology conference. Interested in collaborating…"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesDirty(true) }}
              aria-label="Private notes for this contact"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Only you can see these notes — stored locally.</p>
              {notesDirty && (
                <button onClick={saveNotes} className="btn-primary btn-sm">Save notes</button>
              )}
            </div>
          </section>
        </div>

        {/* ---------- Timeline ---------- */}
        <section aria-label="Contact timeline" className="card self-start p-5 sm:p-6">
          <h2 className="mb-3 font-display text-lg font-bold text-slate-900 dark:text-white">Timeline</h2>
          <p className="mb-3 text-xs text-slate-400">Last updated {formatDate(contact.updatedAt)}</p>
          <ActivityTimeline activities={timeline} compact />
        </section>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete contact?"
        message={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmOpen(false); onDelete() }}
        onCancel={() => setConfirmOpen(false)}
      />
      <EmailComposer open={composerOpen} onClose={() => setComposerOpen(false)} contact={contact} />
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} contact={contact} />
    </div>
  )
}
