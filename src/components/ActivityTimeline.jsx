import { Link } from 'react-router-dom'
import {
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineStar,
  HiOutlineArchiveBox, HiOutlineArrowPath, HiOutlineEnvelope, HiOutlineUserGroup,
  HiOutlineArrowUpTray, HiOutlineDocumentText,
} from 'react-icons/hi2'
import { timeAgo } from '../utils/contactUtils'

const ICONS = {
  contact_created: { Icon: HiOutlinePlus, cls: 'bg-teal/15 text-teal' },
  contact_updated: { Icon: HiOutlinePencilSquare, cls: 'bg-ocean/15 text-ocean' },
  contact_deleted: { Icon: HiOutlineTrash, cls: 'bg-red-500/15 text-red-500' },
  contact_favorited: { Icon: HiOutlineStar, cls: 'bg-gold/20 text-gold-dark' },
  contact_archived: { Icon: HiOutlineArchiveBox, cls: 'bg-slate-500/15 text-slate-500' },
  contact_restored: { Icon: HiOutlineArrowPath, cls: 'bg-slate-500/15 text-slate-500' },
  email_sent: { Icon: HiOutlineEnvelope, cls: 'bg-coral/15 text-coral' },
  group_created: { Icon: HiOutlineUserGroup, cls: 'bg-teal/15 text-teal' },
  group_renamed: { Icon: HiOutlineUserGroup, cls: 'bg-ocean/15 text-ocean' },
  group_deleted: { Icon: HiOutlineUserGroup, cls: 'bg-red-500/15 text-red-500' },
  contacts_imported: { Icon: HiOutlineArrowUpTray, cls: 'bg-teal/15 text-teal' },
  note_updated: { Icon: HiOutlineDocumentText, cls: 'bg-ocean/15 text-ocean' },
}
const FALLBACK = { Icon: HiOutlineDocumentText, cls: 'bg-slate-500/15 text-slate-500' }

export default function ActivityTimeline({ activities, compact = false }) {
  if (!activities?.length) {
    return <p className="py-6 text-center text-sm text-slate-400">No activity yet — it will show up here as you use the app.</p>
  }
  return (
    <ol className="relative space-y-1 border-slate-200 dark:border-slate-800">
      {activities.map((a) => {
        const meta = ICONS[a.type] || FALLBACK
        const { Icon, cls } = meta
        const inner = (
          <div className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-100/70 dark:hover:bg-slate-800/60">
            <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.message}</p>
              <p className="text-xs text-slate-400">{timeAgo(a.createdAt)}</p>
            </div>
          </div>
        )
        return (
          <li key={a.id}>
            {a.contactId && !compact ? <Link to={`/contacts/${a.contactId}`}>{inner}</Link> : inner}
          </li>
        )
      })}
    </ol>
  )
}
