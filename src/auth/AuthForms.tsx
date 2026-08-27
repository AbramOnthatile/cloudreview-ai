import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

type FormProps = { onComplete: (message: string) => void }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm({ onComplete }: FormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!emailPattern.test(email)) return setError('Enter a valid email address.')
    if (!password) return setError('Enter your password.')
    setSubmitting(true)
    let signInError
    try {
      ({ error: signInError } = await supabase.auth.signInWithPassword({ email, password }))
    } catch {
      setSubmitting(false)
      setError('Unable to reach Supabase. Check your connection and try again.')
      return
    }
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message.toLowerCase().includes('email not confirmed') ? 'Please verify your email before signing in.' : signInError.message.toLowerCase().includes('invalid login credentials') ? 'The email or password is incorrect.' : 'Unable to sign in. Check your connection and try again.')
      return
    }
    onComplete('Signed in successfully.')
  }

  return <AuthForm title="Welcome back" submitLabel="Log in" submitting={submitting} error={error} onSubmit={submit}>
    <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
    <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
  </AuthForm>
}

export function RegisterForm({ onComplete }: FormProps) {
  const [values, setValues] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (key: keyof typeof values) => (value: string) => setValues((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (Object.values(values).some((value) => !value.trim())) return setError('Complete every field to continue.')
    if (!emailPattern.test(values.email)) return setError('Enter a valid email address.')
    if (values.password.length < 6) return setError('Password must be at least 6 characters.')
    if (values.password !== values.confirmPassword) return setError('Passwords do not match.')
    setSubmitting(true)
    let data
    let signUpError
    try {
      ({ data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.fullName, username: values.username } },
      }))
    } catch {
      setSubmitting(false)
      setError('Unable to reach Supabase. Check your connection and try again.')
      return
    }
    if (signUpError) {
      setSubmitting(false)
      setError(signUpError.message.toLowerCase().includes('already registered') ? 'An account with this email already exists.' : 'Unable to create your account. Check your connection and try again.')
      return
    }
    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, username: values.username, full_name: values.fullName })
      if (profileError) {
        setSubmitting(false)
        setError('Your account was created, but your profile could not be saved. Please try again.')
        return
      }
    }
    setSubmitting(false)
    onComplete(data.session ? 'Account created. You are now signed in.' : 'Account created. Check your email to verify your account.')
  }

  return <AuthForm title="Create your account" submitLabel="Create account" submitting={submitting} error={error} onSubmit={submit}>
    <Field label="Full name" value={values.fullName} onChange={update('fullName')} autoComplete="name" />
    <Field label="Username" value={values.username} onChange={update('username')} autoComplete="username" />
    <Field label="Email" type="email" value={values.email} onChange={update('email')} autoComplete="email" />
    <Field label="Password" type="password" value={values.password} onChange={update('password')} autoComplete="new-password" />
    <Field label="Confirm password" type="password" value={values.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" />
  </AuthForm>
}

function Field({ label, type = 'text', value, onChange, autoComplete }: { label: string; type?: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  return <label className="auth-field"><span>{label}</span><input required type={type} value={value} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} /></label>
}

function AuthForm({ title, submitLabel, submitting, error, onSubmit, children }: { title: string; submitLabel: string; submitting: boolean; error: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; children: ReactNode }) {
  return <form className="auth-form" onSubmit={onSubmit} noValidate><h1>{title}</h1>{children}{error && <p className="form-error" role="alert">{error}</p>}<button className="auth-submit" disabled={submitting} type="submit">{submitting ? 'Please wait...' : submitLabel}</button></form>
}