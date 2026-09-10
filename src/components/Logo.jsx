import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', linkTo = '/', dark = false }) {
  const box = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const text = size === 'lg' ? 'text-2xl' : 'text-lg'
  const content = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`${box} inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-ocean to-teal shadow-soft`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" className="h-2/3 w-2/3" fill="none">
          <circle cx="24" cy="26" r="9" fill="white" opacity="0.95" />
          <path d="M10 52c2-9 8-13 14-13s12 4 14 13" fill="white" opacity="0.9" />
          <circle cx="46" cy="22" r="5" fill="#FFD166" />
          <circle cx="50" cy="40" r="5" fill="#FF7F50" />
        </svg>
      </span>
      <span className={`font-display font-bold tracking-tight ${text} ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
        Connectinfo<span className="text-ocean">.com</span>
      </span>
    </span>
  )
  return linkTo ? (
    <Link to={linkTo} aria-label="Connectinfo.com home" className="rounded-xl">
      {content}
    </Link>
  ) : (
    content
  )
}
