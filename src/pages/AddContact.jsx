import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import ContactForm from '../components/ContactForm.jsx'

export default function AddContact() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <Link to="/contacts" className="btn-ghost btn-sm -ml-2 text-slate-500">
        <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
        Contacts
      </Link>
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Add contact</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Name plus at least one way to reach them — email or phone.</p>
      </div>
      <ContactForm onSaved={(result) => navigate(result.contact ? `/contacts/${result.contact.id}` : '/contacts')} />
      <p className="text-xs text-slate-400">Shortcut: press <kbd className="rounded border border-slate-300 px-1 dark:border-slate-600">N</kbd> anywhere to open this page.</p>
    </div>
  )
}
