import { useState } from 'react'
import { LoginForm, RegisterForm } from '../auth/AuthForms'

export function AuthPage({ mode, onNavigate }: { mode: 'login' | 'register'; onNavigate: (path: string) => void }) {
  const [message, setMessage] = useState('')
  return <main className="auth-page"><div className="auth-intro"><p className="eyebrow"><span className="eyebrow-dot" /> CloudReview AI</p><h1>Make room for<br /><span>better decisions.</span></h1><p>Sign in to keep your product signals, favorites, and profile in one place.</p></div><div className="auth-card">{mode === 'login' ? <LoginForm onComplete={setMessage} /> : <RegisterForm onComplete={setMessage} />}{message && <p className="form-success" role="status">{message}</p>}<p className="auth-switch">{mode === 'login' ? 'New to CloudReview?' : 'Already have an account?'} <button type="button" onClick={() => onNavigate(mode === 'login' ? '#register' : '#login')}>{mode === 'login' ? 'Register' : 'Log in'}</button></p></div></main>
}