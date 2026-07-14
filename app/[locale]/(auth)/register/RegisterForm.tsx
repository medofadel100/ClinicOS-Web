'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { linkClinicOwner } from './actions'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function RegisterForm({ 
  locale, 
  initialClinicTypes, 
  initialPlans 
}: { 
  locale: string,
  initialClinicTypes: any[],
  initialPlans: any[]
}) {
  const t = useTranslations('Register')
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    clinicName: '',
    clinicTypeId: initialClinicTypes[0]?.id || '',
    email: '',
    password: '',
    planId: '' // empty means trial
  })

  const isArabic = locale === 'ar'

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleRegister = async (selectedPlanId: string) => {
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

    // 2. Call RPC to create clinic and subscription
    const { data: clinicId, error: rpcError } = await supabase.rpc('create_clinic_self_signup', {
      clinic_name: formData.clinicName,
      clinic_type_id: formData.clinicTypeId,
      owner_full_name: formData.fullName,
      owner_phone: formData.phone || '000000000', // fallback if empty
      chosen_plan_id: selectedPlanId || null
    })

    if (rpcError) {
      setError(rpcError.message || 'Failed to create clinic')
      setLoading(false)
      return
    }

    // 3. Link owner in ClinicOS Web tables via Server Action
    const linkRes = await linkClinicOwner({
      userId: authData.user.id,
      fullName: formData.fullName,
      clinicId: clinicId
    })

    if (!linkRes.success) {
      setError(linkRes.error || 'Failed to link clinic owner.')
      setLoading(false)
      return
    }

    // 4. Complete
    setLoading(false)
    if (!selectedPlanId) {
      // Trial plan chosen, immediate redirect
      router.push(`/${locale}/clinic-switcher`)
      router.refresh()
    } else {
      // Paid plan chosen, show pending confirmation
      setStep(3)
    }
  }

  if (step === 3) {
    return (
      <div className="flex flex-col space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
          <Clock className="h-8 w-8 text-blue-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Account Created Successfully</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your clinic has been created and you have selected a paid plan. This is a 2-day provisional period. Our team will contact you today to confirm your payment method.
          </p>
        </div>
        <Button onClick={() => {
          router.push(`/${locale}/clinic-switcher`)
          router.refresh()
        }} className="w-full h-11 text-base">
          Go to Dashboard
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="clinicType">Clinic Type</Label>
                <select
                  id="clinicType"
                  value={formData.clinicTypeId}
                  onChange={(e) => setFormData({ ...formData, clinicTypeId: e.target.value })}
                  className="flex h-11 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {initialClinicTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {isArabic ? type.name_ar : type.name_en}
                    </option>
                  ))}
                  {initialClinicTypes.length === 0 && (
                    <option value="">No clinic types found</option>
                  )}
                </select>
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
            <Link href={`/${locale}/login`} className="font-semibold text-primary hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </form>
      ) : (
        <div className="space-y-8">
          
          {/* Trial Option Always Available */}
          <div className="rounded-xl border p-6 shadow-sm bg-accent/30 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Start Free 7-Day Trial</h3>
              <p className="text-sm text-muted-foreground mt-2">Try all features for 7 days, no credit card required.</p>
            </div>
            <Button 
              className="mt-6 w-full font-semibold" 
              onClick={() => handleRegister('')}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Creating...' : 'Start Trial'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or select a plan</span>
            </div>
          </div>

          <div className="grid gap-6">
            {initialPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{isArabic ? plan.name_ar : plan.name_en}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{isArabic ? plan.description_ar : plan.description_en}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{plan.price_egp}</span>
                    <span className="text-sm text-muted-foreground block">EGP / month</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <ul className="space-y-2 mb-6 text-sm">
                    {plan.plan_features?.map((pf: any) => (
                      <li key={pf.feature_id} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span>{isArabic ? pf.features?.name_ar : pf.features?.name_en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full font-semibold" 
                  onClick={() => handleRegister(plan.id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Choose this plan'}
                </Button>
              </div>
            ))}
            
            {initialPlans.length === 0 && (
              <div className="text-center p-6 border rounded-lg bg-muted/50 text-muted-foreground">
                No plans available at the moment. You can still start a free trial.
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <Button type="button" variant="ghost" className="w-full h-11" onClick={() => setStep(1)} disabled={loading}>
            {t('back')}
          </Button>
        </div>
      )}
    </div>
  )
}
