import { HiOutlineInbox } from 'react-icons/hi2'

export default function EmptyState({ icon: Icon = HiOutlineInbox, title, message, action, tint = 'ocean' }) {
  const tints = {
    ocean: 'from-ocean/15 to-teal/10 text-ocean',
    coral: 'from-coral/15 to-gold/15 text-coral',
    gold: 'from-gold/25 to-coral/10 text-gold-dark',
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
      <span className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tints[tint]}`}>
        <Icon className="h-8 w-8" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
