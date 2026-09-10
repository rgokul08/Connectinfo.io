import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { isValidEmail } from '../utils/validation'
import { getUsers } from '../utils/storage'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const verifyEmail = (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) return setError('Enter a valid email address.')
    if (!getUsers().some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
      return setError("We couldn't find an account with that email.")
    setError('')
    setStep(2)
  }

  const submitNew = async (e) => {
    e.preventDefault()
    if (password.length < 8 || !/\d/.test(password)) return setError('Use at least 8 characters with one number.')
    if (confirm !== password) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await resetPassword(email, password)
      toast.success('Password updated! Sign in with your new password.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={step === 1 ? 'Enter the email tied to your account.' : `Set a new password for ${email}.`}
      footer={<>Remembered it? <Link to="/login" className="font-semibold text-ocean hover:underline">Back to sign in</Link></>}
    >
      <div className="mb-5 flex items-center gap-2" aria-hidden="true">
        {[1, 2].map((n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? 'bg-teal' : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {step === 1 ? (
        <form onSubmit={verifyEmail} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fp-email" className="label">Account email</label>
            <input id="fp-email" type="email" autoFocus autoComplete="email" className="input"
              placeholder="you@example.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }} />
          </div>
          <button type="submit" className="btn-primary btn-lg w-full">Verify email</button>
        </form>
      ) : (
        <form onSubmit={submitNew} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fp-password" className="label">New password</label>
            <input id="fp-password" type="password" autoFocus autoComplete="new-password" className="input"
              placeholder="At least 8 characters with a number" value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }} />
          </div>
          <div>
            <label htmlFor="fp-confirm" className="label">Confirm new password</label>
            <input id="fp-confirm" type="password" autoComplete="new-password" className="input"
              placeholder="Repeat the new password" value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError('') }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Local demo flow — in a real product this step would email you a secure reset link.
      </p>
    </AuthShell>
  )
}
