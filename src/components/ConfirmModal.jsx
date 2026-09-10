import Modal from './Modal.jsx'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-red-500/10 text-red-500' : 'bg-gold/20 text-gold-dark'
          }`}
        >
          <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="btn-ghost">{cancelLabel}</button>
        <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
