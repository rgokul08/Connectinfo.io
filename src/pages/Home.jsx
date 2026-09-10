import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass, HiOutlineEnvelope, HiOutlinePhone, HiOutlineStar,
  HiOutlineUserGroup, HiOutlineArrowDownTray, HiOutlineLockClosed, HiOutlineCheckCircle,
  HiOutlineBars3, HiOutlineXMark, HiOutlineSparkles, HiOutlineQrCode, HiOutlineBolt,
} from 'react-icons/hi2'
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6'
import Logo from '../components/Logo.jsx'
import Avatar from '../components/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

/* ---------- small decorative contact card for the hero ---------- */
function FloatingCard({ className = '', name, role, accent, delay = '0s', email, phone }) {
  return (
    <div
      className={`glass pointer-events-none absolute w-56 rounded-2xl p-4 shadow-lift animate-float ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{role}</p>
        </div>
        <HiOutlineStar className={`ml-auto h-4 w-4 ${accent === 'gold' ? 'text-gold' : 'text-slate-300'}`} fill={accent === 'gold' ? 'currentColor' : 'none'} />
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-2"><HiOutlineEnvelope className="h-3.5 w-3.5 text-ocean" />{email}</p>
        <p className="flex items-center gap-2"><HiOutlinePhone className="h-3.5 w-3.5 text-teal" />{phone}</p>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: HiOutlineMagnifyingGlass, accent: 'text-ocean bg-ocean/10', title: 'Instant search & filters', text: 'Find anyone by name, email, phone, company or tag as you type — with favorites, groups and archive filters.' },
  { icon: HiOutlineEnvelope, accent: 'text-coral bg-coral/10', title: 'One-tap email & call', text: 'Click an email to open your mail app, tap a number to call. Send in-app email through EmailJS, right from a contact.' },
  { icon: HiOutlineUserGroup, accent: 'text-teal bg-teal/10', title: 'Groups & tags', text: 'Organize people into Family, Work, Clients or your own custom groups, and slice them across flexible tags.' },
  { icon: HiOutlineArrowDownTray, accent: 'text-gold-dark bg-gold/20', title: 'Import & export', text: 'Bring your contacts in from JSON or CSV, export a backup any time, and let duplicate detection keep things clean.' },
  { icon: HiOutlineQrCode, accent: 'text-ocean bg-ocean/10', title: 'QR contact sharing', text: 'Generate a vCard QR for any contact, copy their details, or share with the native share sheet.' },
  { icon: HiOutlineLockClosed, accent: 'text-coral bg-coral/10', title: 'Private by design', text: 'Your contacts live in this browser — nothing is silently synced anywhere. Export or wipe your data whenever you want.' },
]

const STEPS = [
  { n: '01', title: 'Create your account', text: 'Sign up in seconds — your address book stays in your browser.' },
  { n: '02', title: 'Add or import contacts', text: 'Add people one by one, or import a whole JSON/CSV file with duplicate checks.' },
  { n: '03', title: 'Connect in one tap', text: 'Email, call, share or favorite — and follow every touchpoint on the activity timeline.' },
]

export default function Home() {
  const { user, loginDemo } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const exploreDemo = async () => {
    setDemoLoading(true)
    try {
      await loginDemo()
      toast.success('Welcome to the demo workspace!')
      navigate('/dashboard')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-950">
      {/* ---------- Navbar ---------- */}
      <header className="glass sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6" aria-label="Main">
          <Logo linkTo="/" />
          <div className="mx-4 hidden items-center gap-1 md:flex">
            <a href="#features" className="btn-ghost btn-sm">Features</a>
            <a href="#how" className="btn-ghost btn-sm">How it works</a>
            <a href="#about" className="btn-ghost btn-sm">About</a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary">Open Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
                <Link to="/signup" className="btn-primary">Get started</Link>
              </>
            )}
            <button className="icon-btn md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
              {menuOpen ? <HiOutlineXMark className="h-6 w-6" /> : <HiOutlineBars3 className="h-6 w-6" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="border-t border-slate-200/70 px-4 py-3 dark:border-slate-800 md:hidden">
            <div className="flex flex-col gap-1">
              <a href="#features" onClick={() => setMenuOpen(false)} className="nav-item">Features</a>
              <a href="#how" onClick={() => setMenuOpen(false)} className="nav-item">How it works</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="nav-item">About</a>
              {!user && <Link to="/login" className="nav-item">Sign in</Link>}
            </div>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-coral/20 blur-3xl dark:bg-coral/10" />
          <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-teal/20 blur-3xl dark:bg-teal/10" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-ocean/20 blur-3xl dark:bg-ocean/10" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-24">
          <div className="animate-fade-up">
            <span className="chip bg-ocean/10 text-ocean dark:text-ocean-light">
              <HiOutlineSparkles className="h-4 w-4" />
              Contacts · Communication · Lightweight CRM
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Your contacts.<br />
              Your connections.<br />
              <span className="bg-gradient-to-r from-ocean via-teal to-coral bg-clip-text text-transparent">One simple place.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Connectinfo.com keeps every person that matters beautifully organized — and one tap away, by email, phone, or a QR scan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link to="/dashboard" className="btn-primary btn-lg">Open Dashboard</Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary btn-lg">Get started — free</Link>
                  <Link to="/login" className="btn-outline btn-lg">Sign in</Link>
                </>
              )}
              <button onClick={exploreDemo} disabled={demoLoading} className="btn-ghost btn-lg">
                {demoLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-ocean" /> : <HiOutlineBolt className="h-5 w-5 text-gold-dark" />}
                Explore demo
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              {['No server setup', 'Works offline', 'Import / export included'].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><HiOutlineCheckCircle className="h-4 w-4 text-teal" />{t}</span>
              ))}
            </div>
          </div>

          {/* Hero visual: floating contact cards + connection lines */}
          <div className="relative mx-auto hidden h-[460px] w-full max-w-md sm:block" style={{ perspective: '900px' }} aria-hidden="true">
            <svg className="absolute inset-0 h-full w-full text-slate-300 dark:text-slate-700" viewBox="0 0 448 460" fill="none">
              <path d="M88 120 C 180 90, 260 100, 344 150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6" />
              <path d="M100 300 C 180 260, 280 280, 350 236" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6" />
              <circle cx="88" cy="120" r="4" fill="#FF7F50" />
              <circle cx="344" cy="150" r="4" fill="#06D6A0" />
              <circle cx="100" cy="300" r="4" fill="#118AB2" />
              <circle cx="350" cy="236" r="4" fill="#FFD166" />
            </svg>
            <FloatingCard className="left-0 top-6 rotate-[-3deg]" name="Arun Kumar" role="Software Engineer · TechNova" email="arun.kumar@example.com" phone="+91 98410 22334" accent="gold" delay="0s" />
            <FloatingCard className="right-0 top-40 rotate-[2.5deg]" name="Sarah Wilson" role="Product Designer" email="sarah.wilson@example.com" phone="+1 415 555 0142" delay="1.2s" />
            <FloatingCard className="bottom-4 left-6 rotate-[-1.5deg]" name="Priya Sharma" role="Marketing Lead" email="priya.sharma@example.com" phone="+91 90031 45678" delay="2.4s" />
            <div className="absolute right-16 top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-gold text-white shadow-lift animate-float" style={{ animationDelay: '0.6s' }}>
              <HiOutlineEnvelope className="h-7 w-7" />
            </div>
            <div className="absolute bottom-24 right-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean to-teal text-white shadow-lift animate-float" style={{ animationDelay: '1.8s' }}>
              <HiOutlinePhone className="h-7 w-7" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="relative border-t border-slate-200/60 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything a real contact manager should do
            </h2>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
              Not just CRUD — a daily-driver for your network.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, accent, title, text }, i) => (
              <article key={title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent} transition group-hover:scale-110`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Up and running in three steps
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card relative overflow-hidden p-6">
                <span className="absolute -right-2 -top-4 font-display text-7xl font-extrabold text-slate-100 dark:text-slate-800" aria-hidden="true">{s.n}</span>
                <h3 className="relative font-display text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section id="about" className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean via-ocean-dark to-teal px-6 py-14 text-center shadow-lift sm:px-12">
            <div className="pointer-events-none absolute -left-10 -top-20 h-56 w-56 rounded-full bg-coral/30 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-gold/30 blur-3xl" aria-hidden="true" />
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Start building your network today
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-ocean-50/90">
              Your contacts are stored locally in this browser — private by default, portable whenever you want.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link to="/dashboard" className="btn-lg btn bg-white text-ocean-dark shadow-lift hover:bg-slate-100">Open Dashboard</Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-lg btn bg-white text-ocean-dark shadow-lift hover:bg-slate-100">Create free account</Link>
                  <button onClick={exploreDemo} className="btn-lg btn border border-white/40 text-white hover:bg-white/10">Explore demo</button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-slate-200/70 bg-white py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo linkTo="/" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Contact management, communication and lightweight CRM — in one simple, private place.
              </p>
            </div>
            {[
              { title: 'Product', links: [['Features', '#features'], ['How it works', '#how'], ['Get started', '/signup']] },
              { title: 'Account', links: [['Sign in', '/login'], ['Create account', '/signup'], ['Forgot password', '/forgot-password']] },
              { title: 'Legal', links: [['Privacy', '/#privacy'], ['Terms', '/#terms']] },
            ].map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{col.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith('/') && !href.startsWith('/#') ? (
                        <Link to={href} className="text-slate-500 transition hover:text-ocean dark:text-slate-400">{label}</Link>
                      ) : (
                        <a href={href} className="text-slate-500 transition hover:text-ocean dark:text-slate-400">{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 dark:border-slate-800 sm:flex-row">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} Connectinfo.com — demo product. Data stays in your browser.</p>
            <div className="flex gap-2">
              {[FaTwitter, FaGithub, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#top" aria-label={['Twitter', 'GitHub', 'LinkedIn'][i]} className="icon-btn">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
