import { useCountUp } from '../utils/hooks'

const ACCENTS = {
  ocean: 'from-ocean to-ocean-light',
  teal: 'from-teal to-teal-light',
  coral: 'from-coral to-coral-light',
  gold: 'from-gold to-gold-light',
}

export default function StatsCard({ icon: Icon, label, value, accent = 'ocean', hint }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  return (
    <div className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[accent]} text-white shadow-soft transition group-hover:scale-110`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {animated.toLocaleString()}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}
