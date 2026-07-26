import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Stethoscope, Calendar, Users, CreditCard, BarChart3,
  Download, ChevronRight, Check, Smartphone, Monitor, Apple,
  Pill, Heart, Activity, ClipboardList,
  MessageCircle, Bed, Settings, ChevronDown, ChevronUp, Zap
} from 'lucide-react'

export default async function LandingPage({ params: { locale } }: { params: { locale: string } }) {
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

  const { data: clinicTypes } = await supabase
    .from('clinic_types')
    .select('id, name_en, name_ar, code')
    .eq('is_active', true)
    .order('name_en', { ascending: true })

  const features = [
    { icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', title: isAr ? 'إدارة المرضى' : 'Patient Management', desc: isAr ? 'ملفات مرضى شاملة مع التاريخ المرضي، السجلات السريرية، قياسات الحيوية، والصور والملفات المرفقة.' : 'Complete patient files with medical history, clinical records, vitals, and attached images & files.' },
    { icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.12)', title: isAr ? 'جدولة المواعيد' : 'Smart Scheduling', desc: isAr ? 'نظام مواعيد ذكي يدعم الحجز العادي، الدخول الفوري، قوائم الانتظار، والتعيين التلقائي للأطباء.' : 'Smart scheduling with regular bookings, walk-in support, waitlists, and auto-assign doctors.' },
    { icon: Stethoscope, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', title: isAr ? '24+ وحدة تخصص طبي' : '24+ Specialty Modules', desc: isAr ? 'فم الأسنان، العظام، العيون، الأمومة، الجلدية، القلب، الأعصاب، الأطفال، الباطنية، والمزيد.' : 'Dental, orthopedics, ophthalmology, OB/GYN, dermatology, cardiology, neurology, pediatrics, and more.' },
    { icon: Pill, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: isAr ? 'الروشتات الإلكترونية' : 'E-Prescriptions', desc: isAr ? 'كتابة وصفات مع بحث ذكي عن الأدوية من قاعدة البيانات المصرية، طباعة احترافية أو إرسال بالواتساب.' : 'Prescriptions with smart drug search from the Egyptian medications database, print or send via WhatsApp.' },
    { icon: CreditCard, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: isAr ? 'الفواتير والمدفوعات' : 'Billing & Payments', desc: isAr ? 'نظام فواتير متكامل مع خطط علاج، تسجيل المدفوعات، تتبع المستحقات، وتأكيد الدفع من الاستقبال.' : 'Complete billing with treatment plans, payment recording, due tracking, and reception confirmation.' },
    { icon: ClipboardList, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', title: isAr ? 'المخزون والصيدلية' : 'Inventory & Pharmacy', desc: isAr ? 'إدارة مخزون الأدوية والمستلزمات مع تنبيهات انتهاء الصلاحية، تتبع الحركات، وربط المخزون بالروشتات.' : 'Medication and supplies inventory with expiry alerts, movement tracking, and prescription linking.' },
    { icon: Bed, color: '#ec4899', bg: 'rgba(236,72,153,0.12)', title: isAr ? 'الموارد البشرية والرواتب' : 'HR & Payroll', desc: isAr ? 'إدارة الموظفين مع حضور وانصراف، طلبات الإجازات، حساب الرواتب، ونظام دعوة الفريق.' : 'Staff management with attendance, leave requests, payroll calculation, and team invitations.' },
    { icon: MessageCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', title: isAr ? 'التسويق عبر الواتساب' : 'WhatsApp Marketing', desc: isAr ? 'إرسال حملات تذكير بالمواعيد، العروض، والمتابعة — مباشرة من النظام عبر الواتساب.' : 'Send appointment reminders, offers, and follow-ups directly from the system via WhatsApp.' },
    { icon: BarChart3, color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', title: isAr ? 'التقارير والتحليلات' : 'Reports & Analytics', desc: isAr ? 'لوحات تحليلية للإيرادات، إحصائيات المواعيد، أداء الأطباء، وأكثر — مع تصدير التقارير.' : 'Analytics dashboards for revenue, appointment statistics, doctor performance, and more.' },
    { icon: Activity, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', title: isAr ? 'وضع تركيز الطبيب' : 'Doctor Focus Mode', desc: isAr ? 'عرض مبسط ومركّز للموبايل — الطبيب يرى مريضه الحالي مع كل البيانات السريرية.' : 'Simplified focused mobile view — the doctor sees their current patient with all clinical data.' },
    { icon: Heart, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', title: isAr ? 'يومي (My Day)' : 'My Day', desc: isAr ? 'صفحة مخصصة لكل طبيب — حالة اليوم، مواعيده، تسجيل ملاحظات العمل، وملخص المدفوعات.' : 'Personalized page for each doctor — daily status, appointments, work notes, and payment summaries.' },
    { icon: Settings, color: '#64748b', bg: 'rgba(100,116,139,0.12)', title: isAr ? 'إعدادات شاملة' : 'Comprehensive Settings', desc: isAr ? 'تخصيص شكل الروشتة، رفع شعار العيادة، إعداد النصوص، والعلامة المائية — مع معاينة حية.' : 'Customize prescription format, upload clinic logo, configure text, and watermark — with live preview.' },
  ]

  const howItWorks = [
    { step: '1', title: isAr ? 'سجّل عيادتك' : 'Register Your Clinic', desc: isAr ? 'إنشاء حساب مجاني في أقل من دقيقة — فقط اسم العيادة ورقم الهاتف.' : 'Create a free account in under a minute — just your clinic name and phone.' },
    { step: '2', title: isAr ? 'أضف فريقك' : 'Add Your Team', desc: isAr ? 'ادعُ الأطباء والموظفين عبر روابط مباشرة أو أضفهم كموظفين للرواتب فقط.' : 'Invite doctors and staff via direct links or add them as payroll-only employees.' },
    { step: '3', title: isAr ? 'ابدأ العمل' : 'Start Working', desc: isAr ? 'أضف المرضى، احجز المواعيد، اكتب الروشتات، وتابع الفواتير — كل شيء جاهز.' : 'Add patients, book appointments, write prescriptions, and track billing — everything is ready.' },
  ]

  const techStack = ['Next.js', 'Supabase', 'Tailwind', 'TypeScript', 'PostgreSQL', 'PWA']

  const specialtyColors = [
    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#34d399' },
    { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#a78bfa' },
    { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)', text: '#f472b6' },
    { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
    { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', text: '#22d3ee' },
    { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)', text: '#fb7185' },
    { bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.2)', text: '#2dd4bf' },
  ]

  const platformIcons = [
    { icon: Monitor, label: 'Windows', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { icon: Monitor, label: 'Linux', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { icon: Apple, label: 'macOS', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    { icon: Smartphone, label: 'Android', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[180px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/8 blur-[150px]" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/6 blur-[140px]" />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/[0.06]" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
              <Image src="/logo.png" alt="ClinicOS" width={40} height={40} className="object-contain p-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ClinicOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href={`/${locale}/pricing`} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'الأسعار' : 'Pricing'}</Link>
            <Link href={`/${locale}/download`} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'التحميل' : 'Download'}</Link>
            <Link href={`/${locale}/contact`} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'تواصل معنا' : 'Contact'}</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${altLocale}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.08]">{altLabel}</Link>
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/register`} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-24 lg:pt-32 lg:pb-36 text-center max-w-5xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {isAr ? 'النسخة 1.0 — متاحة الآن' : 'Version 1.0 — Available Now'}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
          {isAr ? 'نظام التشغيل المتكامل' : 'The Complete Clinic'}{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            {isAr ? 'للعيادات' : 'Operating System'}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          {isAr
            ? 'مصمم خصيصاً للعيادات المصرية — أكثر من 24 تخصص طبي، إدارة متكاملة، وأمان على مستوى المؤسسات.'
            : 'Built specifically for Egyptian clinics — 24+ medical specialties, complete management, and enterprise-grade security.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href={`/${locale}/register`} className="h-13 px-8 rounded-xl text-base font-bold text-slate-900 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
            {isAr ? 'ابدأ تجربة مجانية' : 'Start Free Trial'}<ChevronRight className="w-5 h-5" />
          </Link>
          <Link href={`/${locale}/download`} className="h-13 px-8 rounded-xl text-base font-medium text-slate-300 inline-flex items-center gap-2 border border-white/10 hover:bg-white/[0.05] transition-all">
            <Download className="w-5 h-5" />{isAr ? 'حمّل التطبيق' : 'Download App'}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { val: '24+', label: isAr ? 'وحدة تخصص' : 'Modules' },
            { val: '24/7', label: isAr ? 'متاح دائماً' : 'Available' },
            { val: '#1', label: isAr ? 'في مصر' : 'In Egypt' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{s.val}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Tech Stack / Social Proof ─── */}
      <section className="relative z-10 px-6 lg:px-12 py-12" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase text-slate-500 bg-white/[0.03] border border-white/[0.06] mb-6">
            <Zap className="w-3 h-3" />{isAr ? 'مبنية بأحدث التقنيات' : 'Built with Modern Tech'}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map(tech => (
              <div key={tech} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">{tech}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'كل ميزة تحتاجها لعيادتك' : 'Everything Your Clinic Needs'}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">{isAr ? 'ClinicOS ليس مجرد برنامج مواعيد — هو نظام متكامل يغطي كل جوانب إدارة العيادة.' : 'ClinicOS is not just an appointment app — it\'s a complete system covering every aspect of clinic management.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specialties ─── */}
      {(clinicTypes ?? []).length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'أكثر من ٢٠ تخصص طبي' : '20+ Medical Specialties'}</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">{isAr ? 'كل تخصص له وحدة مخصصة بأدوات وقوالب سريرية مناسبة.' : 'Each specialty has a dedicated module with tailored tools and clinical templates.'}</p>
            </div>
            {(() => {
              const types = clinicTypes ?? []
              const initial = types.slice(0, 8)
              const rest = types.slice(8)
              return (
                <>
                  <div className="flex flex-wrap justify-center gap-3">
                    {initial.map((ct, i) => {
                      const c = specialtyColors[i % specialtyColors.length]
                      return (
                        <div key={ct.id} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-slate-200 hover:bg-white/[0.04] transition-all" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                          <Stethoscope className="w-3.5 h-3.5 shrink-0" style={{ color: c.text }} />
                          {isAr ? ct.name_ar : ct.name_en}
                        </div>
                      )
                    })}
                  </div>
                  {rest.length > 0 && (
                    <details className="group mt-4">
                      <summary className="flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer text-sm font-medium text-emerald-400 hover:bg-white/[0.04] transition-all border border-white/[0.06]">
                        <span className="group-open:hidden">{isAr ? `عرض جميع التخصصات (${types.length})` : `Show all specialties (${types.length})`}</span>
                        <span className="hidden group-open:inline">{isAr ? 'عرض أقل' : 'Show less'}</span>
                        <ChevronDown className="w-4 h-4 group-open:hidden" /><ChevronUp className="w-4 h-4 hidden group-open:inline" />
                      </summary>
                      <div className="flex flex-wrap justify-center gap-3 mt-3">
                        {rest.map((ct, i) => {
                          const c = specialtyColors[(i + 8) % specialtyColors.length]
                          return (
                            <div key={ct.id} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-slate-200 hover:bg-white/[0.04] transition-all" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                              <Stethoscope className="w-3.5 h-3.5 shrink-0" style={{ color: c.text }} />
                              {isAr ? ct.name_ar : ct.name_en}
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  )}
                </>
              )
            })()}
          </div>
        </section>
      )}

      {/* ─── How It Works ─── */}
      <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'كيف تبدأ؟' : 'How It Works'}</h2>
            <p className="text-slate-400">{isAr ? 'ثلاث خطوات بسيطة' : 'Three simple steps'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-900 shadow-lg shadow-emerald-500/20">{step.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing: Cloud Plans ─── */}
      {onlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'خطط السحابية' : 'Cloud Plans'}</h2>
              <p className="text-slate-400 max-w-xl mx-auto">{isAr ? 'ابدأ مجاناً واترقِ حسب احتياجاتك. بدون بطاقة ائتمان.' : 'Start free and upgrade as you grow. No credit card required.'}</p>
            </div>
            <div className={`grid gap-6 ${onlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'}`}>
              {onlinePlans.map((plan, idx) => {
                const popular = idx === Math.floor(onlinePlans.length / 2)
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const featureNames = (plan.plan_features ?? []).map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean)
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهرياً' : '/mo') : (isAr ? '/سنوياً' : '/yr')
                return (
                  <div key={plan.code} className={`relative p-6 rounded-2xl transition-all ${popular ? 'ring-2 ring-emerald-500/40 bg-emerald-500/[0.04]' : 'bg-white/[0.02]'}`} style={{ border: `1px solid ${popular ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                    {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900">{isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}</div>}
                    <h3 className="text-xl font-bold text-white mb-1">{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-emerald-400">{formattedPrice}</span>
                      {priceNum > 0 && <span className="text-sm text-slate-500">EGP{cycleLabel}</span>}
                      {priceNum === 0 && <span className="text-sm text-slate-500">{isAr ? ' للأبد' : ' forever'}</span>}
                    </div>
                    {seats && <p className="text-xs text-slate-500 mb-1">{isAr ? `حتى ${seats} أطباء` : `Up to ${seats} doctors`}</p>}
                    {patients && <p className="text-xs text-slate-500 mb-4">{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                    <div className="space-y-2 mb-6">
                      {featureNames.map((fname: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" />{fname}</div>
                      ))}
                    </div>
                    <Link href={`/${locale}/register`} className={`block w-full h-11 rounded-xl text-sm font-bold text-center transition-all ${popular ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900' : 'bg-white/[0.06] text-slate-200 border border-white/10 hover:bg-white/[0.1]'}`}>
                      {isAr ? 'ابدأ الآن' : 'Get Started'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing: Self-Hosted ─── */}
      {offlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'خطط التثبيت المحلي' : 'Self-Hosted Plans'}</h2>
              <p className="text-slate-400 max-w-xl mx-auto">{isAr ? 'للعيادات التي تفضل تشغيل النظام على خوادمها الخاصة.' : 'For clinics that prefer to run the system on their own servers.'}</p>
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
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-emerald-400">{formattedPrice}</span>
                      {priceNum > 0 && <span className="text-sm text-slate-500">EGP{cycleLabel}</span>}
                    </div>
                    {seats && <p className="text-xs text-slate-500 mb-1">{isAr ? `${seats} أطباء` : `${seats} doctors`}</p>}
                    {patients && <p className="text-xs text-slate-500 mb-1">{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                    {staff && <p className="text-xs text-slate-500 mb-4">{isAr ? `${staff} موظفين` : `${staff} staff`}</p>}
                    <div className="space-y-2 mb-6">
                      {featureNames.map((fname: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" />{fname}</div>
                      ))}
                    </div>
                    <Link href={`/${locale}/register`} className="block w-full h-11 rounded-xl text-sm font-bold text-center bg-white/[0.06] text-slate-200 border border-white/10 hover:bg-white/[0.1] transition-all">{isAr ? 'تواصل معنا' : 'Contact Us'}</Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Download CTA ─── */}
      <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-white/[0.02] border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.06)]">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'حمّل التطبيق على أي جهاز' : 'Download on Any Device'}</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{isAr ? 'متاح على ويندوز، لينكس، ماك، وأندرويد — مجاناً.' : 'Available on Windows, Linux, Mac, and Android — free.'}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {platformIcons.map(p => (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p.icon className="w-5 h-5" style={{ color: p.color }} />
                <span className="text-sm font-medium text-slate-200">{p.label}</span>
              </div>
            ))}
          </div>
          <Link href={`/${locale}/download`} className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-base font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
            <Download className="w-5 h-5" />{isAr ? 'صفحة التحميل' : 'Download Page'}
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
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
                <li><Link href={`/${locale}/pricing`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'الأسعار والباقات' : 'Pricing & Plans'}</Link></li>
                <li><Link href={`/${locale}/download`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'تحميل التطبيق' : 'Download App'}</Link></li>
                <li><Link href={`/${locale}/contact`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'تواصل معنا' : 'Contact Us'}</Link></li>
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
                <li><Link href={`/${locale}/register`} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{isAr ? 'إنشاء حساب مجاني' : 'Create Free Account'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">&copy; 2026 ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-4">
              <Link href={`/${altLocale}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'English' : 'عربي'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
