import { Link, useNavigate, useParams } from 'react-router-dom'
import { HiOutlineArrowLeft, HiOutlineUserPlus } from 'react-icons/hi2'
import ContactForm from '../components/ContactForm.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useContacts } from '../context/ContactContext'

export default function EditContact() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getContact, loading } = useContacts()
  const contact = getContact(id)

  if (!loading && !contact) {
    return (
      <EmptyState
        icon={HiOutlineUserPlus}
        title="Contact not found"
        message="This contact may have been deleted."
        tint="coral"
        action={<Link to="/contacts" className="btn-primary">Back to contacts</Link>}
      />
    )
  }
  if (!contact) return null

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <Link to={`/contacts/${id}`} className="btn-ghost btn-sm -ml-2 text-slate-500">
        <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
        {contact.name}
      </Link>
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Edit contact</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Update {contact.name.split(' ')[0]}'s details.</p>
      </div>
      <ContactForm
        initial={contact}
        isEdit
        contactId={id}
        onSaved={(result) => navigate(`/contacts/${result.contact?.id || id}`)}
      />
    </div>
  )
}
