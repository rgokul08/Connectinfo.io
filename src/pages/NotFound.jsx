import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { HiOutlineArrowLeft, HiOutlineSignalSlash } from 'react-icons/hi2'

export default function NotFound() {
  const { user } = useAuth()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-teal/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-coral/15 blur-3xl" aria-hidden="true" />

      <Logo linkTo="/" />
      <p className="mt-10 font-display text-7xl font-extrabold tracking-tight sm:text-8xl">
        <span className="bg-gradient-to-br from-ocean via-teal to-coral bg-clip-text text-transparent animate-float inline-block">404</span>
      </p>
      <div className="mt-4 flex items-center gap-2 text-slate-400">
        <HiOutlineSignalSlash className="h-5 w-5" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">This connection doesn't exist.</h1>
      </div>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for was moved, deleted, or never connected in the first place.
      </p>
      <Link to={user ? '/dashboard' : '/'} className="btn-primary mt-8">
        <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
        {user ? 'Return to Dashboard' : 'Back to home'}
      </Link>
    </div>
  )
}
