import { initials, avatarGradient } from '../utils/contactUtils'

const SIZES = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
}

export default function Avatar({ name = '', src = '', size = 'md', className = '' }) {
  const cls = `${SIZES[size] || SIZES.md} ${className} inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-display font-bold text-white`
  if (src) {
    return <img src={src} alt={name ? `${name}'s avatar` : 'Avatar'} className={`${cls} object-cover`} />
  }
  return (
    <span className={`${cls} bg-gradient-to-br ${avatarGradient(name)}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
