import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Stethoscope, Calendar, Users, CreditCard, BarChart3, Shield, Globe,
  Download, ChevronRight, Check, Smartphone, Monitor, Apple,
  Pill, Heart, Activity, ClipboardList,
  Database, MessageCircle,
  Bed, Layers, Settings, ChevronDown, ChevronUp
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

  /* ── Content dictionaries ── */
  const hero = {
    badge: isAr ? 'النسخة 1.0 — متاحة الآن' : 'Version 1.0 — Available Now',
    title1: isAr ? 'كل شيء تحتاجه' : 'Everything you need to',
    title2: isAr ? 'لإدارة عيادتك' : 'manage your clinic',
    title3: isAr ? 'في مكان واحد' : 'in one place',
    sub: isAr
      ? 'ClinicOS هو نظام إدارة عيادات متكامل مصمم خصيصاً للسوق المصري. يغطي إدارة المرضى، المواعيد، الروشتات الإلكترونية، الفواتير، المخزون، الموارد البشرية، والتسويق — مع أكثر من 24 وحدة تخصص طبي.'
      : 'ClinicOS is a complete clinic management system built specifically for Egyptian clinics. It covers patient management, appointments, e-prescriptions, billing, inventory, HR, and marketing — with 24+ specialty modules.',
    cta1: isAr ? 'ابدأ مجاناً الآن' : 'Start Free Now',
    cta2: isAr ? 'حمّل التطبيق' : 'Download App',
    stat1val: '24+',
    stat1: isAr ? 'وحدة تخصص' : 'Specialty Modules',
    stat2val: '24/7',
    stat2: isAr ? 'متاح دائماً' : 'Always Available',
    stat3val: '#1',
    stat3: isAr ? 'في مصر' : 'In Egypt',
  }

  const features = [
    { icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',
      title: isAr ? 'إدارة المرضى' : 'Patient Management',
      desc: isAr
        ? 'ملفات مرضى شاملة مع التاريخ المرضي، السجلات السريرية، قياسات الحيوية، الصور والملفات المرفقة، وخطة العلاج. كل مريض له ملف رقمي كامل.'
        : 'Complete patient files with medical history, clinical records, vitals, attached images & files, and treatment plans. Every patient gets a full digital file.' },
    { icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      title: isAr ? 'جدولة المواعيد' : 'Smart Scheduling',
      desc: isAr
        ? 'نظام مواعيد ذكي يدعم الحجز العادي، الدخول الفوري (Walk-in)، قوائم الانتظار، التعيين التلقائي للأطباء المتاحين، وعرض التقويم الشهري.'
        : 'Smart scheduling with regular bookings, walk-in support, waitlists, auto-assign available doctors, and monthly calendar view.' },
    { icon: Stethoscope, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
      title: isAr ? '24+ وحدة تخصص طبي' : '24+ Medical Specialty Modules',
      desc: isAr
        ? 'فم الأسنان، العظام، العيون، الأمومة والولادة، الجلدية، القلب، الأعصاب، الأطفال، الباطنية، المسالك البولية، الغدد الصماء، أمراض الدم، السرطان،.general surgery, الطب العائلي، الطب النفسي، والأكثر — كل وحدة مصممة لاحتياجات التخصص.'
        : 'Dental, orthopedics, ophthalmology, OB/GYN, dermatology, cardiology, neurology, pediatrics, internal medicine, urology, endocrinology, hematology, oncology, general surgery, family medicine, psychiatry, and more — each module designed for its specialty.' },
    { icon: Pill, color: '#a855f7', bg: 'rgba(168,85,247,0.12)',
      title: isAr ? 'الروشتات الإلكترونية' : 'E-Prescriptions',
      desc: isAr
        ? 'كتابة وصفات طبية مع بحث ذكي عن الأدوية من قاعدة بيانات الأدوية المصرية، طباعتها بشكل احترافي مع شعار العيادة، أو إرسالها للعميل عبر الواتساب.'
        : 'Write prescriptions with smart drug search from the Egyptian medications database, print them professionally with your clinic logo, or send them to patients via WhatsApp.' },
    { icon: CreditCard, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
      title: isAr ? 'الفواتير والمدفوعات' : 'Billing & Payments',
      desc: isAr
        ? 'نظام فواتير متكامل مع خطط علاج، تسجيل المدفوعات (كاش أو أونلاين)، تتبع المستحقات، وتأكيد الدفع من الاستقبال. الطبيب ينهي العلاج والكاشير يتأكد.'
        : 'Complete billing with treatment plans, payment recording (cash/online), due tracking, and reception payment confirmation. Doctor completes treatment, reception confirms payment.' },
    { icon: ClipboardList, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',
      title: isAr ? 'المخزون والصيدلية' : 'Inventory & Pharmacy',
      desc: isAr
        ? 'إدارة مخزون الأدوية والمستلزمات مع تنبيهات انتهاء الصلاحية، تتبع الحركات (وارد/صادر)، وربط المخزون ب الروشتات.'
        : 'Manage medication and supplies inventory with expiry alerts, movement tracking (in/out), and inventory linking to prescriptions.' },
    { icon: Bed, color: '#ec4899', bg: 'rgba(236,72,153,0.12)',
      title: isAr ? 'الموارد البشرية والرواتب' : 'HR & Payroll',
      desc: isAr
        ? 'إدارة الموظفين مع حضور وانصراف، طلبات الإجازات، حساب الرواتب (ثابت/عمولة/مزيج)، ونظام دعوة الفريق عبر روابط.'
        : 'Staff management with attendance tracking, leave requests, payroll calculation (fixed/commission/mixed), and team invitation via links.' },
    { icon: BarChart3, color: '#14b8a6', bg: 'rgba(20,184,166,0.12)',
      title: isAr ? 'التقارير والتحليلات' : 'Reports & Analytics',
      desc: isAr ? 'لوحات تحليلية للإيرادات، إحصائيات المواعيد، أداء الأطباء، وأكثر — مع تصدير التقارير.' : 'Analytics dashboards for revenue, appointment statistics, doctor performance, and more — with report exports.' },
    { icon: MessageCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)',
      title: isAr ? 'التسويق عبر الواتساب' : 'WhatsApp Marketing',
      desc: isAr
        ? 'إرسال حملات تذكير بالمواعيد، العروض، والمتابعة — مباشرة من النظام عبر الواتساب.'
        : 'Send appointment reminders, offers, and follow-ups — directly from the system via WhatsApp.' },
    { icon: Activity, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',
      title: isAr ? 'وضع تركيز الطبيب' : 'Doctor Focus Mode',
      desc: isAr
        ? 'عرض مبسط ومركّز للموبايل — الطبيب يرى مريضه الحالي مع كل البيانات السريرية وأزرار سريعة للوصول المباشر.'
        : 'Simplified, focused mobile view — the doctor sees their current patient with all clinical data and quick-access buttons.' },
    { icon: Heart, color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
      title: isAr ? 'يومي (My Day)' : 'My Day',
      desc: isAr
        ? 'صفحة مخصصة لكل طبيب — حالة اليوم، مواعيده، تسجيل ملاحظات العمل، وملخص المدفوعات.'
        : 'Personalized page for each doctor — daily status, appointments, work notes, and payment summaries.' },
    { icon: Settings, color: '#64748b', bg: 'rgba(100,116,139,0.12)',
      title: isAr ? 'إعدادات شاملة' : 'Comprehensive Settings',
      desc: isAr
        ? 'تخصيص شكل الروشتة (A4/A5)، رفع شعار العيادة، إعداد النصوص العلوية والسفلى، وشكل العلامة المائية — مع معاينة حية.'
        : 'Customize prescription format (A4/A5), upload clinic logo, configure header/footer text, and watermark — with live preview.' },
  ]

  const howItWorks = [
    { step: '1', title: isAr ? 'سجّل عيادتك' : 'Register Your Clinic', desc: isAr ? 'إنشاء حساب مجاني في أقل من دقيقة — فقط اسم العيادة ورقم الهاتف.' : 'Create a free account in under a minute — just your clinic name and phone.' },
    { step: '2', title: isAr ? 'أضف فريقك' : 'Add Your Team', desc: isAr ? 'ادعُ الأطباء والموظفين عبر روابط مباشرة أو أضفهم كموظفين للرواتب فقط.' : 'Invite doctors and staff via direct links or add them as payroll-only employees.' },
    { step: '3', title: isAr ? 'ابدأ العمل' : 'Start Working', desc: isAr ? 'أضف المرضى، احجز المواعيد، اكتب الروشتات، وتابع الفواتير — كل شيء جاهز.' : 'Add patients, book appointments, write prescriptions, and track billing — everything is ready.' },
  ]

  const stats = [
    { icon: Layers, value: '24+', label: isAr ? 'وحدة تخصص طبي' : 'Specialty Modules' },
    { icon: Users, value: '∞', label: isAr ? 'مرضى غير محدود' : 'Unlimited Patients' },
    { icon: Shield, value: 'RLS', label: isAr ? 'أمان على مستوى الصفوف' : 'Row-Level Security' },
    { icon: Globe, value: '2', label: isAr ? 'لغة: عربي وإنجليزي' : 'Languages: AR & EN' },
    { icon: Smartphone, value: '4', label: isAr ? 'منصات: Win/Linux/Mac/Android' : 'Platforms: Win/Linux/Mac/Android' },
    { icon: Database, value: 'Supa', label: isAr ? 'مدعوم بـ Supabase + PostgreSQL' : 'Powered by Supabase + PostgreSQL' },
  ]

  const platformIcons = [
    { icon: Monitor, label: 'Windows', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { icon: Monitor, label: 'Linux', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { icon: Apple, label: 'macOS', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    { icon: Smartphone, label: 'Android', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 100%)' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15" style={{ background: 'hsl(168 100% 42%)' }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ background: 'hsl(258 60% 55%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-8" style={{ background: 'hsl(195 100% 50%)' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/[0.06]" dir={isAr ? 'rtl' : 'ltr'}>
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 20px rgba(0,212,170,0.4)' }}>
            <Image src="/logo.png" alt="ClinicOS" width={40} height={40} className="object-contain p-1" />
          </div>
          <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/${altLocale}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.06]">
            {altLabel}
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
      <section className="relative z-10 px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-32 text-center max-w-5xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: 'hsl(168 100% 52%)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(168 100% 42%)', boxShadow: '0 0 6px rgba(0,212,170,0.8)' }} />
          {hero.badge}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8">
          {hero.title1}
          <br />
          <span style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 65%) 50%, hsl(258 60% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {hero.title2}
          </span>
          <br />
          {hero.title3}
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          {hero.sub}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/${locale}/register`} className="h-12 px-8 rounded-xl text-base font-bold text-[#0a0f1e] inline-flex items-center gap-2 transition-all" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 24px rgba(0,212,170,0.4)' }}>
            {hero.cta1}
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link href={`/${locale}/download`} className="h-12 px-8 rounded-xl text-base font-medium text-slate-300 inline-flex items-center gap-2 transition-all border border-white/10 hover:bg-white/[0.05]">
            <Download className="w-5 h-5" />
            {hero.cta2}
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-20">
          {[
            { value: hero.stat1val, label: hero.stat1 },
            { value: hero.stat2val, label: hero.stat2 },
            { value: hero.stat3val, label: hero.stat3 },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Full-width Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {isAr ? 'كل ميزة تحتاجها لعيادتك' : 'Every Feature Your Clinic Needs'}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {isAr
                ? 'ClinicOS ليس مجرد برنامج مواعيد — هو نظام متكامل يغطي كل جوانب إدارة العيادة من أول يوم.'
                : 'ClinicOS is not just an appointment app — it\'s a complete system covering every aspect of clinic management from day one.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl transition-all hover:bg-white/[0.04] group" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.icon className="w-5.5 h-5.5" style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties / Clinic Types from DB */}
      {(clinicTypes ?? []).length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {isAr ? 'أكثر من ٢٠ تخصص طبي' : '20+ Medical Specialties'}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                {isAr
                  ? 'كل تخصص له وحدة مخصصة بأدوات وقوالب سريرية مناسبة.'
                  : 'Each specialty has a dedicated module with tailored tools and clinical templates.'}
              </p>
            </div>
            {(() => {
              const SHOW_INITIAL = 8
              const types = clinicTypes ?? []
              const initial = types.slice(0, SHOW_INITIAL)
              const rest = types.slice(SHOW_INITIAL)
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
              const renderCard = (ct: any, idx: number) => {
                const c = specialtyColors[idx % specialtyColors.length]
                return (
                  <div key={ct.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/[0.04]" style={{ border: `1px solid ${c.border}` }}>
                    <Stethoscope className="w-4 h-4 shrink-0" style={{ color: c.text }} />
                    <span className="text-sm font-medium text-slate-200">{isAr ? ct.name_ar : ct.name_en}</span>
                  </div>
                )
              }
              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {initial.map((ct, i) => renderCard(ct, i))}
                  </div>
                  {rest.length > 0 && (
                    <details className="group mt-4">
                      <summary className="flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer text-sm font-medium text-teal-400 hover:bg-white/[0.04] transition-all" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="group-open:hidden">{isAr ? `عرض جميع التخصصات (${types.length})` : `Show all specialties (${types.length})`}</span>
                        <span className="hidden group-open:inline">{isAr ? 'عرض أقل' : 'Show less'}</span>
                        <ChevronDown className="w-4 h-4 group-open:hidden" />
                        <ChevronUp className="w-4 h-4 hidden group-open:inline" />
                      </summary>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                        {rest.map((ct, i) => renderCard(ct, i + SHOW_INITIAL))}
                      </div>
                    </details>
                  )}
                </>
              )
            })()}
          </div>
        </section>
      )}

      {/* Tech Specs / Stats */}
      <section className="relative z-10 px-6 lg:px-12 py-16" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-8 lg:p-12" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {isAr ? 'مدعوم بأحدث التقنيات' : 'Powered by Modern Technology'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.08)' }}>
                    <s.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {isAr ? 'كيف تبدأ؟' : 'How to Get Started?'}
            </h2>
            <p className="text-slate-400">{isAr ? 'ثلاث خطوات بسيطة' : 'Three simple steps'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl font-bold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', color: '#0a0f1e' }}>
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Online Plans */}
      {onlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {isAr ? 'خطط السحابية' : 'Cloud Plans'}
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                {isAr ? 'ابدأ مجاناً واترقِ حسب احتياجاتك. بدون بطاقة ائتمان.' : 'Start free and upgrade as you grow. No credit card required.'}
              </p>
            </div>
            <div className={`grid gap-6 max-w-6xl mx-auto ${onlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-4xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {onlinePlans.map((plan, idx) => {
                const popular = idx === Math.floor(onlinePlans.length / 2)
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const featureNames = (plan.plan_features ?? [])
                  .map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en'])
                  .filter(Boolean)
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0
                  ? (isAr ? 'مجاني' : 'Free')
                  : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly'
                  ? (isAr ? '/شهرياً' : '/mo')
                  : (isAr ? '/سنوياً' : '/yr')
                return (
                  <div key={plan.code} className={`relative p-6 rounded-2xl transition-all ${popular ? 'ring-2 ring-cyan-500/40' : ''}`} style={{ background: popular ? 'rgba(34,211,238,0.04)' : 'rgba(255,255,255,0.03)', border: `1px solid ${popular ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    {popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500 text-[#0a0f1e]">
                        {isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-1">{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-teal-400">{formattedPrice}</span>
                      {priceNum > 0 && <span className="text-sm text-slate-500">EGP{cycleLabel}</span>}
                      {priceNum === 0 && <span className="text-sm text-slate-500">{isAr ? ' للأبد' : 'forever'}</span>}
                    </div>
                    {seats && <p className="text-xs text-slate-500 mb-1">{isAr ? `حتى ${seats} أطباء` : `Up to ${seats} doctors`}</p>}
                    {patients && <p className="text-xs text-slate-500 mb-4">{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                    <div className="space-y-2 mb-6">
                      {featureNames.map((fname: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-teal-400 shrink-0" />
                          {fname}
                        </div>
                      ))}
                    </div>
                    <Link href={`/${locale}/register`} className="block w-full h-11 rounded-xl text-sm font-bold text-center transition-all" style={{ background: popular ? 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))' : 'rgba(255,255,255,0.06)', color: popular ? '#0a0f1e' : '#e2e8f0', border: popular ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                      {isAr ? 'ابدأ الآن' : 'Get Started'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pricing — Self-Hosted / Offline Plans */}
      {offlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {isAr ? 'خطط التثبيت المحلي' : 'Self-Hosted Plans'}
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                {isAr ? 'للعيادات التي تفضل تشغيل النظام على خوادمها الخاصة.' : 'For clinics that prefer to run the system on their own servers.'}
              </p>
            </div>
            <div className={`grid gap-6 max-w-6xl mx-auto ${offlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-4xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {offlinePlans.map((plan) => {
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const staff = plan.plan_limits?.find((l: any) => l.limit_type === 'staff_accounts')?.max_value
                const featureNames = (plan.plan_features ?? [])
                  .map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en'])
                  .filter(Boolean)
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0
                  ? (isAr ? 'مجاني' : 'Free')
                  : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly'
                  ? (isAr ? '/شهرياً' : '/mo')
                  : (isAr ? '/سنوياً' : '/yr')
                return (
                  <div key={plan.code} className="relative p-6 rounded-2xl transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-lg font-bold text-white mb-1">{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-teal-400">{formattedPrice}</span>
                      {priceNum > 0 && <span className="text-sm text-slate-500">EGP{cycleLabel}</span>}
                    </div>
                    {seats && <p className="text-xs text-slate-500 mb-1">{isAr ? `${seats} أطباء` : `${seats} doctors`}</p>}
                    {patients && <p className="text-xs text-slate-500 mb-1">{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                    {staff && <p className="text-xs text-slate-500 mb-4">{isAr ? `${staff} موظفين` : `${staff} staff`}</p>}
                    <div className="space-y-2 mb-6">
                      {featureNames.map((fname: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-teal-400 shrink-0" />
                          {fname}
                        </div>
                      ))}
                    </div>
                    <Link href={`/${locale}/register`} className="block w-full h-11 rounded-xl text-sm font-bold text-center transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {isAr ? 'تواصل معنا' : 'Contact Us'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Download CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {isAr ? 'حمّل التطبيق على أي جهاز' : 'Download on Any Device'}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {isAr ? 'متاح على ويندوز، لينكس، ماك، وأندرويد — مجاناً.' : 'Available on Windows, Linux, Mac, and Android — free.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {platformIcons.map(p => (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: p.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
                <p.icon className="w-5 h-5" style={{ color: p.color }} />
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
      <footer className="relative z-10 px-6 lg:px-12 py-10 border-t border-white/[0.06]" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="ClinicOS" width={24} height={24} className="object-contain" />
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
          </div>
          <p className="text-xs text-slate-600">&copy; 2026 ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <Link href={`/${altLocale}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'English' : 'عربي'}</Link>
            <Link href={`/${locale}/login`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/download`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'تحميل' : 'Download'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
