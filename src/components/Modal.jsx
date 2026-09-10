import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineXMark } from 'react-icons/hi2'

/**
 * Accessible modal: Escape to close, backdrop click to close, portal-rendered,
 * locks body scroll while open.
 */
export default function Modal({ open, onClose, title, children, wide = false, hideClose = false }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`glass relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl p-5 shadow-lift animate-scale-in focus:outline-none sm:p-6`}
      >
        {(title || !hideClose) && (
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            {!hideClose && (
              <button onClick={onClose} className="icon-btn" aria-label="Close dialog">
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
