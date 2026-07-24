import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Stethoscope, Calendar, Users, CreditCard, BarChart3, Shield, Zap, Globe, Download, ChevronRight, Check, Star, Smartphone, Monitor, Apple } from 'lucide-react'

const features = [
  { icon: Users, title_en: 'Patient Management', title_ar: 'إدارة المرضى', desc_en: 'Complete patient files with clinical history, vitals, and treatment plans.', desc_ar: 'ملفات مرضى كاملة مع التاريخ السريري وقياسات الحيوية وخطة العلاج.', color: 'text-blue-400', bg: 'rgba(59,130,246,0.12)' },
  { icon: Calendar, title_en: 'Smart Scheduling', title_ar: 'جدولة ذكية', desc_en: 'Book appointments, walk-ins, waitlists, and auto-assign doctors.', desc_ar: 'حجز مواعيد، دخول فوري، قوائم انتظار، وتعيين تلقائي للأطباء.', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.12)' },
  { icon: Stethoscope, title_en: '24 Specialty Modules', title_ar: '24 وحدة تخصص', desc_en: 'Dental, orthopedics, ophthalmology, dermatology, and 20+ more.', desc_ar: 'أسنان، عظام، عيون، جلدية، وأكثر من 20 تخصص آخر.', color: 'text-purple-400', bg: 'rgba(139,92,246,0.12)' },
  { icon: CreditCard, title_en: 'Billing & Payments', title_ar: 'الفواتير والمدفوعات', desc_en: 'Track payments, treatment plans, and financial reports.', desc_ar: 'تتبع المدفوعات، خطط العلاج، والتقارير المالية.', color: 'text-amber-400', bg: 'rgba(245,158,11,0.12)' },
  { icon: BarChart3, title_en: 'Analytics & Reports', title_ar: 'تحليلات وتقارير', desc_en: 'Revenue dashboards, appointment stats, and performance insights.', desc_ar: 'لوحات الإيرادات، إحصائيات المواعيد، ورؤى الأداء.', color: 'text-cyan-400', bg: 'rgba(34,211,238,0.12)' },
  { icon: Shield, title_en: 'Enterprise Security', title_ar: 'أمان المؤسسات', desc_en: 'Row-level security, role-based access, and audit logging.', desc_ar: 'أمان على مستوى الصفوف، وصول قائم على الأدوار، وسجل التدقيق.', color: 'text-red-400', bg: 'rgba(239,68,68,0.12)' },
]

