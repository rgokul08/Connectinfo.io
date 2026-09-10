import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { validateSignup, passwordStrength, isValidPhone } from '../utils/validation'
import { getUsers } from '../utils/storage'

export default function Signup() {
  const { signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(form.password)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const fieldCls = (name) => `input ${errors[name] ? 'input-error' : ''}`
  const FieldError = ({ name }) =>
    errors[name] ? <p role="alert" className="mt-1 text-xs font-medium text-red-500">{errors[name]}</p> : null

  const submit = async (e) => {
    e.preventDefault()
    const errs = validateSignup(form, getUsers())
    if (form.phone.trim() && !isValidPhone(form.phone)) errs.phone = 'Enter a valid phone number.'
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    setLoading(true)
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        seedDemo: true,
      })
      toast.success(`Welcome to Connectinfo, ${form.name.split(' ')[0]}!`)
      toast.info('We added sample contacts so you can explore — clear them anytime in Settings.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors({ email: err.message })
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Your data stays in your browser."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-ocean hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="su-name" className="label">Full name <span className="text-coral">*</span></label>
          <input id="su-name" autoComplete="name" placeholder="e.g. Alex Morgan"
            className={fieldCls('name')} value={form.name} onChange={set('name')} />
          <FieldError name="name" />
        </div>

        <div>
          <label htmlFor="su-email" className="label">Email <span className="text-coral">*</span></label>
          <input id="su-email" type="email" autoComplete="email" placeholder="you@example.com"
            className={fieldCls('email')} value={form.email} onChange={set('email')} />
          <FieldError name="email" />
        </div>

        <div>
          <label htmlFor="su-phone" className="label">Phone <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="su-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210"
            className={fieldCls('phone')} value={form.phone} onChange={set('phone')} />
          <FieldError name="phone" />
        </div>

        <div>
          <label htmlFor="su-password" className="label">Password <span className="text-coral">*</span></label>
          <div className="relative">
            <input
              id="su-password" type={showPass ? 'text' : 'password'} autoComplete="new-password"
              className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
              placeholder="At least 8 characters with a number"
              value={form.password} onChange={set('password')}
            />
            <button type="button" onClick={() => setShowPass((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2" aria-live="polite">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-full rounded-full transition-all ${strength.bar}`} />
              </div>
              <p className={`mt-1 text-xs font-medium ${strength.text}`}>
                {strength.label}{strength.score < 3 && ' — add length, capitals, numbers & symbols'}
              </p>
            </div>
          )}
          <FieldError name="password" />
        </div>

        <div>
          <label htmlFor="su-confirm" className="label">Confirm password <span className="text-coral">*</span></label>
          <input
            id="su-confirm" type={showPass ? 'text' : 'password'} autoComplete="new-password"
            className={fieldCls('confirmPassword')}
            placeholder="Repeat your password"
            value={form.confirmPassword} onChange={set('confirmPassword')}
          />
          <FieldError name="confirmPassword" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-xs leading-relaxed text-slate-400">
          Demo product: your account is stored only in this browser's LocalStorage — not on any server.
        </p>
      </form>
    </AuthShell>
  )
}
