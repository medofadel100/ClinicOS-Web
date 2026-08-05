'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordForm({ locale }: { locale: string }) {
  const isAr = locale === 'ar'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [hashError, setHashError] = useState(false)

  const t = {
    title: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
    description: isAr ? 'أدخل كلمة المرور الجديدة لحسابك.' : 'Enter your new password below.',
    newPassword: isAr ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: isAr ? 'تأكيد كلمة المرور' : 'Confirm Password',
    submit: isAr ? 'حفظ كلمة المرور الجديدة' : 'Save New Password',
    saving: isAr ? 'جاري الحفظ...' : 'Saving...',
    successTitle: isAr ? 'تم بنجاح!' : 'Password Updated!',
    successDesc: isAr ? 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' : 'Your password has been updated. You can now sign in with your new password.',
    signIn: isAr ? 'تسجيل الدخول' : 'Sign In',
    errorTitle: isAr ? 'رابط غير صالح' : 'Invalid Link',
    errorDesc: isAr ? 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.' : 'This reset link is invalid or has expired. Please request a new one.',
    requestNew: isAr ? 'طلب رابط جديد' : 'Request New Link',
    passwordMismatch: isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
    passwordTooShort: isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' : 'Password must be at least 6 characters.',
  }

  useEffect(() => {
    const _supabase = createClient()
    const hash = window.location.hash

    if (hash && hash.includes('access_token')) {
      setReady(true)
    } else {
      setHashError(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t.passwordTooShort)
      return
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (hashError) {
    return (
      <div className="flex flex-col space-y-7 animate-slide-in-up">
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="w-8 h-8 text-red-400" />
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
            {t.errorTitle}
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t.errorDesc}
          </p>
        </div>

        <Link
          href={`/${locale}/forgot-password`}
          className="flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
            color: '#0a0f1e',
            boxShadow: '0 0 24px rgba(0,212,170,0.4)',
          }}
        >
          {t.requestNew}
        </Link>
      </div>
    )
  }

  if (success) {
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
            background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
            color: '#0a0f1e',
            boxShadow: '0 0 24px rgba(0,212,170,0.4)',
          }}
        >
          {t.signIn}
        </Link>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-7 animate-slide-in-up">
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

      <div
        className="rounded-2xl p-6 sm:p-7 space-y-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="password">
              {t.newPassword}
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-11 text-sm text-slate-200 transition-all duration-200 rounded-xl"
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="confirmPassword">
              {t.confirmPassword}
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm text-slate-200 transition-all duration-200 rounded-xl"
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
              {loading ? t.saving : t.submit}
            </span>
          </button>
        </form>
      </div>

      <Link
        href={`/${locale}/login`}
        className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        {isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
      </Link>
    </div>
  )
}
