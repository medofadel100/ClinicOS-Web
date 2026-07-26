import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, MessageCircle, Globe, Stethoscope, Users, Heart, ChevronRight } from 'lucide-react'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'تواصل معنا — من نحن' : 'Contact Us — About Us',
    description: isAr
      ? 'تعرف على فريق ClinicOS وتواصل معنا لأي استفسار أو دعم فني.'
      : 'Learn about the ClinicOS team and reach out to us for any inquiries or support.',
  }
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  const altLocale = isAr ? 'en' : 'ar'
  const altLabel = isAr ? 'EN' : 'عربي'

  const values = [
    {
      icon: Stethoscope, color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      title: isAr ? 'مصمم للعيادات المصرية' : 'Built for Egyptian Clinics',
      desc: isAr ? 'ClinicOS ليس برنامجاً عالمياً مُترجمًا — بل صُمم من الأساس للسوق المصري، بالعملة المحلية، باللغة العربية أولاً، ومتاح بالإنجليزية.' : 'ClinicOS is not a translated global product — it was built from the ground up for the Egyptian market, in local currency, Arabic-first, and available in English.',
    },
    {
      icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',
      title: isAr ? 'فريق صغير بتأثير كبير' : 'Small Team, Big Impact',
      desc: isAr ? 'فريق صغير ومتحمس يعمل على تطوير منصة تخدم العيادات على مدار الساعة. نسمع لعملائنا ونطور بناءً على احتياجاتهم الحقيقية.' : 'A small, passionate team working on a platform that serves clinics around the clock. We listen to our customers and build based on their real needs.',
    },
    {
      icon: Heart, color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
      title: isAr ? 'البساطة في الأهم' : 'Simplicity Matters',
      desc: isAr ? 'لا نحب التعقيد. كل واجهة في ClinicOS صُممت لتكون واضحة وسهلة الاستخدام — حتى لو لم تستخدم برنامجاً طبياً من قبل.' : 'We don\'t like complexity. Every interface in ClinicOS was designed to be clear and easy to use — even if you\'ve never used medical software before.',
    },
    {
      icon: Globe, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
      title: isAr ? 'مفتوح المصدر والمفتوح للجميع' : 'Open & Accessible',
      desc: isAr ? 'نؤمن بأن إدارة العيادة يجب أن تكون متاحة للجميع. لذلك وفرنا باقة مجانية للأبد، وخيارات تثبيت محلي للعيادات التي تفضل الخصوصية.' : 'We believe clinic management should be accessible to everyone. That\'s why we offer a free-forever plan and self-hosted options for clinics that prefer privacy.',
    },
  ]

  const contactMethods = [
    { icon: Mail, label: isAr ? 'البريد الإلكتروني' : 'Email', value: 'support@clinicos.com', href: 'mailto:support@clinicos.com', color: '#3b82f6' },
    { icon: Phone, label: isAr ? 'الهاتف' : 'Phone', value: '+20 100 000 0000', href: 'tel:+201000000000', color: '#10b981' },
    { icon: MessageCircle, label: isAr ? 'الواتساب' : 'WhatsApp', value: isAr ? 'راسلنا على الواتساب' : 'Message us on WhatsApp', href: 'https://wa.me/201000000000', color: '#22c55e' },
    { icon: MapPin, label: isAr ? 'المقر' : 'Location', value: isAr ? 'القاهرة، مصر' : 'Cairo, Egypt', href: '#', color: '#f59e0b' },
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
            <Link href={`/${altLocale}/contact`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.08]">{altLabel}</Link>
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/register`} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <MessageCircle className="w-3.5 h-3.5" />
          {isAr ? 'نحن هنا لمساعدتك' : 'We\'re Here to Help'}
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          {isAr ? 'تواصل معنا' : 'Contact Us'}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          {isAr
            ? 'سواء كنت تبحث عن دعم فني، أو لديك سؤال عن النظام، أو تريد مجرد التعارف — يسعدنا التواصل معك.'
            : 'Whether you\'re looking for technical support, have a question about the system, or just want to say hello — we\'d love to hear from you.'}
        </p>
      </section>

      {/* About Us */}
      <section className="relative z-10 px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">{isAr ? 'من نحن' : 'Who We Are'}</h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? 'ClinicOS هو نظام إدارة عيادات متكامل، صُمم خصيصاً للعيادات المصرية. نقدم حلاً شاملاً يجمع إدارة المرضى، المواعيد، الروشتات الإلكترونية، الفواتير، المخزون، الموارد البشرية، والتسويق — في منصة واحدة سهلة الاستخدام.'
              : 'ClinicOS is a complete clinic management system, built specifically for Egyptian clinics. We offer a comprehensive solution that combines patient management, appointments, e-prescriptions, billing, inventory, HR, and marketing — in one easy-to-use platform.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: v.bg }}>
                <v.icon className="w-6 h-6" style={{ color: v.color }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: '24+', label: isAr ? 'وحدة تخصص طبي' : 'Specialty Modules' },
              { val: '9', label: isAr ? 'باقات متاحة' : 'Available Plans' },
              { val: '21', label: isAr ? 'تخصص طبي مدعوم' : 'Supported Specialties' },
              { val: '24/7', label: isAr ? 'متاح دائماً' : 'Always Available' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">{s.val}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative z-10 px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{isAr ? 'طرق التواصل' : 'Get in Touch'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {contactMethods.map((method, i) => (
              <a key={i} href={method.href} target={method.href.startsWith('http') ? '_blank' : undefined} rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${method.color}15`, border: `1px solid ${method.color}30` }}>
                  <method.icon className="w-6 h-6" style={{ color: method.color }} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">{method.label}</p>
                  <p className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">{method.value}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 ${isAr ? 'mr-auto rotate-180' : 'ml-auto'}`} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-white/[0.02] border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.06)]">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{isAr ? 'جاهز لإدارة عيادتك؟' : 'Ready to Manage Your Clinic?'}</h2>
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
              <Link href={`/${altLocale}/contact`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'English' : 'عربي'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
