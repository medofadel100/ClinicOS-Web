import Link from 'next/link'
import Image from 'next/image'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'شروط الاستخدام وسياسة الخصوصية' : 'Terms of Service & Privacy Policy',
    description: isAr
      ? 'شروط الاستخدام وسياسة الخصوصية لنظام إدارة العيادات ClinicOS.'
      : 'Terms of Service and Privacy Policy for the ClinicOS clinic management system.',
  }
}

export default async function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  const altLocale = isAr ? 'en' : 'ar'
  const altLabel = isAr ? 'EN' : 'عربي'

  const sections = isAr ? [
    {
      title: 'المقدمة',
      content: `مرحباً بك في ClinicOS ("النظام"). باستخدامك لهذا النظام، أنت توافق على شروط الاستخدام هذه. إذا كنت لا توافق على أي شرط، يرجى عدم استخدام النظام.

ClinicOS هو نظام إدارة عيادات متكامل مصمم خصيصاً للعيادات المصرية. يوفر النظام أدوات لإدارة المرضى، المواعيد، الروشتات الإلكترونية، الفواتير، المخزون، الموارد البشرية، والتسويق.`,
    },
    {
      title: 'تعريفات',
      content: `"المستخدم" — أي شخص يستخدم النظام سواء كطبيب أو موظف أو مالك عيادة.
"العيادة" — المؤسسة الطبية المسجلة في النظام.
"المالك" — شخصية قانونية العيادة المسجلة في النظام.
"البيانات" — أي معلومات يتم إدخالها أو تخزينها في النظام (ملفات المرضى، المواعيد، الفواتير، إلخ).
"الخدمة" — النظام والخدمات المرتبطة به.`,
    },
    {
      title: 'إنشاء الحساب',
      content: `لاستخدام النظام، يجب عليك:
• تقديم معلومات دقيقة وصحيحة عند التسجيل.
• الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.
• إخطارنا فوراً في حالة استخدام حسابك بشكل غير مصرح به.
• أنت مسؤول عن جميع الأنشطة التي تتم عبر حسابك.

يحق لنا تعليق أو إلغاء حسابك في حالة انتهاك شروط الاستخدام.`,
    },
    {
      title: 'استخدام النظام',
      content: `أنت توافق على:
• استخدام النظام فقط لأغراض قانونية تتعلق بإدارة عيادتك.
• عدم محاولة الوصول غير المصرح به إلى النظام أو خوادمه.
• عدم استخدام النظام بطريقة قد تضر بالآخرين أو تعطل الخدمة.
• الامتثال لجميع القوانين واللوائح المعمول بها في جمهورية مصر العربية.

يُحظر:
• نسخ أو تعديل أو توزيع محتوى النظام.
• استخدام النظام لإرسال رسائل تجارية غير مرغوب فيها.
• مشاركة الحسابات بين العيادات أو المستخدمين غير المصرح لهم.`,
    },
    {
      title: 'البيانات والخصوصية',
      content: `بياناتك ملكك:
• جميع البيانات التي تدخلها في النظام (ملفات المرضى، المواعيد، الفواتير) هي ملكك exclusivement.
• لا نبيع بياناتك أو نشاركها مع أطراف ثالثة لأغراض تجارية.
• يمكنك حذف حسابك وبياناتك في أي من لوحة التحكم.

الأمان:
• نستخدم تشفير SSL/TLS لجميع الاتصالات.
• نستخدم Supabase مع تشفير على مستوى قاعدة البيانات.
• نحتفظ بنسخ احتياطية منتظمة لبياناتك.
• نحن لا نملك الوصول المباشر لبيانات المرضى إلا في حالات الدعم الفني المحدود.

مشاركة البيانات:
• قد نشارك بيانات مجهولة المصدر (غير قابلة للتعرف عليها) مع أطراف ثالثة لأغراض البحث أو التحسين.
• لن نشارك بياناتك الشخصية مع أي طرف ثالث دون إذنك.`,
    },
    {
      title: 'الاشتراكات والدفع',
      content: `الباقات المجانية:
• باقة Starter مجانية للأبد مع ميزات أساسية.
• نحتفظ بالحق في تعديل ميزات الباقات المجانية مع إشعار مسبق.

الباقات المدفوعة:
• الأسعار معروضة بالجنيه المصري (EGP).
• يمكن إلغاء الاشتراك في أي من لوحة التحكم.
• لا نقدم استرداد المبالغ المدفوعة retroactively.
• نحتفظ بالحق في تعديل الأسعار مع إشعار مسبق 30 يوماً.

الفواتير:
• تُصدر الفواتير تلقائياً وفقاً لدورة الفوترة المختارة.
• يمكنك الاطلاع على فواتيرك السابقة من لوحة التحكم.`,
    },
    {
      title: 'الملكية الفكرية',
      content: `• جميع حقوق الملكية الفكرية للنظام محفوظة لـ ClinicOS.
• أنت تحتفظ بملكية جميع البيانات التي تدخلها في النظام.
• نمنحك ترخيصاً غير حصري لاستخدام النظام وفقاً لباقة اشتراكك.
• يُحظر أي نسخ أو تعديل أو توزيع للنظام أو مكوناته.`,
    },
    {
      title: 'حدود المسؤولية',
      content: `• النظام يُقدم "كما هو" (AS IS) دون ضمانات صريحة أو ضمنية.
• لا نضمن أن النظام سيكون متاحاً دون انقطاع.
• لا نتحمل المسؤولية عن أي أضرار غير مباشرة أو تبعية ناتجة عن استخدام النظام.
• مسؤوليتنا لا تتجاوز المبالغ المدفوعة منك خلال الاثني عشر (12) شهراً السابقة.
• أنت مسؤول عن الاحتفاظ بنسخ احتياطية من بياناتك.`,
    },
    {
      title: 'التعديلات على الشروط',
      content: `• نحتفظ بالحق في تعديل هذه الشروط في أي وقت.
• سنقوم بإشعارك بالتغييرات الجوهرية عبر البريد الإلكتروني أو من خلال النظام.
• استمرارك في استخدام النظام بعد التعديلات يُعد قبولاً للشروط الجديدة.
• يُنصح بمراجعة هذه الشروط بشكل دوري.`,
    },
    {
      title: 'قانون الحوكمة',
      content: `• تخضع هذه الشروط لقوانين جمهورية مصر العربية.
• أي نزاع ينشأ عن هذه الشروط يخضع لاختصاص المحاكم المصرية.
• إذا كان أي بند من هذه الشروط غير قابل للتنفيذ، يظل الباقون سارين.`,
    },
    {
      title: 'التواصل',
      content: `لأي استفسارات حول شروط الاستخدام أو سياسة الخصوصية:
• البريد الإلكتروني: support@clinicos.com
• الواتساب: +20 100 000 0000
• صفحة التواصل: /contact`,
    },
  ] : [
    {
      title: 'Introduction',
      content: `Welcome to ClinicOS ("the System"). By using this System, you agree to these Terms of Service. If you do not agree to any term, please do not use the System.

ClinicOS is a complete clinic management system built specifically for Egyptian clinics. The System provides tools for managing patients, appointments, e-prescriptions, billing, inventory, HR, and marketing.`,
    },
    {
      title: 'Definitions',
      content: `"User" — any person who uses the System, whether as a doctor, staff member, or clinic owner.
"Clinic" — the healthcare institution registered in the System.
"Owner" — the legal entity of the clinic registered in the System.
"Data" — any information entered or stored in the System (patient files, appointments, billing, etc.).
"Service" — the System and its associated services.`,
    },
    {
      title: 'Account Creation',
      content: `To use the System, you must:
• Provide accurate and truthful information when registering.
• Maintain the confidentiality of your login credentials.
• Notify us immediately if you become aware of any unauthorized use of your account.
• You are responsible for all activities that occur under your account.

We reserve the right to suspend or terminate your account if you violate the Terms of Service.`,
    },
    {
      title: 'System Usage',
      content: `You agree to:
• Use the System only for lawful purposes related to managing your clinic.
• Not attempt to gain unauthorized access to the System or its servers.
• Not use the System in a way that could harm others or disrupt the Service.
• Comply with all applicable laws and regulations in the Arab Republic of Egypt.

Prohibited:
• Copying, modifying, or distributing System content.
• Using the System to send unsolicited commercial messages.
• Sharing accounts between clinics or unauthorized users.`,
    },
    {
      title: 'Data & Privacy',
      content: `Your data is yours:
• All data you enter into the System (patient files, appointments, billing) belongs exclusively to you.
• We do not sell your data or share it with third parties for commercial purposes.
• You can delete your account and data at any time from the dashboard.

Security:
• We use SSL/TLS encryption for all connections.
• We use Supabase with database-level encryption.
• We maintain regular backups of your data.
• We do not have direct access to patient data except in limited technical support situations.

Data Sharing:
• We may share anonymized data (non-identifiable) with third parties for research or improvement purposes.
• We will not share your personal data with any third party without your consent.`,
    },
    {
      title: 'Subscriptions & Billing',
      content: `Free Plans:
• The Starter plan is free forever with basic features.
• We reserve the right to modify free plan features with advance notice.

Paid Plans:
• Prices are displayed in Egyptian Pounds (EGP).
• You can cancel your subscription at any time from the dashboard.
• We do not provide retroactive refunds.
• We reserve the right to modify prices with 30 days' advance notice.

Invoices:
• Invoices are issued automatically according to the selected billing cycle.
• You can view your past invoices from the dashboard.`,
    },
    {
      title: 'Intellectual Property',
      content: `• All intellectual property rights of the System are reserved by ClinicOS.
• You retain ownership of all data you enter into the System.
• We grant you a non-exclusive license to use the System according to your subscription plan.
• Copying, modifying, or distributing the System or its components is prohibited.`,
    },
    {
      title: 'Limitation of Liability',
      content: `• The System is provided "AS IS" without warranties of any kind, express or implied.
• We do not guarantee that the System will be available without interruption.
• We are not liable for any indirect or consequential damages arising from the use of the System.
• Our liability is limited to the amounts paid by you during the twelve (12) months preceding the claim.
• You are responsible for maintaining backup copies of your data.`,
    },
    {
      title: 'Changes to Terms',
      content: `• We reserve the right to modify these Terms at any time.
• We will notify you of material changes via email or through the System.
• Your continued use of the System after changes constitutes acceptance of the new Terms.
• We recommend reviewing these Terms periodically.`,
    },
    {
      title: 'Governing Law',
      content: `• These Terms are governed by the laws of the Arab Republic of Egypt.
• Any dispute arising from these Terms is subject to the jurisdiction of Egyptian courts.
• If any provision of these Terms is found to be unenforceable, the remaining provisions remain in effect.`,
    },
    {
      title: 'Contact',
      content: `For any inquiries about the Terms of Service or Privacy Policy:
• Email: support@clinicos.com
• WhatsApp: +20 100 000 0000
• Contact page: /contact`,
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
            <Link href={`/${altLocale}/terms`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.08]">{altLabel}</Link>
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link href={`/${locale}/register`} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          {isAr ? 'شروط الاستخدام وسياسة الخصوصية' : 'Terms of Service & Privacy Policy'}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          {isAr ? 'آخر تحديث: يوليو 2026' : 'Last updated: July 2026'}
        </p>
      </section>

      {/* Table of Contents */}
      <section className="relative z-10 px-6 lg:px-12 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'جدول المحتويات' : 'Table of Contents'}</h2>
            <ul className="space-y-2">
              {sections.map((section, i) => (
                <li key={i}>
                  <a href={`#section-${i}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    <span className="text-xs text-slate-600 w-5">{i + 1}.</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 px-6 lg:px-12 pb-16">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((section, i) => (
            <div key={i} id={`section-${i}`} className="scroll-mt-24">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-sm font-semibold text-emerald-400/60">{i + 1}.</span>
                {section.title}
              </h2>
              <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line pl-8">
                {section.content}
              </div>
            </div>
          ))}
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
              <Link href={`/${altLocale}/terms`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'English' : 'عربي'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
