import { createContext, useContext, useCallback, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { uid } from '../utils/storage'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

const VARIANTS = {
  success: { icon: HiOutlineCheckCircle, bar: 'bg-teal', text: 'text-teal' },
  error: { icon: HiOutlineExclamationTriangle, bar: 'bg-red-500', text: 'text-red-500' },
  info: { icon: HiOutlineInformationCircle, bar: 'bg-ocean', text: 'text-ocean' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (message, variant = 'success', duration = 3500) => {
      const id = uid('toast')
      setToasts((t) => [...t.slice(-3), { id, message, variant }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  const api = useMemo(
    () => ({
      success: (m, d) => push(m, 'success', d),
      error: (m, d) => push(m, 'error', d ?? 4500),
      info: (m, d) => push(m, 'info', d),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-20 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6"
        >
          {toasts.map((toast) => {
            const V = VARIANTS[toast.variant] || VARIANTS.info
            const Icon = V.icon
            return (
              <div
                key={toast.id}
                role="status"
                className="glass pointer-events-auto flex items-start gap-3 overflow-hidden rounded-xl px-4 py-3 shadow-lift animate-slide-in-right"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${V.bar}`} aria-hidden="true" />
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${V.text}`} aria-hidden="true" />
                <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{toast.message}</p>
                <button onClick={() => dismiss(toast.id)} className="icon-btn -mr-1 -mt-1 h-7 w-7" aria-label="Dismiss notification">
                  <HiOutlineXMark className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