export default async function LandingPage({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  const supabase = createClient()

  const { data: plans } = await supabase
    .from('plans')
    .select(`
      id, name_en, name_ar, price_egp, billing_cycle, code,
      plan_features (
        features ( name_en, name_ar )
      ),
      plan_limits (
        limit_type, max_value
      )
    `)
    .eq('is_active', true)
    .order('price_egp', { ascending: true })

  const planIcons: Record<string, string> = { starter: '🚀', professional: '⚡', enterprise: '🏢' }
  const planColors: Record<string, string> = {
    starter: 'border-emerald-500/30',
    professional: 'border-cyan-500/30',
    enterprise: 'border-purple-500/30',
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 100%)' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15" style={{ background: 'hsl(168 100% 42%)' }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ background: 'hsl(258 60% 55%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-8" style={{ background: 'hsl(195 100% 50%)' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/[0.06]">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 20px rgba(0,212,170,0.4)' }}>
            <img src="/logo.png" alt="ClinicOS" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/${locale === 'ar' ? 'en' : 'ar'}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors">
            {isAr ? 'EN' : 'عربي'}
          </Link>
          <Link href={`/${locale}/login`} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all">
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
          <Link href={`/${locale}/register`} className="px-5 py-2 rounded-lg text-sm font-bold text-[#0a0f1e] transition-all" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 16px rgba(0,212,170,0.3)' }}>
            {isAr ? 'ابدأ مجاناً' : 'Start Free'}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 py-20 lg:py-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: 'hsl(168 100% 52%)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(168 100% 42%)', boxShadow: '0 0 6px rgba(0,212,170,0.8)' }} />
          {isAr ? 'منصة إدارة العيادات رقم ١ في مصر' : '#1 Clinic Management Platform in Egypt'}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
          {isAr ? 'مستقبل' : 'The future of'}
          <br />
          <span style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 65%) 50%, hsl(258 60% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isAr ? 'إدارة العيادات' : 'clinic management'}
          </span>
          <br />
          {isAr ? 'هنا.' : 'is here.'}
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {isAr
            ? 'أتمتة العمليات، إدارة المواعيد، وتحسين رعاية المرضى مع منصة متطورة مصممة للعيادات المصرية.'
            : 'Streamline operations, manage appointments, and elevate patient care with a platform built for Egyptian clinics.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/${locale}/register`} className="h-12 px-8 rounded-xl text-base font-bold text-[#0a0f1e] inline-flex items-center gap-2 transition-all" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 24px rgba(0,212,170,0.4)' }}>
            {isAr ? 'ابدأ تجربتك المجانية' : 'Start Free Trial'}
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link href={`/${locale}/download`} className="h-12 px-8 rounded-xl text-base font-medium text-slate-300 inline-flex items-center gap-2 transition-all border border-white/10 hover:bg-white/[0.05]">
            <Download className="w-5 h-5" />
            {isAr ? 'تحميل التطبيق' : 'Download App'}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
          {[
            { value: '24+', label: isAr ? 'وحدة تخصص' : 'Specialty Modules' },
            { value: '24/7', label: isAr ? 'متاح دائماً' : 'Always Available' },
            { value: '#1', label: isAr ? 'في مصر' : 'In Egypt' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'كل ما تحتاجه في مكان واحد' : 'Everything You Need in One Place'}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">{isAr ? 'من إدارة المرضى إلى التقارير المالية — ClinicOS يغطي كل احتياجات عيادتك.' : 'From patient management to financial reports — ClinicOS covers all your clinic needs.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl transition-all hover:bg-white/[0.04] group" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{isAr ? f.title_ar : f.title_en}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{isAr ? f.desc_ar : f.desc_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'خطط تناسب كل العيادات' : 'Plans for Every Clinic'}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">{isAr ? 'ابدأ مجاناً واترقِ حسب احتياجاتك.' : 'Start free and upgrade as your clinic grows.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {(plans || []).map((plan: any) => {
              const limits = plan.plan_limits || []
              const maxDoctors = limits.find((l: any) => l.limit_type === 'max_doctors')?.max_value
              const maxPatients = limits.find((l: any) => l.limit_type === 'max_patients')?.max_value
              const featureNames = (plan.plan_features || []).map((pf: any) => isAr ? pf.features?.name_ar : pf.features?.name_en).filter(Boolean)
              const isPopular = plan.code === 'professional'

              return (
                <div key={plan.id} className={`relative p-6 rounded-2xl transition-all ${isPopular ? 'ring-2 ring-cyan-500/40' : ''}`} style={{ background: isPopular ? 'rgba(34,211,238,0.04)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isPopular ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500 text-[#0a0f1e]">
                      {isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}
                    </div>
                  )}
                  <div className="text-3xl mb-3">{planIcons[plan.code] || '📦'}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{isAr ? plan.name_ar : plan.name_en}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-teal-400">{plan.price_egp?.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">EGP/{plan.billing_cycle === 'monthly' ? (isAr ? 'شهرياً' : 'mo') : (isAr ? 'سنوياً' : 'yr')}</span>
                  </div>
                  {maxDoctors && <p className="text-xs text-slate-500 mb-3">{isAr ? `حتى ${maxDoctors} طبيب` : `Up to ${maxDoctors} doctors`}</p>}
                  {maxPatients && <p className="text-xs text-slate-500 mb-4">{isAr ? `حتى ${maxPatients.toLocaleString()} مريض` : `Up to ${maxPatients.toLocaleString()} patients`}</p>}
                  <div className="space-y-2 mb-6">
                    {featureNames.slice(0, 6).map((fname: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-teal-400 shrink-0" />
                        {fname}
                      </div>
                    ))}
                  </div>
                  <Link href={`/${locale}/register`} className="block w-full h-11 rounded-xl text-sm font-bold text-center transition-all" style={{ background: isPopular ? 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))' : 'rgba(255,255,255,0.06)', color: isPopular ? '#0a0f1e' : '#e2e8f0', border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                    {isAr ? 'ابدأ الآن' : 'Get Started'}
                  </Link>
                </div>
              )
            })}
          </div>
          {(!plans || plans.length === 0) && (
            <div className="text-center py-12 text-slate-500">{isAr ? 'الخطط قادمة قريباً' : 'Plans coming soon'}</div>
          )}
        </div>
      </section>

      {/* Download CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'حمّل التطبيق على أي جهاز' : 'Download on Any Device'}</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{isAr ? ' متاح على ويندوز، لينكس، ماك، وأندرويد.' : 'Available on Windows, Linux, Mac, and Android.'}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Monitor, label: 'Windows', color: 'text-blue-400', bg: 'rgba(59,130,246,0.12)' },
              { icon: Monitor, label: 'Linux', color: 'text-amber-400', bg: 'rgba(245,158,11,0.12)' },
              { icon: Apple, label: 'macOS', color: 'text-slate-300', bg: 'rgba(148,163,184,0.12)' },
              { icon: Smartphone, label: 'Android', color: 'text-green-400', bg: 'rgba(34,197,94,0.12)' },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: p.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
                <span className="text-sm font-medium text-slate-200">{p.label}</span>
              </div>
            ))}
          </div>
          <Link href={`/${locale}/download`} className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-base font-bold text-[#0a0f1e] transition-all" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 24px rgba(0,212,170,0.4)' }}>
            <Download className="w-5 h-5" />
            {isAr ? 'صفحة التحميل' : 'Download Page'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ClinicOS" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
          </div>
          <p className="text-xs text-slate-600">&copy; 2026 ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/login`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/download`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'تحميل' : 'Download'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
