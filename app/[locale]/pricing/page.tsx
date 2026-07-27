import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ChevronRight, Shield, Lock, Star, Zap, ArrowRight, HelpCircle, Globe } from 'lucide-react'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'الأسعار والباقات — ClinicOS' : 'Pricing & Plans — ClinicOS',
    description: isAr
      ? 'اختر الباقة المناسبة لعيادتك — باقات سحابية وتثبيت محلي بأسعار مناسبة للسوق المصري.'
      : 'Choose the right plan for your clinic — cloud and self-hosted plans at prices tailored for the Egyptian market.',
  }
}

type Plan = {
  id: string
  name_en: string
  name_ar: string
  price_egp: number
  billing_cycle: string
  code: string
  plan_features?: { features?: { name_en: string; name_ar: string } | null }[]
  plan_limits?: { limit_type: string; max_value: number }[]
}

export default async function PricingPage({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  const altLocale = isAr ? 'en' : 'ar'
  const altLabel = isAr ? 'EN' : 'عربي'

  const supabase = createClient()
  const { data: plans } = await supabase
    .from('plans')
    .select(`
      id, name_en, name_ar, price_egp, billing_cycle, code,
      plan_features ( features ( name_en, name_ar ) ),
      plan_limits ( limit_type, max_value )
    `)
    .eq('is_active', true)
    .order('price_egp', { ascending: true })

  const onlinePlans: Plan[] = ((plans ?? []) as unknown as Plan[]).filter(p => !p.code.startsWith('offline-'))
  const offlinePlans: Plan[] = ((plans ?? []) as unknown as Plan[]).filter(p => p.code.startsWith('offline-'))

  const faq = [
    {
      q: isAr ? 'هل يمكنني تغيير باقتي لاحقاً؟' : 'Can I change my plan later?',
      a: isAr ? 'نعم، يمكنك الترقية أو تخفيض باقتك في أي وقت من لوحة التحكم. الفروق تُحسب نسبياً.' : 'Yes, you can upgrade or downgrade your plan at any time from the dashboard. Differences are prorated.',
    },
    {
      q: isAr ? 'هل يوجد فترة تجريبية مجانية؟' : 'Is there a free trial?',
      a: isAr ? 'نعم! باقة Starter مجانية للأبد مع ميزات أساسية كافية للعيادات الصغيرة.' : 'Yes! The Starter plan is free forever with enough basic features for small clinics.',
    },
    {
      q: isAr ? 'ما الفرق بين الباقات السحابية والمحلية؟' : "What's the difference between cloud and self-hosted?",
      a: isAr ? 'الباقات السحابية تعمل على خوادمنا (لا تحتاج سيرفر) — الباقات المحلية تتطلب تثبيت على سيرفر خاص.' : 'Cloud plans run on our servers (no server needed) — self-hosted plans require installation on your own server.',
    },
    {
      q: isAr ? 'هل البيانات آمنة؟' : 'Is my data secure?',
      a: isAr ? 'نعم. نستخدم Supabase مع تشفير على مستوى قاعدة البيانات و SSL/TLS لكل الاتصالات.' : 'Yes. We use Supabase with database-level encryption and SSL/TLS for all connections.',
    },
    {
      q: isAr ? 'هل يمكنني الدفع بالجنيه المصري؟' : 'Can I pay in Egyptian Pounds?',
      a: isAr ? 'نعم، جميع أسعارنا بالجنيه المصري (EGP).' : 'Yes, all our prices are in Egyptian Pounds (EGP).',
    },
  ]

  const badges = [
    { icon: Shield, label: isAr ? 'آمن بالكامل' : 'Fully Secure' },
    { icon: Zap, label: isAr ? 'سريع الإعداد' : 'Quick Setup' },
    { icon: Star, label: isAr ? 'دعم فني' : 'Tech Support' },
    { icon: Globe, label: isAr ? 'متاح دائماً' : 'Always Online' },
  ]

  return (
    <div
      className="min-h-screen text-white font-sans"
      style={{ backgroundColor: '#060b14' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Ambient BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-15%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(6,11,20,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Image src="/logo.png" alt="ClinicOS" width={40} height={40} className="object-contain p-1" />
            </div>
            <span style={{
              fontSize: 20, fontWeight: 800,
              background: 'linear-gradient(135deg, #34d399, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>ClinicOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: `/${locale}`, label: isAr ? 'الرئيسية' : 'Home' },
              { href: `/${locale}/download`, label: isAr ? 'التحميل' : 'Download' },
              { href: `/${locale}/contact`, label: isAr ? 'تواصل معنا' : 'Contact' },
            ].map(nav => (
              <Link key={nav.href} href={nav.href} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#94a3b8',
              }}>{nav.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${altLocale}/pricing`} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: '#64748b', border: '1px solid rgba(255,255,255,0.08)',
            }}>{altLabel}</Link>
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#94a3b8',
            }}>{isAr ? 'دخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/register`} style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              color: '#030712', display: 'inline-block',
              background: 'linear-gradient(135deg, #34d399, #22d3ee)',
              boxShadow: '0 4px 15px rgba(16,185,129,0.35)',
            }}>{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 lg:px-12 pt-24 pb-20 text-center max-w-4xl mx-auto">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700, marginBottom: 24,
          color: '#34d399', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
        }}>
          <HelpCircle className="w-3.5 h-3.5" />
          {isAr ? 'أسعار مصممة للسوق المصري' : 'Prices Tailored for Egypt'}
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
          lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #f1f5f9 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isAr ? 'الأسعار والباقات' : 'Pricing & Plans'}
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.8 }}>
          {isAr
            ? 'ابدأ مجاناً واترقِ حسب احتياجات عيادتك. بدون بطاقة ائتمان، بدون عقود.'
            : 'Start free and upgrade as your clinic grows. No credit card, no contracts.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {[
            { icon: Check, label: isAr ? 'تجربة مجانية' : 'Free trial' },
            { icon: Check, label: isAr ? 'بدون بطاقة ائتمان' : 'No credit card' },
            { icon: Check, label: isAr ? 'إلغاء في أي وقت' : 'Cancel anytime' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
              <b.icon style={{ width: 16, height: 16, color: '#34d399' }} />
              {b.label}
            </div>
          ))}
        </div>
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#64748b',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <b.icon style={{ width: 15, height: 15, color: '#34d399' }} />
              {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* CLOUD PLANS */}
      {onlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
                {isAr ? 'الباقات السحابية' : 'Cloud Plans'}
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', maxWidth: 440, margin: '0 auto' }}>
                {isAr ? 'استضافة كاملة على خوادمنا — لا تحتاج سيرفر.' : 'Fully hosted on our servers — no server needed.'}
              </p>
            </div>
            <div className={`grid gap-6 ${onlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {onlinePlans.map((plan, idx) => {
                const popular = idx === Math.floor(onlinePlans.length / 2)
                const seats = plan.plan_limits?.find(l => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find(l => l.limit_type === 'patients')?.max_value
                const storage = plan.plan_limits?.find(l => l.limit_type === 'storage_mb')?.max_value
                const featureNames = (plan.plan_features ?? []).map(pf => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean) as string[]
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهر' : '/mo') : (isAr ? '/سنة' : '/yr')
                return (
                  <div key={plan.code} style={{
                    padding: 28, borderRadius: 20, display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden',
                    background: popular
                      ? 'linear-gradient(160deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${popular ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: popular ? '0 0 50px rgba(16,185,129,0.1), 0 1px 0 rgba(16,185,129,0.3) inset' : 'none',
                    transform: popular ? 'scale(1.03)' : 'scale(1)',
                  }}>
                    {popular && (
                      <div style={{
                        position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                        padding: '6px 20px', borderRadius: '0 0 12px 12px', fontSize: 11, fontWeight: 800,
                        background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                        color: '#030712', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                      }}>{isAr ? '⭐ الأكثر شعبية' : '⭐ MOST POPULAR'}</div>
                    )}
                    <div style={{ marginTop: popular ? 24 : 0, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{isAr ? plan.name_ar : plan.name_en}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                      <span style={{
                        fontSize: 44, fontWeight: 900,
                        background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>{formattedPrice}</span>
                      {priceNum > 0 && <span style={{ fontSize: 13, color: '#475569' }}>EGP{cycleLabel}</span>}
                      {priceNum === 0 && <span style={{ fontSize: 13, color: '#475569' }}>{isAr ? ' للأبد' : ' forever'}</span>}
                    </div>

                    {/* Limits */}
                    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {seats && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                          {isAr ? `حتى ${seats} أطباء` : `Up to ${seats} doctors`}
                        </div>
                      )}
                      {patients && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee' }} />
                          {isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}
                        </div>
                      )}
                      {storage && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} />
                          {isAr ? `${(storage / 1024).toFixed(1)} جيجا مخزون` : `${(storage / 1024).toFixed(1)} GB storage`}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                      {featureNames.map((fname, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                          <Check style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0, marginTop: 1 }} />
                          <span style={{ lineHeight: 1.5 }}>{fname}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={`/${locale}/register`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      height: 50, borderRadius: 12, fontSize: 15, fontWeight: 700, width: '100%',
                      ...(popular ? {
                        background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                        color: '#030712', boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                      } : {
                        background: 'rgba(255,255,255,0.05)',
                        color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)',
                      }),
                    }}>
                      {priceNum === 0 ? (isAr ? 'ابدأ مجاناً' : 'Start Free') : (isAr ? 'ابدأ الآن' : 'Get Started')}
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* SELF-HOSTED PLANS */}
      {offlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700, marginBottom: 16,
                color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <Lock className="w-3 h-3" />
                {isAr ? 'خوادمك الخاصة' : 'Your Own Servers'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
                {isAr ? 'خطط التثبيت المحلي' : 'Self-Hosted Plans'}
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
                {isAr
                  ? 'للعيادات التي تفضل تشغيل النظام على خوادمها الخاصة — خصوصية تامة وتحكم كامل.'
                  : 'For clinics preferring to run on their own servers — full privacy and control.'}
              </p>
            </div>
            <div className={`grid gap-5 ${offlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {offlinePlans.map((plan) => {
                const seats = plan.plan_limits?.find(l => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find(l => l.limit_type === 'patients')?.max_value
                const staff = plan.plan_limits?.find(l => l.limit_type === 'staff_accounts')?.max_value
                const featureNames = (plan.plan_features ?? []).map(pf => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean) as string[]
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهر' : '/mo') : (isAr ? '/سنة' : '/yr')
                return (
                  <div key={plan.code} style={{
                    padding: 24, borderRadius: 18, display: 'flex', flexDirection: 'column',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: '#34d399' }}>{formattedPrice}</span>
                      {priceNum > 0 && <span style={{ fontSize: 12, color: '#475569' }}>EGP{cycleLabel}</span>}
                    </div>
                    <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {seats && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{isAr ? `${seats} أطباء` : `${seats} doctors`}</p>}
                      {patients && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                      {staff && <p style={{ fontSize: 13, color: '#64748b' }}>{isAr ? `${staff} موظفين` : `${staff} staff`}</p>}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {featureNames.map((fname, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#64748b' }}>
                          <Check style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ lineHeight: 1.5 }}>{fname}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/${locale}/contact`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      height: 44, borderRadius: 10, fontSize: 13, fontWeight: 700,
                      color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      {isAr ? 'تواصل معنا' : 'Contact Us'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON TABLE (Cloud Plans) */}
      {onlinePlans.length > 1 && (
        <section className="relative z-10 px-6 lg:px-12 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                {isAr ? 'مقارنة الباقات السحابية' : 'Cloud Plans Comparison'}
              </h2>
            </div>
            <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th style={{ padding: '16px 20px', textAlign: isAr ? 'right' : 'left', fontWeight: 700, color: '#94a3b8', fontSize: 13 }}>
                      {isAr ? 'المعيار' : 'Feature'}
                    </th>
                    {onlinePlans.map(plan => (
                      <th key={plan.code} style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>
                        {isAr ? plan.name_ar : plan.name_en}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: isAr ? 'السعر' : 'Price',
                      getValue: (plan: Plan) => {
                        const n = Number(plan.price_egp)
                        return n === 0 ? (isAr ? 'مجاني' : 'Free') : `${n.toLocaleString()} EGP`
                      },
                      highlight: true,
                    },
                    {
                      label: isAr ? 'الأطباء' : 'Doctors',
                      getValue: (plan: Plan) => String(plan.plan_limits?.find(l => l.limit_type === 'provider_seats')?.max_value ?? '—'),
                    },
                    {
                      label: isAr ? 'المرضى' : 'Patients',
                      getValue: (plan: Plan) => {
                        const v = plan.plan_limits?.find(l => l.limit_type === 'patients')?.max_value
                        return v ? v.toLocaleString() : '—'
                      },
                    },
                    {
                      label: isAr ? 'التخزين' : 'Storage',
                      getValue: (plan: Plan) => {
                        const v = plan.plan_limits?.find(l => l.limit_type === 'storage_mb')?.max_value
                        return v ? `${(v / 1024).toFixed(1)} GB` : '—'
                      },
                    },
                    {
                      label: isAr ? 'عدد الميزات' : 'Features Count',
                      getValue: (plan: Plan) => String((plan.plan_features ?? []).length),
                    },
                  ].map((row, rowIdx) => (
                    <tr key={rowIdx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '14px 20px', color: '#64748b', fontWeight: 500, textAlign: isAr ? 'right' : 'left' }}>
                        {row.label}
                      </td>
                      {onlinePlans.map(plan => (
                        <td key={plan.code} style={{
                          padding: '14px 20px', textAlign: 'center',
                          color: row.highlight ? '#34d399' : '#94a3b8',
                          fontWeight: row.highlight ? 700 : 400,
                        }}>
                          {row.getValue(plan)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="relative z-10 px-6 lg:px-12 py-20" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faq.map((item, i) => (
              <details key={i} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                <summary style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, color: '#e2e8f0', listStyle: 'none',
                }}>
                  {item.q}
                  <ChevronRight style={{ width: 18, height: 18, color: '#64748b', flexShrink: 0, transform: 'rotate(0deg)' }} />
                </summary>
                <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#64748b', lineHeight: 1.8 }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto" style={{
          textAlign: 'center', padding: '64px 48px', borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(6,182,212,0.04) 100%)',
          border: '1px solid rgba(16,185,129,0.15)',
          boxShadow: '0 0 80px rgba(16,185,129,0.07)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.2), transparent)', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              {isAr ? 'جاهز للبدء اليوم؟' : 'Ready to Get Started?'}
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.8 }}>
              {isAr ? 'سجّل عيادتك مجاناً الآن — لا حاجة لبطاقة ائتمان.' : 'Register your clinic for free today — no credit card needed.'}
            </p>
            <Link href={`/${locale}/register`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              height: 56, padding: '0 40px', borderRadius: 14, fontSize: 16, fontWeight: 700,
              color: '#030712', background: 'linear-gradient(135deg, #34d399, #22d3ee)',
              boxShadow: '0 8px 30px rgba(16,185,129,0.35)',
            }}>
              {isAr ? 'سجّل عيادتك الآن' : 'Register Your Clinic Now'}
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 lg:px-12 py-14" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,7,12,0.8)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/logo.png" alt="ClinicOS" width={36} height={36} className="object-contain p-1" />
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.9, maxWidth: 300 }}>
                {isAr ? 'نظام إدارة العيادات المتكامل — مصمم خصيصاً للسوق الطبي المصري.' : 'The complete clinic management system — built for the Egyptian medical market.'}
              </p>
            </div>
            {[
              {
                title: isAr ? 'المنتج' : 'Product',
                links: [
                  { href: `/${locale}/pricing`, label: isAr ? 'الأسعار' : 'Pricing' },
                  { href: `/${locale}/download`, label: isAr ? 'التحميل' : 'Download' },
                  { href: `/${locale}/contact`, label: isAr ? 'تواصل معنا' : 'Contact' },
                ]
              },
              {
                title: isAr ? 'القانوني' : 'Legal',
                links: [
                  { href: `/${locale}/terms`, label: isAr ? 'شروط الاستخدام' : 'Terms' },
                  { href: `/${locale}/privacy`, label: isAr ? 'سياسة الخصوصية' : 'Privacy' },
                ]
              },
              {
                title: isAr ? 'الحساب' : 'Account',
                links: [
                  { href: `/${locale}/login`, label: isAr ? 'تسجيل الدخول' : 'Sign In' },
                  { href: `/${locale}/register`, label: isAr ? 'إنشاء حساب' : 'Create Account' },
                ]
              }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{col.title}</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} style={{ fontSize: 14, fontWeight: 500, color: '#475569' }}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#334155' }}>© {new Date().getFullYear()} ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <Link href={`/${altLocale}/pricing`} style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{isAr ? 'English' : 'عربي'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
