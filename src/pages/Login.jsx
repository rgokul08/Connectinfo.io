import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { isValidEmail } from '../utils/validation'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const set = (field) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: v }))
    setErrors((er) => ({ ...er, [field]: undefined }))
    setServerError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address.'
    if (!form.password) errs.password = 'Password is required.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to open your contact book."
      footer={<>New to Connectinfo? <Link to="/signup" className="font-semibold text-ocean hover:underline">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {serverError && (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
            {serverError}
          </p>
        )}

        <div>
          <label htmlFor="login-email" className="label">Email</label>
          <div className="relative">
            <HiOutlineEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="login-email" type="email" autoComplete="email" autoFocus
              className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={set('email')}
            />
          </div>
          {errors.email && <p role="alert" className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="label">Password</label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-semibold text-ocean hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="login-password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
              className={`input pl-10 pr-11 ${errors.password ? 'input-error' : ''}`}
              placeholder="Your password" value={form.password} onChange={set('password')}
            />
            <button type="button" onClick={() => setShowPass((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p role="alert" className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={form.remember} onChange={set('remember')} className="h-5 w-5 accent-ocean" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Keep me signed in on this device</span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}
