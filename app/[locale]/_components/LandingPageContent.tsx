'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Stethoscope, Calendar, Users, CreditCard, BarChart3,
  Download, ChevronRight, Check, Smartphone, Monitor, Apple,
  Pill, Heart, Activity, ClipboardList,
  MessageCircle, Bed, Settings, ChevronDown, ChevronUp, Zap,
  Shield, ArrowRight, Star, Globe, Lock, Cpu
} from 'lucide-react'

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

type ClinicType = {
  id: string
  name_en: string
  name_ar: string
  code: string
}

export default function LandingPageContent({
  locale,
  onlinePlans,
  offlinePlans,
  clinicTypes
}: {
  locale: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onlinePlans: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offlinePlans: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clinicTypes: any[]
}) {
  const isAr = locale === 'ar'
  const altLocale = isAr ? 'en' : 'ar'
  const altLabel = isAr ? 'EN' : 'عربي'

  const [showAllSpecialties, setShowAllSpecialties] = useState(false)

  const features = [
    { icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', title: isAr ? 'إدارة المرضى' : 'Patient Management', desc: isAr ? 'ملفات مرضى شاملة مع التاريخ المرضي والسجلات السريرية والصور.' : 'Complete patient files with medical history, clinical records, and attachments.' },
    { icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.12)', title: isAr ? 'جدولة المواعيد' : 'Smart Scheduling', desc: isAr ? 'نظام مواعيد ذكي يدعم الحجز والدخول الفوري وقوائم الانتظار.' : 'Smart scheduling with regular bookings, walk-in support, and waitlists.' },
    { icon: Stethoscope, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', title: isAr ? '24+ وحدة تخصص طبي' : '24+ Specialty Modules', desc: isAr ? 'الأسنان، العظام، العيون، الأمومة، الجلدية، القلب، الأعصاب، والمزيد.' : 'Dental, ortho, ophthalmology, OB/GYN, dermatology, cardiology, and more.' },
    { icon: Pill, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: isAr ? 'الروشتات الإلكترونية' : 'E-Prescriptions', desc: isAr ? 'وصفات ذكية مع البحث في قاعدة الأدوية المصرية وإرسالها بالواتساب.' : 'Smart prescriptions with Egyptian drug database search and WhatsApp delivery.' },
    { icon: CreditCard, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: isAr ? 'الفواتير والمدفوعات' : 'Billing & Payments', desc: isAr ? 'نظام فواتير متكامل مع تتبع المدفوعات والمستحقات والتقسيط.' : 'Complete billing with payment tracking, dues, and installment plans.' },
    { icon: ClipboardList, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', title: isAr ? 'المخزون والصيدلية' : 'Inventory & Pharmacy', desc: isAr ? 'إدارة مخزون الأدوية مع تنبيهات انتهاء الصلاحية وربطه بالروشتات.' : 'Medication inventory with expiry alerts and prescription linking.' },
    { icon: Bed, color: '#ec4899', bg: 'rgba(236,72,153,0.12)', title: isAr ? 'الموارد البشرية والرواتب' : 'HR & Payroll', desc: isAr ? 'إدارة الموظفين مع الحضور والإجازات وحساب الرواتب.' : 'Staff management with attendance, leave requests, and payroll calculation.' },
    { icon: MessageCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', title: isAr ? 'التسويق عبر الواتساب' : 'WhatsApp Marketing', desc: isAr ? 'حملات تذكير بالمواعيد والعروض مباشرة من النظام.' : 'Appointment reminders and offers directly from the system via WhatsApp.' },
    { icon: BarChart3, color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', title: isAr ? 'التقارير والتحليلات' : 'Reports & Analytics', desc: isAr ? 'لوحات تحليلية للإيرادات وإحصائيات المواعيد وأداء الأطباء.' : 'Revenue analytics, appointment statistics, and doctor performance dashboards.' },
    { icon: Activity, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', title: isAr ? 'وضع تركيز الطبيب' : 'Doctor Focus Mode', desc: isAr ? 'عرض مبسط للموبايل — الطبيب يرى مريضه الحالي مع كل البيانات السريرية.' : 'Simplified mobile view — doctor sees current patient with all clinical data.' },
    { icon: Heart, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', title: isAr ? 'يومي (My Day)' : 'My Day', desc: isAr ? 'صفحة مخصصة لكل طبيب — حالة اليوم ومواعيده وملخص المدفوعات.' : 'Personalized page for each doctor — daily status, appointments, and payment summaries.' },
    { icon: Settings, color: '#64748b', bg: 'rgba(100,116,139,0.12)', title: isAr ? 'إعدادات شاملة' : 'Comprehensive Settings', desc: isAr ? 'تخصيص شكل الروشتة ورفع شعار العيادة مع معاينة حية.' : 'Customize prescription format, upload clinic logo, with live preview.' },
  ]

  const howItWorks = [
    { step: '01', icon: Globe, title: isAr ? 'سجّل عيادتك' : 'Register Your Clinic', desc: isAr ? 'إنشاء حساب مجاني في أقل من دقيقة — فقط اسم العيادة ورقم الهاتف.' : 'Create a free account in under a minute — just your clinic name and phone.' },
    { step: '02', icon: Users, title: isAr ? 'أضف فريقك' : 'Add Your Team', desc: isAr ? 'ادعُ الأطباء والموظفين عبر روابط مباشرة أو أضفهم كموظفين للرواتب.' : 'Invite doctors and staff via direct links or add them as payroll-only employees.' },
    { step: '03', icon: Zap, title: isAr ? 'ابدأ العمل' : 'Start Working', desc: isAr ? 'أضف المرضى، احجز المواعيد، اكتب الروشتات، وتابع الفواتير — كل شيء جاهز.' : 'Add patients, book appointments, write prescriptions, track billing — everything ready.' },
  ]

  const techStack = [
    { name: 'Next.js 14', icon: Cpu },
    { name: 'Supabase', icon: Shield },
    { name: 'TypeScript', icon: Lock },
    { name: 'PostgreSQL', icon: BarChart3 },
    { name: 'PWA', icon: Smartphone },
    { name: 'Tailwind CSS', icon: Star },
  ]

  const specialtyColors = [
    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#34d399' },
    { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
    { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', text: '#f472b6' },
    { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
    { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)', text: '#22d3ee' },
    { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)', text: '#fb7185' },
    { bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.25)', text: '#2dd4bf' },
  ]

  const platformIcons = [
    { icon: Monitor, label: 'Windows', color: '#3b82f6' },
    { icon: Monitor, label: 'Linux', color: '#f59e0b' },
    { icon: Apple, label: 'macOS', color: '#94a3b8' },
    { icon: Smartphone, label: 'Android', color: '#22c55e' },
  ]

  const visibleSpecialties = showAllSpecialties ? clinicTypes : clinicTypes.slice(0, 12)

  return (
    <div
      className="min-h-screen text-white font-sans"
      style={{ backgroundColor: '#060b14' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ── Ambient BG ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '-15%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '20%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(6,11,20,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.3)',
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
              { href: `/${locale}/pricing`, label: isAr ? 'الأسعار' : 'Pricing' },
              { href: `/${locale}/download`, label: isAr ? 'التحميل' : 'Download' },
              { href: `/${locale}/contact`, label: isAr ? 'تواصل معنا' : 'Contact' },
            ].map(nav => (
              <Link key={nav.href} href={nav.href} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: '#94a3b8', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; (e.target as HTMLElement).style.backgroundColor = 'transparent' }}
              >{nav.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/${altLocale}`} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: '#64748b', border: '1px solid rgba(255,255,255,0.08)',
            }}>{altLabel}</Link>
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#94a3b8',
            }}>{isAr ? 'دخول' : 'Sign In'}</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/${locale}/register`} style={{
                padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                color: '#030712', display: 'inline-block',
                background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                boxShadow: '0 4px 15px rgba(16,185,129,0.35)',
              }}>{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-6 lg:px-12 pt-28 pb-32 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-10" style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399',
          }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            {isAr ? 'النسخة 1.0 — متاحة الآن' : 'Version 1.0 — Available Now'}
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900,
            lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            {isAr ? 'نظام التشغيل المتكامل' : 'The Complete Clinic'}
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {isAr ? 'للعيادات المصرية' : 'Operating System'}
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.8, fontWeight: 300 }}>
            {isAr
              ? 'مصمم خصيصاً للعيادات المصرية — أكثر من 24 تخصص طبي، إدارة متكاملة، وأمان على مستوى المؤسسات.'
              : 'Built specifically for Egyptian clinics — 24+ medical specialties, complete management, and enterprise-grade security.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href={`/${locale}/register`} style={{
                height: 56, padding: '0 36px', borderRadius: 14, fontSize: 16, fontWeight: 700,
                color: '#030712', display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                boxShadow: '0 8px 30px rgba(16,185,129,0.35)',
              }}>
                {isAr ? 'ابدأ تجربة مجانية' : 'Start Free Trial'}
                <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href={`/${locale}/download`} style={{
                height: 56, padding: '0 36px', borderRadius: 14, fontSize: 16, fontWeight: 500,
                color: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}>
                <Download className="w-5 h-5" />
                {isAr ? 'حمّل التطبيق' : 'Download App'}
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'inline-grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            padding: '24px 40px', borderRadius: 20,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
          }}>
            {[
              { val: '24+', label: isAr ? 'وحدة تخصص' : 'Modules' },
              { val: '24/7', label: isAr ? 'متاح دائماً' : 'Available' },
              { val: '#1', label: isAr ? 'في مصر' : 'In Egypt' },
            ].map((s, idx) => (
              <div key={idx} className="text-center px-10" style={{
                borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                ...(isAr ? { borderRight: 'none', borderLeft: idx < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' } : {})
              }}>
                <div style={{
                  fontSize: 32, fontWeight: 900,
                  background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: 4,
                }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="relative z-10 px-6 lg:px-12 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-10" style={{ color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Zap className="w-3 h-3" style={{ color: '#34d399' }} />
            {isAr ? 'مبنية بأحدث التقنيات' : 'Built with Modern Tech'}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map(tech => (
              <div key={tech.name} className="flex items-center gap-2" style={{
                padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <tech.icon className="w-4 h-4" style={{ color: '#34d399' }} />
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 lg:px-12 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              {isAr ? 'كل ميزة تحتاجها لعيادتك' : 'Everything Your Clinic Needs'}
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
              {isAr
                ? 'ClinicOS ليس مجرد برنامج مواعيد — هو نظام متكامل يغطي كل جوانب إدارة العيادة.'
                : "ClinicOS isn't just an appointment app — it's a complete system covering every clinic aspect."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: 28, borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'default', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                  background: `radial-gradient(circle at top right, ${f.bg}, transparent)`,
                  borderRadius: '0 20px 0 80px',
                }} />
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: f.bg, marginBottom: 20,
                }}>
                  <f.icon style={{ width: 26, height: 26, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      {clinicTypes.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-24" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
                {isAr ? 'أكثر من ٢٠ تخصص طبي' : '20+ Medical Specialties'}
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
                {isAr ? 'كل تخصص له وحدة مخصصة بأدوات وقوالب سريرية مناسبة.' : 'Each specialty has a dedicated module with tailored clinical tools.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {visibleSpecialties.map((ct, i) => {
                const c = specialtyColors[i % specialtyColors.length]
                return (
                  <motion.div
                    key={ct.id}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 20px', borderRadius: 50,
                      fontSize: 14, fontWeight: 600, color: '#e2e8f0',
                      background: c.bg, border: `1px solid ${c.border}`,
                      cursor: 'default',
                    }}
                  >
                    <Stethoscope style={{ width: 15, height: 15, color: c.text, flexShrink: 0 }} />
                    {isAr ? ct.name_ar : ct.name_en}
                  </motion.div>
                )
              })}
            </div>
            {clinicTypes.length > 12 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                    color: '#34d399', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  {!showAllSpecialties
                    ? (isAr ? `عرض جميع التخصصات (${clinicTypes.length})` : `Show all (${clinicTypes.length})`)
                    : (isAr ? 'عرض أقل' : 'Show less')}
                  {!showAllSpecialties ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-6 lg:px-12 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
              {isAr ? 'كيف تبدأ؟' : 'How It Works'}
            </h2>
            <p style={{ fontSize: 16, color: '#64748b' }}>
              {isAr ? 'ثلاث خطوات بسيطة لبدء إدارة عيادتك.' : 'Three simple steps to start managing your clinic.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)' }} />
            {howItWorks.map((step, i) => (
              <div key={i} className="text-center relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(6,11,20,1)',
                    border: '2px solid rgba(16,185,129,0.3)',
                    boxShadow: '0 0 30px rgba(16,185,129,0.12)',
                    fontSize: 22, fontWeight: 900, color: '#34d399',
                  }}
                >
                  {step.step}
                </motion.div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                  <step.icon style={{ width: 20, height: 20, color: '#34d399' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOUD PRICING ── */}
      {onlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-28" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ color: '#34d399', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                {isAr ? 'باقات سحابية' : 'Cloud Plans'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
                {isAr ? 'ابدأ مجاناً، ارتقِ حسب نموك' : 'Start Free, Scale as You Grow'}
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
                {isAr ? 'بدون بطاقة ائتمان. بدون عقود. إلغاء في أي وقت.' : 'No credit card. No contracts. Cancel anytime.'}
              </p>
            </div>
            <div className={`grid gap-6 ${onlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {onlinePlans.map((plan, idx) => {
                const popular = idx === Math.floor(onlinePlans.length / 2)
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const featureNames = (plan.plan_features ?? []).map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean) as string[]
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهر' : '/mo') : (isAr ? '/سنة' : '/yr')
                return (
                  <motion.div
                    key={plan.code}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: 28, borderRadius: 20, display: 'flex', flexDirection: 'column',
                      position: 'relative', overflow: 'hidden',
                      background: popular
                        ? 'linear-gradient(160deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${popular ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: popular ? '0 0 50px rgba(16,185,129,0.1)' : 'none',
                      transform: popular ? 'scale(1.03)' : 'scale(1)',
                    }}
                  >
                    {popular && (
                      <div style={{
                        position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                        padding: '6px 20px', borderRadius: '0 0 12px 12px', fontSize: 11, fontWeight: 800,
                        background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                        color: '#030712', letterSpacing: '0.08em',
                      }}>{isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}</div>
                    )}
                    <div style={{ marginTop: popular ? 20 : 0, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{isAr ? plan.name_ar : plan.name_en}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                      <span style={{
                        fontSize: 40, fontWeight: 900,
                        background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>{formattedPrice}</span>
                      {priceNum > 0 && <span style={{ fontSize: 13, color: '#475569' }}>EGP{cycleLabel}</span>}
                      {priceNum === 0 && <span style={{ fontSize: 13, color: '#475569' }}>{isAr ? ' للأبد' : ' forever'}</span>}
                    </div>
                    <div style={{ flex: 1, marginBottom: 24 }}>
                      {seats && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{isAr ? `حتى ${seats} أطباء` : `Up to ${seats} doctors`}</p>}
                      {patients && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {featureNames.map((fname, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                            <Check style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0, marginTop: 1 }} />
                            <span>{fname}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href={`/${locale}/register`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        height: 48, borderRadius: 12, fontSize: 14, fontWeight: 700, width: '100%',
                        ...(popular ? {
                          background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                          color: '#030712', boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                        } : {
                          background: 'rgba(255,255,255,0.05)',
                          color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)',
                        }),
                      }}>
                        {isAr ? 'ابدأ الآن' : 'Get Started'}
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </Link>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
            <div className="text-center mt-10">
              <Link href={`/${locale}/pricing`} style={{ fontSize: 14, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                {isAr ? 'عرض مقارنة الباقات الكاملة' : 'View full plans comparison'}
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── OFFLINE PRICING ── */}
      {offlinePlans.length > 0 && (
        <section className="relative z-10 px-6 lg:px-12 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Lock className="w-3 h-3" />
                {isAr ? 'التثبيت المحلي' : 'Self-Hosted'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                {isAr ? 'خطط التثبيت المحلي' : 'Self-Hosted Plans'}
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
                {isAr ? 'للعيادات التي تفضل تشغيل النظام على خوادمها الخاصة لضمان الخصوصية التامة.' : 'For clinics that prefer full privacy by running on their own servers.'}
              </p>
            </div>
            <div className={`grid gap-5 ${offlinePlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {offlinePlans.map((plan) => {
                const seats = plan.plan_limits?.find((l: any) => l.limit_type === 'provider_seats')?.max_value
                const patients = plan.plan_limits?.find((l: any) => l.limit_type === 'patients')?.max_value
                const featureNames = (plan.plan_features ?? []).map((pf: any) => pf.features?.[isAr ? 'name_ar' : 'name_en']).filter(Boolean) as string[]
                const priceNum = Number(plan.price_egp)
                const formattedPrice = priceNum === 0 ? (isAr ? 'مجاني' : 'Free') : priceNum.toLocaleString()
                const cycleLabel = plan.billing_cycle === 'monthly' ? (isAr ? '/شهر' : '/mo') : (isAr ? '/سنة' : '/yr')
                return (
                  <div key={plan.code} style={{
                    padding: 24, borderRadius: 18, display: 'flex', flexDirection: 'column',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{isAr ? plan.name_ar : plan.name_en}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: '#34d399' }}>{formattedPrice}</span>
                      {priceNum > 0 && <span style={{ fontSize: 12, color: '#475569' }}>EGP{cycleLabel}</span>}
                    </div>
                    <div style={{ flex: 1, marginBottom: 20 }}>
                      {seats && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{isAr ? `${seats} أطباء` : `${seats} doctors`}</p>}
                      {patients && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{isAr ? `حتى ${patients.toLocaleString()} مريض` : `Up to ${patients.toLocaleString()} patients`}</p>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {featureNames.map((fname, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#64748b' }}>
                            <Check style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 1 }} />
                            <span>{fname}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href={`/${locale}/contact`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* ── DOWNLOAD CTA ── */}
      <section className="relative z-10 px-6 lg:px-12 py-24" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{
            textAlign: 'center', padding: '64px 48px', borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.04) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
            boxShadow: '0 0 80px rgba(16,185,129,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)', filter: 'blur(60px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
                {isAr ? 'متاح على كل أجهزتك' : 'Available on All Your Devices'}
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.8 }}>
                {isAr ? 'ويندوز، لينكس، ماك، وأندرويد — مزامنة فورية عبر جميع الأجهزة.' : 'Windows, Linux, Mac, and Android — real-time sync across all devices.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {platformIcons.map(p => (
                  <div key={p.label} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 20px', borderRadius: 12,
                    background: 'rgba(6,11,20,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <p.icon style={{ width: 20, height: 20, color: p.color }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{p.label}</span>
                  </div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={{ display: 'inline-block' }}>
                <Link href={`/${locale}/download`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  height: 56, padding: '0 40px', borderRadius: 14, fontSize: 16, fontWeight: 700,
                  color: '#030712', background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                  boxShadow: '0 8px 30px rgba(16,185,129,0.35)',
                }}>
                  <Download className="w-5 h-5" />
                  {isAr ? 'انتقل لصفحة التحميل' : 'Go to Download Page'}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 lg:px-12 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,7,12,0.8)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Image src="/logo.png" alt="ClinicOS Logo" width={36} height={36} className="object-contain p-1" />
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.9, maxWidth: 300 }}>
                {isAr
                  ? 'نظام إدارة العيادات المتكامل — مصمم خصيصاً للسوق الطبي المصري.'
                  : 'The complete clinic management system — built specifically for the Egyptian medical market.'}
              </p>
              <div className="flex items-center gap-3 mt-6">
                {[Shield, Lock, Star].map((Icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon style={{ width: 16, height: 16, color: '#34d399' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Links */}
            {[
              {
                title: isAr ? 'المنتج' : 'Product',
                links: [
                  { href: `/${locale}/pricing`, label: isAr ? 'الأسعار والباقات' : 'Pricing & Plans' },
                  { href: `/${locale}/download`, label: isAr ? 'تحميل التطبيق' : 'Download App' },
                  { href: `/${locale}/contact`, label: isAr ? 'تواصل معنا' : 'Contact Us' },
                ]
              },
              {
                title: isAr ? 'القانوني' : 'Legal',
                links: [
                  { href: `/${locale}/terms`, label: isAr ? 'شروط الاستخدام' : 'Terms of Service', id: 'terms' },
                  { href: `/${locale}/terms`, label: isAr ? 'سياسة الخصوصية' : 'Privacy Policy', id: 'privacy' },
                ]
              },
              {
                title: isAr ? 'حسابك' : 'Account',
                links: [
                  { href: `/${locale}/login`, label: isAr ? 'تسجيل الدخول' : 'Sign In' },
                  { href: `/${locale}/register`, label: isAr ? 'إنشاء حساب مجاني' : 'Create Free Account' },
                ]
              }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.title}</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {col.links.map((link: { href: string; label: string; id?: string }) => (
                    <li key={link.id ?? link.label}>
                      <Link href={link.href} style={{ fontSize: 14, fontWeight: 500, color: '#475569', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.target as HTMLElement).style.color = '#34d399'}
                        onMouseLeave={e => (e.target as HTMLElement).style.color = '#475569'}
                      >{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }} className="md:flex-row md:justify-between">
            <p style={{ fontSize: 13, color: '#334155' }}>
              © {new Date().getFullYear()} ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <Link href={`/${altLocale}`} style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{isAr ? 'English' : 'عربي'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
