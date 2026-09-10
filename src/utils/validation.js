/* Reusable validation helpers */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const isValidEmail = (value) => EMAIL_RE.test(String(value || '').trim())

/** Accepts international formats like +91 98765 43210, (555) 123-4567, 0044..., etc. */
export const normalizePhone = (phone) => String(phone || '').replace(/[^\d+]/g, '')
export const isValidPhone = (phone) => {
  if (!phone) return false
  const cleaned = normalizePhone(phone)
  if (cleaned.replace(/\D/g, '').length < 7 || cleaned.replace(/\D/g, '').length > 15) return false
  return /^\+?\d[\d\s().-]*$/.test(String(phone).trim())
}

export const isValidUrl = (value) => {
  if (!value) return true // optional fields
  try {
    const url = value.startsWith('http') ? value : `https://${value}`
    new URL(url)
    return /^[\w.-]+\.[a-z]{2,}/i.test(value.replace(/^https?:\/\//, ''))
  } catch {
    return false
  }
}

/* ---------------- Password strength ---------------- */
export function passwordStrength(password) {
  const p = password || ''
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const levels = [
    { label: 'Too weak', bar: 'w-1/5 bg-red-500', text: 'text-red-500' },
    { label: 'Weak', bar: 'w-2/5 bg-coral', text: 'text-coral' },
    { label: 'Fair', bar: 'w-3/5 bg-gold-dark', text: 'text-gold-dark' },
    { label: 'Good', bar: 'w-4/5 bg-teal', text: 'text-teal' },
    { label: 'Strong', bar: 'w-full bg-teal', text: 'text-teal' },
    { label: 'Excellent', bar: 'w-full bg-teal', text: 'text-teal' },
  ]
  return { score, ...levels[score] }
}

export function validateSignup({ name, email, password, confirmPassword }, users) {
  const errors = {}
  if (!name?.trim()) errors.name = 'Full name is required.'
  if (!email?.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  else if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
    errors.email = 'An account with this email already exists.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Use at least 8 characters.'
  else if (!/\d/.test(password)) errors.password = 'Include at least one number.'
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function validateContactForm(data) {
  const errors = {}
  if (!data.name?.trim()) errors.name = 'Name is required.'
  if (!data.email?.trim() && !data.phone?.trim())
    errors.email = 'Add at least one contact method — an email or a phone number.'
  if (data.email?.trim() && !isValidEmail(data.email)) errors.email = 'Enter a valid email address.'
  if (data.phone?.trim() && !isValidPhone(data.phone)) errors.phone = 'Enter a valid phone number.'
  if (data.website?.trim() && !isValidUrl(data.website)) errors.website = 'Enter a valid website (e.g. example.com).'
  return errors
}
