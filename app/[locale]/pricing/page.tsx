import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Check, HelpCircle, ChevronRight } from 'lucide-react'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'الأسعار والباقات' : 'Pricing & Plans',
    description: isAr
      ? 'اختر الباقة المناسبة لعيادتك — باقات سحابية وتثبيت محلي بأسعار مناسبة للسوق المصري.'
      : 'Choose the right plan for your clinic — cloud and self-hosted plans at prices tailored for the Egyptian market.',
  }
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

  const onlinePlans = (plans ?? []).filter(p => !p.code.startsWith('offline-'))
  const offlinePlans = (plans ?? []).filter(p => p.code.startsWith('offline-'))

  const faq = [
    {
      q: isAr ? 'هل يمكنني تغيير باقتي لاحقاً؟' : 'Can I change my plan later?',
      a: isAr ? 'نعم، يمكنك الترقية أو تخفيض باقتك في أي من لوحة التحكم. الفروق تُحسب نسبياً.' : 'Yes, you can upgrade or downgrade your plan at any time from the dashboard. Differences are prorated.',
    },
    {
      q: isAr ? 'هل يوجد فترة تجريبية مجانية؟' : 'Is there a free trial?',
      a: isAr ? 'نعم! باقة Starter مجانية للأبد مع ميزات أساسية كافية للعيادات الصغيرة.' : 'Yes! The Starter plan is free forever with enough basic features for small clinics.',
    },
    {
      q: isAr ? 'ما الفرق بين الباقات السحابية و المحلية؟' : 'What\'s the difference between cloud and self-hosted?',
      a: isAr ? 'الباقات السحابية تعمل على خوادمنا (لا تحتاج سيرفر) — الباقات المحلية تتطلب تثبيت على سيرفر خاص بالعيادة.' : 'Cloud plans run on our servers (no server needed) — self-hosted plans require installation on your own clinic server.',
    },
    {
      q: isAr ? 'هل البيانات آمنة؟' : 'Is my data secure?',
      a: isAr ? 'نعم. نستخدم Supabase مع تشفير على مستوى قاعدة البيانات و SSL/TLS لكل الاتصالات. البيانات تُخزّن في مراكز بيانات آمنة.' : 'Yes. We use Supabase with database-level encryption and SSL/TLS for all connections. Data is stored in secure data centers.',
    },
    {
      q: isAr ? 'هل يمكنني الدفع بالجنيه المصري؟' : 'Can I pay in Egyptian Pounds?',
      a: isAr ? 'نعم، جميع أسعارنا بالجنيه المصري (EGP) — لا نقبل خيارات دفع أخرى حالياً.' : 'Yes, all our prices are in Egyptian Pounds (EGP) — no other payment options currently.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
              <Image src="/logo.png" alt="ClinicOS" width={40} height={40} className="object-contain p-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ClinicOS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/${altLocale}/pricing`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.08]">{altLabel}</Link>
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/register`} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <HelpCircle className="w-3.5 h-3.5" />
          {isAr ? 'أسعار مصممة للسوق المصري' : 'Prices Tailored for Egypt'}
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          {isAr ? 'الأسعار والباقات' : 'Pricing & Plans'}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          {isAr
            ? 'ابدأ مجاناً واترقِ حسب احتياجات عيادتك. بدون بطاقة ائتمان، بدون عقود.'
            : 'Start free and upgrade as your clinic grows. No credit card, no contracts.'}
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{isAr ? 'تجربة مجانية' : 'Free trial'}</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{isAr ? 'بدون بطاقة ائتمان' : 'No credit card'}</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{isAr ? 'إلغاء في أي وقت' : 'Cancel anytime'}</div>
        </div>
      </section>

      {/* Cloud Plans */}
      {onlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">{isAr ? 'الباقات السحابية' : 'Cloud Plans'}</h2>
              <p className="text-slate-400 max-w-xl mx-auto">{isAr ? 'استضافة كاملة على خوادمنا — لا تحتاج سيرفر.' : 'Fully hosted on our servers — no server needed.'}</p>
            </div>
            <div className={`grid gap-6 ${onlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'}`}>
              {onlinePlans.map((plan, idx) => {
                const popular = idx === Math.floor(onlinePlans.length / 2)
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const storage = plan.plan_limits?.find((l: any) => l.limit_type === 'storage_mb')?.max_value
                const featureNames = (plan.plan_features ?? []).map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean)
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهرياً' : '/mo') : (isAr ? '/سنوياً' : '/yr')
                return (
                  <div key={plan.code} className={`relative p-6 rounded-2xl transition-all ${popular ? 'ring-2 ring-emerald-500/40 bg-emerald-500/[0.04]' : 'bg-white/[0.02]'}`} style={{ border: `1px solid ${popular ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                    {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900">{isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}</div>}
                    <h3 className="text-xl font-bold text-white mb-1">{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-4xl font-bold text-emerald-400">{formattedPrice}</span>
                      {priceNum > 0 && <span className="text-sm text-slate-500">EGP{cycleLabel}</span>}
                      {priceNum === 0 && <span className="text-sm text-slate-500">{isAr ? ' للأبد' : ' forever'}</span>}
                    </div>
                    <div className="space-y-2 mb-6">
                      {seats && <p className="text-sm text-slate-300">{isAr ? `حتى ${seats} أطباء` : `Up to ${seats} doctors`}</p>}
                      {patients && <p className="text-sm text-slate-300">{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                      {storage && <p className="text-sm text-slate-300">{isAr ? `${(storage / 1024).toFixed(1)} جيجا مخزون` : `${(storage / 1024).toFixed(1)} GB storage`}</p>}
                    </div>
                    <div className="border-t border-white/[0.06] pt-4 mb-6">
                      {featureNames.map((fname: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300 py-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" />{fname}</div>
                      ))}
                    </div>
                    <Link href={`/${locale}/register`} className={`block w-full h-12 rounded-xl text-sm font-bold text-center transition-all ${popular ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 shadow-lg shadow-emerald-500/20' : 'bg-white/[0.06] text-slate-200 border border-white/10 hover:bg-white/[0.1]'}`}>
                      {priceNum === 0 ? (isAr ? 'ابدأ الآن مجاناً' : 'Start Free Now') : (isAr ? 'ابدأ الآن' : 'Get Started')}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Self-Hosted Plans */}
      {offlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">{isAr ? 'خطط التثبيت المحلي' : 'Self-Hosted Plans'}</h2>
              <p className="text-slate-400 max-w-xl mx-auto">{isAr ? 'للعيادات التي تفضل تشغيل النظام على خوادمها الخاصة — تثبيت مرة واحدة وتشغيل مستمر.' : 'For clinics that prefer to run the system on their own servers — one-time install, continuous operation.'}</p>
            </div>
            <div className={`grid gap-6 ${offlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto'}`}>
              {offlinePlans.map((plan) => {
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const staff = plan.plan_limits?.find((l: any) => l.limit_type === 'staff_accounts')?.max_value
                const featureNames = (plan.plan_features ?? []).map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean)
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهرياً' : '/mo') : (isAr ? '/سنوياً' : '/yr')
                return (
                  <div key={plan.code} className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <h3 className="text-lg font-bold text-white mb-1">{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-3xl font-bold text-emerald-400">{formattedPrice}</span>
                      {priceNum > 0 && <span className="text-sm text-slate-500">EGP{cycleLabel}</span>}
                    </div>
                    <div className="space-y-1 mb-4">
                      {seats && <p className="text-sm text-slate-300">{isAr ? `${seats} أطباء` : `${seats} doctors`}</p>}
                      {patients && <p className="text-sm text-slate-300">{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                      {staff && <p className="text-sm text-slate-300">{isAr ? `${staff} موظفين` : `${staff} staff`}</p>}
                    </div>
                    <div className="border-t border-white/[0.06] pt-4 mb-6">
                      {featureNames.map((fname: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300 py-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" />{fname}</div>
                      ))}
                    </div>
                    <Link href={`/${locale}/contact`} className="block w-full h-11 rounded-xl text-sm font-bold text-center bg-white/[0.06] text-slate-200 border border-white/10 hover:bg-white/[0.1] transition-all">{isAr ? 'تواصل معنا' : 'Contact Us'}</Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comparison Table */}
      <section className="relative z-10 px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{isAr ? 'مقارنة الباقات السحابية' : 'Cloud Plans Comparison'}</h2>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04]">
                  <th className={`p-4 text-left font-semibold text-slate-300 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الميزة' : 'Feature'}</th>
                  {onlinePlans.map(plan => (
                    <th key={plan.code} className="p-4 text-center font-semibold text-slate-300">{isAr ? plan.name_ar : plan.name_en}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/[0.04]">
                  <td className={`p-4 text-slate-400 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'السعر' : 'Price'}</td>
                  {onlinePlans.map(plan => {
                    const priceNum = Number(plan.price_egp)
                    return <td key={plan.code} className="p-4 text-center font-bold text-emerald-400">{priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : `${priceNum.toLocaleString()} EGP`}</td>
                  })}
                </tr>
                <tr className="border-t border-white/[0.04] bg-white/[0.01]">
                  <td className={`p-4 text-slate-400 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الأطباء' : 'Doctors'}</td>
                  {onlinePlans.map(plan => {
                    const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                    return <td key={plan.code} className="p-4 text-center text-slate-300">{seats ?? '—'}</td>
                  })}
                </tr>
                <tr className="border-t border-white/[0.04]">
                  <td className={`p-4 text-slate-400 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المرضى' : 'Patients'}</td>
                  {onlinePlans.map(plan => {
                    const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                    return <td key={plan.code} className="p-4 text-center text-slate-300">{patients?.toLocaleString() ?? '—'}</td>
                  })}
                </tr>
                <tr className="border-t border-white/[0.04] bg-white/[0.01]">
                  <td className={`p-4 text-slate-400 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المخزون' : 'Storage'}</td>
                  {onlinePlans.map(plan => {
                    const storage = plan.plan_limits?.find((l: any) => l.limit_type === 'storage_mb')?.max_value
                    return <td key={plan.code} className="p-4 text-center text-slate-300">{storage ? `${(storage / 1024).toFixed(1)} GB` : '—'}</td>
                  })}
                </tr>
                <tr className="border-t border-white/[0.04]">
                  <td className={`p-4 text-slate-400 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الميزات' : 'Features'}</td>
                  {onlinePlans.map(plan => (
                    <td key={plan.code} className="p-4 text-center text-slate-300">{(plan.plan_features ?? []).length}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 lg:px-12 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-slate-200 font-medium list-none">
                  {item.q}
                  <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-white/[0.02] border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.06)]">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'جاهز للبدء؟' : 'Ready to Get Started?'}</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{isAr ? 'ابدأ مجاناً اليوم — لا حاجة لبطاقة ائتمان.' : 'Start free today — no credit card needed.'}</p>
          <Link href={`/${locale}/register`} className="inline-flex items-center gap-2 h-13 px-8 rounded-xl text-base font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
            {isAr ? 'سجّل عيادتك الآن' : 'Register Your Clinic Now'}<ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-white/[0.06]" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="ClinicOS" width={28} height={28} className="object-contain" />
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ClinicOS</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{isAr ? 'نظام إدارة العيادات المتكامل — مصمم للسوق المصري.' : 'The complete clinic management system — built for Egypt.'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'المنتج' : 'Product'}</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/pricing`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'الأسعار' : 'Pricing'}</Link></li>
                <li><Link href={`/${locale}/download`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'التحميل' : 'Download'}</Link></li>
                <li><Link href={`/${locale}/contact`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'تواصل معنا' : 'Contact'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'القانوني' : 'Legal'}</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/terms`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'شروط الاستخدام' : 'Terms of Service'}</Link></li>
                <li><Link href={`/${locale}/terms`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'حسابك' : 'Your Account'}</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/login`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link></li>
                <li><Link href={`/${locale}/register`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'إنشاء حساب' : 'Create Account'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">&copy; 2026 ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-4">
              <Link href={`/${altLocale}/pricing`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'English' : 'عربي'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
