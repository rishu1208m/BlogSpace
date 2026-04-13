import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '../lib/firebase'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Feather, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react'

const STEPS = { FORM: 'form', OTP: 'otp' }

export default function RegisterPage() {
    const [step, setStep] = useState(STEPS.FORM)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [gLoading, setGLoading] = useState(false)
    const navigate = useNavigate()

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const saveSession = (token, user) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    // Step 1 — submit form, send OTP
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
        setLoading(true)
        try {
            await api.post('/auth/register/initiate', form)
            toast.success('OTP sent! Check your email inbox.')
            setStep(STEPS.OTP)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP')
        } finally { setLoading(false) }
    }

    // Step 2 — verify OTP
    const handleVerify = async () => {
        const code = otp.join('')
        if (code.length < 6) return toast.error('Enter the complete 6-digit OTP')
        setLoading(true)
        try {
            const { data } = await api.post('/auth/register/verify', {
                email: form.email,
                code,
            })
            saveSession(data.token, data.user)
            toast.success('Email verified! Welcome to BlogSpace 🎉')
            navigate('/')
            window.location.reload()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP. Try again.')
            setOtp(['', '', '', '', '', ''])
            document.getElementById('otp-0')?.focus()
        } finally { setLoading(false) }
    }

    // Resend OTP
    const handleResend = async () => {
        setLoading(true)
        try {
            await api.post('/auth/register/initiate', form)
            toast.success('New OTP sent!')
            setOtp(['', '', '', '', '', ''])
        } catch (err) {
            toast.error('Failed to resend OTP')
        } finally { setLoading(false) }
    }

    // Google
    const handleGoogle = async () => {
        setGLoading(true)
        try {
            const result = await signInWithGoogle()
            const token = await result.user.getIdToken()
            const { data } = await api.post('/auth/google', { firebaseToken: token })
            saveSession(data.token, data.user)
            toast.success('Welcome to BlogSpace!')
            navigate('/')
            window.location.reload()
        } catch {
            toast.error('Google sign-in failed')
        } finally { setGLoading(false) }
    }

    const handleOtpChange = (val, idx) => {
        if (!/^\d*$/.test(val)) return
        const next = [...otp]
        next[idx] = val
        setOtp(next)
        if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
    }

    const handleOtpKey = (e, idx) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            document.getElementById(`otp-${idx - 1}`)?.focus()
        }
    }

    return (
        <div className="min-h-[88vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm slide-in">

                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center glow-accent">
                        <Feather size={20} className="text-white" />
                    </div>
                </div>

                {step === STEPS.FORM && (
                    <>
                        <h1 className="text-2xl font-semibold text-center mb-1">Create your account</h1>
                        <p className="text-slate-400 text-sm text-center mb-8">
                            Your email will be verified via OTP
                        </p>

                        <div className="card p-6">
                            <button
                                onClick={handleGoogle}
                                disabled={gLoading}
                                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-4
                           border border-surface-border rounded-xl text-sm font-medium
                           text-slate-300 hover:bg-surface-hover hover:border-slate-500
                           transition-all duration-200 disabled:opacity-50"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {gLoading ? 'Signing in…' : 'Continue with Google'}
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-surface-border" />
                                <span className="text-xs text-slate-600">or register with email</span>
                                <div className="flex-1 h-px bg-surface-border" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Full name</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input className="input pl-9" name="name" placeholder="Your full name"
                                            value={form.name} onChange={handle} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email address</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input className="input pl-9" name="email" type="email"
                                            placeholder="you@gmail.com" value={form.email} onChange={handle} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            className="input pl-9 pr-10"
                                            name="password"
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Min. 6 characters"
                                            value={form.password}
                                            onChange={handle}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(s => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        >
                                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1.5">Must be at least 6 characters</p>
                                </div>

                                <button className="btn-primary w-full" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Sending OTP…
                                        </span>
                                    ) : 'Create account'}
                                </button>
                            </form>
                        </div>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="link font-medium">Sign in</Link>
                        </p>
                    </>
                )}

                {step === STEPS.OTP && (
                    <>
                        <button
                            onClick={() => setStep(STEPS.FORM)}
                            className="btn-ghost flex items-center gap-2 mb-6 -ml-2"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>

                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 bg-green-900/30 border border-green-700/40
                              rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={26} className="text-green-400" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-semibold text-center mb-1">Check your email</h1>
                        <p className="text-slate-400 text-sm text-center mb-2">
                            We sent a 6-digit verification code to
                        </p>
                        <p className="text-slate-200 text-sm text-center font-medium mb-8">
                            {form.email}
                        </p>

                        <div className="card p-6">
                            <div className="flex gap-2 justify-center mb-6">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, i)}
                                        onKeyDown={(e) => handleOtpKey(e, i)}
                                        className="w-11 h-12 text-center text-xl font-bold bg-dark-800
                               border border-surface-border rounded-xl text-slate-100
                               focus:border-accent focus:ring-2 focus:ring-accent/20
                               outline-none transition-all duration-150"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerify}
                                className="btn-primary w-full mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Verifying…
                                    </span>
                                ) : 'Verify email'}
                            </button>

                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">Didn't receive it?</p>
                                <button
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="text-xs text-accent hover:text-accent-hover transition-colors disabled:opacity-50"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-600 mt-4">
                            OTP expires in 10 minutes
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}