import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { sendEmail, isEmailConfigured } from '../services/emailService'
import { getSettings } from '../utils/storage'
import { HiOutlinePaperAirplane, HiOutlineExclamationTriangle } from 'react-icons/hi2'

export default function EmailComposer({ open, onClose, contact }) {
  const { user } = useAuth()
  const { log } = useContacts()
  const toast = useToast()
  const [fromName, setFromName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('')

  const configured = isEmailConfigured()

  useEffect(() => {
    if (open) {
      setFromName(user?.name || '')
      setSubject('')
      setMessage('')
      setStatus('idle')
      setErrorMsg('')
    }
  }, [open, user?.name])

  if (!contact) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!contact.email) return toast.error('This contact has no email address.')
    if (!subject.trim() || !message.trim()) {
      setStatus('error')
      setErrorMsg('Subject and message are both required.')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      await sendEmail({
        toEmail: contact.email,
        toName: contact.name,
        subject: subject.trim(),
        message: message.trim(),
        fromName: fromName.trim(),
        replyTo: user?.email || '',
      })
      toast.success(`Email sent to ${contact.email}`)
      log('email_sent', `Sent an email to ${contact.name}`, contact.id)
      const settings = getSettings(user?.id)
      if (!settings.emailNotifications) toast.info('Tip: email notifications are disabled in Settings.')
      onClose()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Send email to ${contact.name}`} wide>
      {!configured && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-gold/50 bg-gold/10 p-3.5 text-sm text-gold-dark dark:text-gold">
          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">EmailJS is not configured.</p>
            <p className="mt-1 leading-relaxed opacity-90">
              Add <code className="rounded bg-black/10 px-1 dark:bg-white/10">VITE_EMAILJS_SERVICE_ID</code>,{' '}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">VITE_EMAILJS_TEMPLATE_ID</code> and{' '}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">VITE_EMAILJS_PUBLIC_KEY</code> to a{' '}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">.env</code> file (see .env.example), then restart the dev server.
              You can still use the one-tap <em>Email</em> button, which opens your mail app.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="ec-to" className="label">To</label>
          <input id="ec-to" className="input bg-slate-50 dark:bg-slate-800/60" value={contact.email || '(no email address)'} readOnly aria-readonly="true" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ec-from" className="label">Your name <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="ec-from" className="input" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="e.g. Alex" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="ec-subject" className="label">Subject <span className="text-coral">*</span></label>
            <input id="ec-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Quick hello" />
          </div>
        </div>
        <div>
          <label htmlFor="ec-message" className="label">Message <span className="text-coral">*</span></label>
          <textarea id="ec-message" rows={6} className="input resize-y" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Hi ${contact.name.split(' ')[0]}, …`} />
        </div>

        {status === 'error' && errorMsg && (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary min-w-[120px]" disabled={status === 'sending' || !configured || !contact.email}>
            {status === 'sending' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            ) : (
              <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />
            )}
            {status === 'sending' ? 'Sending…' : 'Send email'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
