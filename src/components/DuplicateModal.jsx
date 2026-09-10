import Modal from './Modal.jsx'
import Avatar from './Avatar.jsx'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

/**
 * Shown when a possible duplicate is detected (same email or phone).
 * Options: keep both / replace existing / cancel.
 */
export default function DuplicateModal({ open, existing, onKeepBoth, onReplace, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title="Possible duplicate contact">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
          <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          A contact with the same email or phone already exists. You can keep both,
          replace the existing contact, or cancel.
        </p>
      </div>

      {existing && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/60">
          <Avatar name={existing.name} src={existing.avatar} size="sm" />
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold text-slate-900 dark:text-white">{existing.name}</p>
            <p className="truncate text-slate-500 dark:text-slate-400">{existing.email || existing.phone}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <button onClick={onCancel} className="btn-ghost order-last sm:order-first">Cancel</button>
        <button onClick={onKeepBoth} className="btn-outline">Keep both</button>
        <button onClick={onReplace} className="btn-primary">Replace existing</button>
      </div>
    </Modal>
  )
}
