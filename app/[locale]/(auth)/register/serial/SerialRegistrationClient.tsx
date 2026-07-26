'use client'

import { useState } from 'react'
import { KeyRound, ArrowRight, CheckCircle2, User, Mail, Lock, Building, Phone } from 'lucide-react'
import { verifySerial, claimSerial } from './actions'
import Link from 'next/link'

type SerialInfo = {
  id: string
  code: string
  status: string
  plans: {
    id: string
    name_en: string
    name_ar: string
    code: string
    price_egp: number
    billing_cycle: string
  } | null
}

export default function SerialRegistrationClient({
  locale,
  clinicTypes
}: {
  locale: string,
  clinicTypes: any[]
}) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Serial
  const [serialCode, setSerialCode] = useState('')
  const [serialInfo, setSerialInfo] = useState<SerialInfo | null>(null)

  // Step 2: Details
  const [clinicName, setClinicName] = useState('')
  const [clinicTypeId, setClinicTypeId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await verifySerial(serialCode)
      setSerialInfo(data as unknown as SerialInfo)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Invalid serial code.')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await claimSerial(serialCode, email, password, fullName, clinicName, clinicTypeId, ownerPhone, locale)
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration.')
      setLoading(false)
    }
  }

  const plan = serialInfo?.plans
  const planName = plan ? (locale === 'ar' ? plan.name_ar : plan.name_en) : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <KeyRound className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {locale === 'ar' ? 'تفعيل كود السيريل' : 'Activate Serial Code'}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 1
                ? (locale === 'ar' ? 'أدخل كود السيريل المكون من 12 حرفاً.' : 'Enter your 12-character serial code.')
                : (locale === 'ar' ? 'أكمل إعداد حسابك.' : 'Complete your account setup.')}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          {/* Step 1: Enter Serial */}
          {step === 1 && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'كود السيريل' : 'Serial Code'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={serialCode}
                    onChange={e => setSerialCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full h-12 pl-10 pr-4 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-center tracking-widest font-mono text-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || serialCode.length < 5}
                className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (locale === 'ar' ? 'جاري التحقق...' : 'Verifying...')
                  : (locale === 'ar' ? 'تحقق' : 'Verify Code')}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
            </form>
          )}

          {/* Step 2: Fill Details */}
          {step === 2 && (
            <form onSubmit={handleClaim} className="space-y-4">
              {/* Serial verified banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-200">
                  <span className="font-semibold text-emerald-400 block mb-1">
                    {locale === 'ar' ? 'تم التحقق من السيريل!' : 'Serial Verified!'}
                  </span>
                  {locale === 'ar' ? 'الباقة:' : 'Plan:'} <b>{planName}</b>
                  {plan && (
                    <span className="text-emerald-300/70 block text-xs mt-1">
                      {plan.price_egp} EGP/{plan.billing_cycle === 'yearly' ? (locale === 'ar' ? 'سنوياً' : 'yr') : (locale === 'ar' ? 'شهرياً' : 'mo')}
                    </span>
                  )}
                </div>
              </div>

              {/* Clinic Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'اسم العيادة' : 'Clinic Name'}
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Clinic Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'نوع العيادة' : 'Clinic Type'}
                </label>
                <select
                  required
                  value={clinicTypeId}
                  onChange={e => setClinicTypeId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                >
                  <option value="">{locale === 'ar' ? 'اختر النوع...' : 'Select type...'}</option>
                  {clinicTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {locale === 'ar' ? type.name_ar : type.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-px w-full bg-white/5 my-2" />

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={e => setOwnerPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {locale === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading
                  ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Setting up...')
                  : (locale === 'ar' ? 'إنشاء الحساب وتفعيل العيادة' : 'Create Account & Activate Clinic')}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link href={`/${locale}/register`} className="text-slate-400 hover:text-white transition-colors">
              &larr; {locale === 'ar' ? 'رجوع للخيارات' : 'Back to options'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
