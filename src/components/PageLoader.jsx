import Logo from './Logo.jsx'

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5" role="status" aria-label="Loading page">
      <div className="animate-pulse">
        <Logo linkTo={null} size="lg" />
      </div>
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-ocean/20 border-t-ocean" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
