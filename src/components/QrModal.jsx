import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Modal from './Modal.jsx'
import Avatar from './Avatar.jsx'
import { contactToVCard } from '../utils/contactUtils'
import { HiOutlineArrowDownTray } from 'react-icons/hi2'

/** Generates a QR code (vCard) for the contact — works fully offline. */
export default function QrModal({ open, onClose, contact }) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let alive = true
    if (open && contact) {
      QRCode.toDataURL(contactToVCard(contact), {
        width: 512,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => alive && setDataUrl(url))
        .catch(() => alive && setDataUrl(''))
    }
    return () => { alive = false }
  }, [open, contact])

  if (!contact) return null

  return (
    <Modal open={open} onClose={onClose} title="Share via QR code">
      <div className="flex flex-col items-center text-center">
        <Avatar name={contact.name} src={contact.avatar} size="md" />
        <p className="mt-2 font-display font-bold text-slate-900 dark:text-white">{contact.name}</p>
        {(contact.jobTitle || contact.company) && (
          <p className="text-sm text-slate-500">{[contact.jobTitle, contact.company].filter(Boolean).join(' · ')}</p>
        )}

        <div className="mt-5 rounded-2xl bg-white p-4 shadow-soft">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR code containing ${contact.name}'s contact details`} className="h-48 w-48" />
          ) : (
            <div className="skeleton h-48 w-48" />
          )}
        </div>
        <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-400">
          Scanning saves <em>{contact.name.split(' ')[0]}'s</em> name, email, phone and company (vCard). Private notes and tags are never included.
        </p>

        {dataUrl && (
          <a href={dataUrl} download={`${contact.name.replace(/\s+/g, '-').toLowerCase()}-contact-qr.png`} className="btn-outline mt-4">
            <HiOutlineArrowDownTray className="h-4 w-4" aria-hidden="true" />
            Download QR
          </a>
        )}
      </div>
    </Modal>
  )
}
