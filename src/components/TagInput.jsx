import { useState } from 'react'
import { HiOutlineXMark, HiOutlineTag } from 'react-icons/hi2'
import { tagStyle } from '../utils/contactUtils'

export default function TagInput({ tags, onChange, suggestions = [] }) {
  const [value, setValue] = useState('')

  const add = (raw) => {
    const tag = raw.trim()
    if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...tags, tag])
    setValue('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(value)
    } else if (e.key === 'Backspace' && !value && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  const unused = suggestions.filter((s) => !tags.includes(s)).slice(0, 6)

  return (
    <div>
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 transition focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/50 dark:border-slate-700 dark:bg-slate-900">
        {tags.map((tag) => (
          <span key={tag} className={`chip ${tagStyle(tag)}`}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`} className="rounded-full hover:opacity-70">
              <HiOutlineXMark className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => value.trim() && add(value)}
          placeholder={tags.length ? '' : 'Type and press Enter…'}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 dark:text-slate-100"
          aria-label="Add a tag"
        />
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <HiOutlineTag className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {unused.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="chip border border-dashed border-slate-300 text-slate-500 transition hover:border-teal hover:text-teal dark:border-slate-600 dark:text-slate-400">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
