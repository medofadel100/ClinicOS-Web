'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient(rememberMe ? { maxAge: 31536000 } : { maxAge: undefined })

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Your email is not confirmed. Please check your inbox.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      router.push(`/${locale}/clinic-switcher`)
      router.refresh()
    }
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
          {t('title')}
        </h2>
        <p className="text-sm text-slate-500">{t('description')}</p>
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
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-300"
            >
              {t('email')}
            </Label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
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

          {/* Password field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-300"
            >
              {t('password')}
            </Label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pl-10 pr-11 text-sm text-slate-200 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200 p-0.5 rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-slate-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium text-slate-400 cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'hsl(168 100% 52%)' }}
            >
              Forgot password?
            </button>
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

          {/* Submit button */}
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
            {/* Shimmer effect */}
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
              {loading ? t('loading') : t('submit')}
            </span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            href={`/${locale}/register`}
            className="font-semibold transition-colors duration-200"
            style={{ color: 'hsl(168 100% 52%)' }}
          >
            Create one now
          </Link>
        </p>
        <p className="text-center text-xs text-slate-700">
          By continuing, you agree to our{' '}
          <span className="text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
