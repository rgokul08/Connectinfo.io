import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineStar,
  HiStar,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineClipboardDocument,
} from 'react-icons/hi2'
import Avatar from './Avatar.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { tagStyle, copyText } from '../utils/contactUtils'
import { gmailComposeUrl, GMAIL_LINK_PROPS } from '../utils/gmail'
import { useTilt } from '../utils/hooks'

export default function ContactCard({ contact, onDelete, style }) {
  const { toggleFavorite } = useContacts()
  const toast = useToast()
  const navigate = useNavigate()
  const tiltRef = useTilt(5)

  const fav = (e) => {
    e.stopPropagation()
    const now = toggleFavorite(contact.id)
    toast.success(now ? `${contact.name} added to favorites` : `${contact.name} removed from favorites`)
  }

  const copy = async (e, text, what) => {
    e.preventDefault()
    e.stopPropagation()
    if (await copyText(text)) toast.success(`${what} copied`)
    else toast.error(`Could not copy ${what.toLowerCase()}`)
  }

  const stop = (e) => e.stopPropagation()

  return (
    <article
      ref={tiltRef}
      style={style}
      onClick={() => navigate(`/contacts/${contact.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/contacts/${contact.id}`) }}
      tabIndex={0}
      aria-label={`View contact ${contact.name}`}
      className="tilt-card card group relative cursor-pointer p-5 hover:shadow-lift animate-fade-up"
    >
      {contact.isDemo && (
        <span className="absolute right-3 top-3 chip bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          demo
        </span>
      )}
      <div className="flex items-start gap-3.5">
        <Avatar name={contact.name} src={contact.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-base font-bold text-slate-900 dark:text-white">{contact.name}</h3>
            <button
              onClick={fav}
              className={`shrink-0 transition hover:scale-110 ${contact.favorite ? 'text-gold' : 'text-slate-300 hover:text-gold dark:text-slate-600'}`}
              aria-label={contact.favorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={contact.favorite}
            >
              {contact.favorite ? <HiStar className="h-5 w-5" /> : <HiOutlineStar className="h-5 w-5" />}
            </button>
          </div>
          {(contact.jobTitle || contact.company) && (
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {[contact.jobTitle, contact.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        {contact.email && (
          <div className="flex items-center justify-between gap-2">
            <a
              href={gmailComposeUrl(contact.email)}
              {...GMAIL_LINK_PROPS}
              onClick={stop}
              title="Email via Gmail"
              className="flex min-w-0 items-center gap-2 text-slate-600 transition hover:text-ocean dark:text-slate-300 dark:hover:text-ocean-light"
            >
              <HiOutlineEnvelope className="h-4 w-4 shrink-0 text-ocean" aria-hidden="true" />
              <span className="truncate">{contact.email}</span>
            </a>
            <button onClick={(e) => copy(e, contact.email, 'Email')} className="icon-btn h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Copy email of ${contact.name}`} title="Copy email">
              <HiOutlineClipboardDocument className="h-4 w-4" />
            </button>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center justify-between gap-2">
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              onClick={stop}
              className="flex min-w-0 items-center gap-2 text-slate-600 transition hover:text-teal-dark dark:text-slate-300 dark:hover:text-teal-light"
            >
              <HiOutlinePhone className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              <span className="truncate">{contact.phone}</span>
            </a>
            <button onClick={(e) => copy(e, contact.phone, 'Phone')} className="icon-btn h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Copy phone of ${contact.name}`} title="Copy phone">
              <HiOutlineClipboardDocument className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {contact.tags?.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {contact.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`chip ${tagStyle(tag)}`}>{tag}</span>
          ))}
          {contact.tags.length > 3 && (
            <span className="chip bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div
        className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3.5 transition dark:border-slate-800 sm:opacity-60 sm:group-hover:opacity-100"
        onClick={stop}
      >
        {contact.email && (
          <a href={gmailComposeUrl(contact.email)} {...GMAIL_LINK_PROPS} className="icon-btn" aria-label={`Email ${contact.name} via Gmail`} title="Email via Gmail">
            <HiOutlineEnvelope className="h-5 w-5" />
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="icon-btn" aria-label={`Call ${contact.name}`} title="Call">
            <HiOutlinePhone className="h-5 w-5" />
          </a>
        )}
        <Link to={`/contacts/${contact.id}/edit`} className="icon-btn" aria-label={`Edit ${contact.name}`} title="Edit">
          <HiOutlinePencilSquare className="h-5 w-5" />
        </Link>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(contact) }}
          className="icon-btn ml-auto hover:bg-red-500/10 hover:text-red-500"
          aria-label={`Delete ${contact.name}`}
          title="Delete"
        >
          <HiOutlineTrash className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}
