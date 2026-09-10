import { useMemo, useRef, useState } from 'react'
import { HiOutlineCamera, HiOutlineTrash, HiOutlineUsers, HiOutlineStar, HiOutlineCalendarDays } from 'react-icons/hi2'
import Avatar from '../components/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatDate } from '../utils/contactUtils'
import { isValidPhone } from '../utils/validation'

/** Resize an uploaded image to a small square data URL so LocalStorage stays light. */
function fileToAvatarDataUrl(file, size = 192) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { contacts } = useContacts()
  const toast = useToast()
  const fileRef = useRef(null)

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const stats = useMemo(
    () => ({
      total: contacts.filter((c) => !c.archived).length,
      favorites: contacts.filter((c) => c.favorite && !c.archived).length,
    }),
    [contacts]
  )

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.')
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      updateProfile({ avatar: dataUrl })
      toast.success('Profile photo updated')
    } catch {
      toast.error('Could not process that image.')
    } finally {
      e.target.value = ''
    }
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required.')
    if (form.phone.trim() && !isValidPhone(form.phone)) return setError('Enter a valid phone number.')
    setError('')
    setSaving(true)
    setTimeout(() => {
      updateProfile({ name: form.name.trim(), phone: form.phone.trim() })
      setSaving(false)
      toast.success('Profile updated')
    }, 300)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Profile</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">How you appear inside Connectinfo.</p>
      </div>

      {/* Identity card */}
      <section className="card overflow-hidden" aria-label="Profile overview">
        <div className="h-20 bg-gradient-to-r from-ocean via-teal to-coral" aria-hidden="true" />
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <div className="relative rounded-full ring-4 ring-white dark:ring-slate-900">
              <Avatar name={user?.name} src={user?.avatar} size="xl" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-white shadow-lift transition hover:bg-ocean-dark"
                aria-label="Change profile photo"
                title="Change photo"
              >
                <HiOutlineCamera className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            {user?.avatar && (
              <button
                onClick={() => { updateProfile({ avatar: '' }); toast.success('Photo removed') }}
                className="icon-btn text-red-500 hover:bg-red-500/10"
                aria-label="Remove profile photo"
                title="Remove photo"
              >
                <HiOutlineTrash className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-100/80 p-3.5 text-center dark:bg-slate-800/60">
              <HiOutlineUsers className="mx-auto h-5 w-5 text-ocean" aria-hidden="true" />
              <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-slate-500">Contacts</p>
            </div>
            <div className="rounded-xl bg-slate-100/80 p-3.5 text-center dark:bg-slate-800/60">
              <HiOutlineStar className="mx-auto h-5 w-5 text-gold-dark" aria-hidden="true" />
              <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">{stats.favorites}</p>
              <p className="text-xs text-slate-500">Favorites</p>
            </div>
            <div className="rounded-xl bg-slate-100/80 p-3.5 text-center dark:bg-slate-800/60">
              <HiOutlineCalendarDays className="mx-auto h-5 w-5 text-teal" aria-hidden="true" />
              <p className="mt-1 font-display text-sm font-bold leading-6 text-slate-900 dark:text-white">{formatDate(user?.createdAt)}</p>
              <p className="text-xs text-slate-500">Joined</p>
            </div>
          </div>
        </div>
      </section>

      {/* Edit form */}
      <form onSubmit={save} className="card space-y-5 p-5 sm:p-7" aria-label="Edit profile">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Edit profile</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-name" className="label">Full name</label>
            <input id="pf-name" className={`input ${error.includes('Name') ? 'input-error' : ''}`} value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError('') }} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="pf-phone" className="label">Phone</label>
            <input id="pf-phone" type="tel" className={`input ${error.includes('phone') ? 'input-error' : ''}`} value={form.phone}
              onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError('') }} autoComplete="tel"
              placeholder="+91 98765 43210" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-email" className="label">Email</label>
            <input id="pf-email" className="input bg-slate-50 dark:bg-slate-800/60" value={user?.email} readOnly aria-readonly="true" />
            <p className="mt-1 text-xs text-slate-400">Email is your login and can't be changed in this demo.</p>
          </div>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
