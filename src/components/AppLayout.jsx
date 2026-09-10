import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  HiOutlineSquares2X2, HiOutlineUsers, HiOutlineStar, HiOutlineUserGroup, HiOutlineClock,
  HiOutlineUserCircle, HiOutlineCog6Tooth, HiOutlineMagnifyingGlass, HiOutlinePlus,
  HiOutlineArrowRightOnRectangle, HiOutlineBars3, HiOutlineXMark,
} from 'react-icons/hi2'
import Logo from './Logo.jsx'
import Avatar from './Avatar.jsx'
import CommandPalette from './CommandPalette.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useContacts } from '../context/ContactContext.jsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { to: '/contacts', label: 'Contacts', icon: HiOutlineUsers },
  { to: '/favorites', label: 'Favorites', icon: HiOutlineStar },
  { to: '/groups', label: 'Groups', icon: HiOutlineUserGroup },
  { to: '/activity', label: 'Activity', icon: HiOutlineClock },
  { to: '/profile', label: 'Profile', icon: HiOutlineUserCircle },
  { to: '/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { contacts } = useContacts()
  const navigate = useNavigate()
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  /* Close transient UI on route change */
  useEffect(() => { setDrawerOpen(false); setMenuOpen(false) }, [location.pathname])

  /* Global keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === '/') {
        e.preventDefault()
        document.getElementById('contact-search')?.focus()
        if (!document.getElementById('contact-search')) setPaletteOpen(true)
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault()
        navigate('/contacts/new')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate])

  /* Close user menu on outside click */
  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const favCount = useMemo(() => contacts.filter((c) => c.favorite && !c.archived).length, [contacts])

  const desktopNav = (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
          {label === 'Favorites' && favCount > 0 && (
            <span className="ml-auto rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-dark dark:text-gold">{favCount}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white py-5 dark:border-slate-800 dark:bg-slate-900/70 lg:flex">
        <div className="px-6 pb-5">
          <Logo linkTo="/dashboard" />
        </div>
        {desktopNav}
        <div className="mt-auto space-y-1 border-t border-slate-100 px-3 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} className="nav-item w-full text-red-500 hover:bg-red-500/10 hover:text-red-500">
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {/* ---------- Top bar ---------- */}
      <header className="glass sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800 lg:pl-64">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <button className="icon-btn lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu">
            <HiOutlineBars3 className="h-6 w-6" />
          </button>
          <div className="lg:hidden"><Logo size="sm" linkTo="/dashboard" /></div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="ml-2 hidden h-10 min-w-[240px] items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 text-sm text-slate-400 transition hover:border-ocean/40 hover:text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 lg:flex"
          >
            <HiOutlineMagnifyingGlass className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search Connectinfo…</span>
            <kbd className="rounded-md border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold dark:border-slate-600">Ctrl K</kbd>
          </button>
          <button onClick={() => setPaletteOpen(true)} className="icon-btn lg:hidden" aria-label="Search">
            <HiOutlineMagnifyingGlass className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link to="/contacts/new" className="btn-coral hidden md:inline-flex">
              <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
              Add contact
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-full transition hover:ring-2 hover:ring-ocean/40"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
              </button>
              {menuOpen && (
                <div role="menu" className="glass absolute right-0 mt-2 w-56 rounded-2xl p-1.5 shadow-lift animate-scale-in">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <div className="my-1 h-px bg-slate-200/70 dark:bg-slate-700/70" />
                  <Link role="menuitem" to="/profile" className="nav-item"><HiOutlineUserCircle className="h-5 w-5" />Profile</Link>
                  <Link role="menuitem" to="/settings" className="nav-item"><HiOutlineCog6Tooth className="h-5 w-5" />Settings</Link>
                  <button
                    role="menuitem"
                    onClick={() => { logout(); navigate('/login') }}
                    className="nav-item w-full text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-5 w-5" />Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Mobile drawer (side sheet) ---------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="glass absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col py-5 shadow-lift animate-slide-in-left">
            <div className="flex items-center justify-between px-5 pb-5">
              <Logo linkTo="/dashboard" />
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu">
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
            {desktopNav}
            <div className="mt-auto border-t border-slate-200/70 px-3 pt-4 dark:border-slate-700/70">
              <button onClick={() => { logout(); navigate('/login') }} className="nav-item w-full text-red-500 hover:bg-red-500/10">
                <HiOutlineArrowRightOnRectangle className="h-5 w-5" />Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Main content ---------- */}
      <main className="px-4 pb-28 pt-6 sm:px-6 lg:pb-10 lg:pl-72 lg:pr-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav aria-label="Mobile navigation" className="glass fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 pb-[env(safe-area-inset-bottom)] dark:border-slate-800 lg:hidden">
        <div className="grid grid-cols-5">
          {NAV.slice(0, 2).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} aria-label={label}
              className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${isActive ? 'text-ocean dark:text-ocean-light' : 'text-slate-400'}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <div className="relative flex justify-center">
            <Link
              to="/contacts/new"
              aria-label="Add contact"
              className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-coral to-gold text-white shadow-lift transition hover:scale-105 active:scale-95"
            >
              <HiOutlinePlus className="h-7 w-7" aria-hidden="true" />
            </Link>
            <span className="mt-8 pb-1 text-[10px] font-semibold text-slate-400">Add</span>
          </div>
          {NAV.slice(2, 4).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} aria-label={label}
              className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${isActive ? 'text-ocean dark:text-ocean-light' : 'text-slate-400'}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
