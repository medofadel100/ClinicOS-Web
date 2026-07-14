'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { initializeClinic } from './actions'
import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('Register')
  const router = useRouter()
  const supabase = createClient()

  const plans = [
    { id: 'trial', name: '7-Day Free Trial', price: 'Free', desc: 'Try all features for 7 days.' },
    { id: 'pro', name: 'Pro Plan', price: 'EGP 900/mo', desc: 'Perfect for small to medium clinics.' },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'For large medical centers.' }
  ]

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    clinicName: '',
    email: '',
    password: '',
    planName: 'trial'
  })

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleRegister = async () => {
    setLoading(true)
    setError(null)

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Failed to create account.')
      setLoading(false)
      return
    }

    // 2. Initialize Clinic
    const initRes = await initializeClinic({
      userId: authData.user.id,
      fullName: formData.fullName,
      clinicName: formData.clinicName,
      planName: formData.planName
    })

    if (!initRes.success) {
      setError(initRes.error || 'Failed to initialize clinic.')
      setLoading(false)
      return
    }

    // 3. Complete
    setLoading(false)
    if (formData.planName === 'trial') {
      router.push(`/${locale}/clinic-switcher`)
      router.refresh()
    } else {
      setStep(3)
    }
  }

  if (step === 3) {
    return (
      <div className="flex flex-col space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t('successTitle')}</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t('successDesc')}
          </p>
        </div>
        <Button onClick={() => {
          router.push(`/${locale}/clinic-switcher`)
          router.refresh()
        }} className="w-full h-11 text-base">
          {t('goDashboard')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 text-center lg:text-start">
        <h2 className="text-3xl font-semibold tracking-tight">
          {step === 1 ? t('title') : t('planTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {step === 1 ? t('description') : t('planDesc')}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Ahmed"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicName">{t('clinicName')}</Label>
                <Input
                  id="clinicName"
                  placeholder="My Clinic"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm transition-all hover:shadow-md">
            {t('continue')}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            {t('alreadyHaveAccount')}{' '}
            <a href={`/${locale}/login`} className="font-semibold text-primary hover:underline">
              {t('signIn')}
            </a>
          </p>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setFormData({ ...formData, planName: plan.id })}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${
                  formData.planName === plan.id
                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                    : 'border-input hover:bg-accent/50'
                }`}
              >
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-foreground">{plan.name}</span>
                    <span className="mt-1 flex items-center text-sm text-muted-foreground">{plan.desc}</span>
                  </div>
                </div>
                <div className="mt-0 ml-4 flex items-center justify-center font-semibold text-primary">
                  {plan.price}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="w-full h-11" onClick={() => setStep(1)} disabled={loading}>
              {t('back')}
            </Button>
            <Button type="button" onClick={handleRegister} className="w-full h-11 font-medium" disabled={loading}>
              {loading ? t('creating') : t('complete')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
