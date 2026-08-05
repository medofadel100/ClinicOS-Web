'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordForm({ locale }: { locale: string }) {
  const isAr = locale === 'ar'

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const t = {
    title: isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?',
    description: isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور.' : "Enter your email and we'll send you a link to reset your password.",
    email: isAr ? 'البريد الإلكتروني' : 'Email Address',
    placeholder: isAr ? 'name@clinic.com' : 'name@clinic.com',
    submit: isAr ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link',
    sending: isAr ? 'جاري الإرسال...' : 'Sending...',
    backToLogin: isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In',
    successTitle: isAr ? 'تم الإرسال!' : 'Email Sent!',
    successDesc: isAr ? 'إذا كان البريد مسجّلًا عندنا، ستتلقى رابطًا لإعادة تعيين كلمة المرور. تحقق من صندوق الوارد وبريد Spam أيضًا.' : "If an account exists with that email, you'll receive a password reset link shortly. Check your inbox and spam folder.",
    failedTitle: isAr ? 'فشل في الإرسال' : 'Failed to send',
    tryAgain: isAr ? 'حاول مرة أخرى' : 'Try again',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col space-y-7 animate-slide-in-up">
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4" style={{ border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t.successTitle}
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t.successDesc}
          </p>
        </div>

        <Link
          href={`/${locale}/login`}
          className="flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToLogin}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-7 animate-slide-in-up">
      {/* Header */}
      <div className="space-y-2">
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t.title}
        </h2>
        <p className="text-sm text-slate-500">{t.description}</p>
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl p-6 sm:p-7 space-y-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="email">
              {t.email}
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 transition-all duration-200 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(0,212,170,0.5)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.08), 0 0 16px rgba(0,212,170,0.05)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl text-sm animate-slide-in-up"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-11 rounded-xl text-sm font-semibold text-[#0a0f1e] transition-all duration-200 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? 'rgba(0,212,170,0.6)'
                : 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
              boxShadow: loading ? 'none' : '0 0 24px rgba(0,212,170,0.4), 0 4px 16px rgba(0,212,170,0.2)',
            }}
          >
            {!loading && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  transform: 'skewX(-15deg)',
                }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t.sending : t.submit}
            </span>
          </button>
        </form>
      </div>

      {/* Back to login */}
      <Link
        href={`/${locale}/login`}
        className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.backToLogin}
      </Link>
    </div>
  )
}
