import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

/**
 * Shared layout for Login / Signup / Forgot password —
 * brand panel on the left (desktop), form card on the right.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.15fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-teal/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-coral/25 blur-3xl" aria-hidden="true" />
        <Logo linkTo="/" dark />
        <div className="relative">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-white xl:text-4xl">
            Your contacts.<br />Your connections.<br />
            <span className="bg-gradient-to-r from-gold to-coral bg-clip-text text-transparent">One simple place.</span>
          </h2>
          <p className="mt-4 max-w-sm text-ocean-50/80">
            Organize people, reach out in one tap, and keep your network with you — stored privately in this browser.
          </p>
        </div>
        <p className="relative text-xs text-ocean-50/60">Demo auth: accounts are stored locally only.</p>
      </aside>

      {/* Form side */}
      <div className="relative flex flex-col items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-8">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-teal/10 blur-3xl" aria-hidden="true" />
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo linkTo="/" />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
          <p className="mt-10 text-center text-xs text-slate-400">
            <Link to="/" className="font-medium text-ocean hover:underline">← Back to Connectinfo.com</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
