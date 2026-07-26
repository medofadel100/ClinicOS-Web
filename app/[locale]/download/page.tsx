import Link from 'next/link'
import Image from 'next/image'
import {
  Monitor, Smartphone, Apple, Download, Check, ArrowLeft,
  FileBox, Terminal,
} from 'lucide-react'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'تحميل ClinicOS' : 'Download ClinicOS',
    description: isAr
      ? 'حمّل ClinicOS على ويندوز، لينكس، ماك، وأندرويد — مجاناً.'
      : 'Download ClinicOS for Windows, Linux, macOS, and Android — free.',
  }
}

export default async function DownloadPage({ params: { locale } }: { params: { locale: string } }) {
  const isAr = locale === 'ar'

  const platforms = [
    {
      id: 'windows', name: isAr ? 'ويندوز' : 'Windows', icon: Monitor,
      accent: 'blue', description: isAr ? 'تطبيق سطح مكتب كامل لويندوز ١٠/١١' : 'Full desktop app for Windows 10/11',
      gradient: 'from-blue-600 to-blue-400', iconBg: 'bg-blue-500/15', iconBorder: 'border-blue-500/25', iconColor: 'text-blue-400',
      reqs: isAr ? ['ويندوز ١٠ أو أحدث', 'RAM: ٤ جيجا', 'مساحة: ٢٠٠ ميجا', 'اتصال إنترنت'] : ['Windows 10 or later', '4 GB RAM', '200 MB storage', 'Internet connection'],
      files: [
        { name: 'ClinicOS-Setup-x64.exe', arch: 'x64', format: 'EXE', size: '~85 MB', primary: true },
        { name: 'ClinicOS-Setup-x86.exe', arch: 'x86', format: 'EXE', size: '~80 MB', primary: false },
        { name: 'ClinicOS-x64.msi', arch: 'x64', format: 'MSI', size: '~88 MB', primary: false },
        { name: 'ClinicOS-x86.msi', arch: 'x86', format: 'MSI', size: '~83 MB', primary: false },
      ],
    },
    {
      id: 'mac', name: isAr ? 'ماك' : 'macOS', icon: Apple,
      accent: 'slate', description: isAr ? 'ملف شامل — يعمل على إنتل و Apple Silicon' : 'Universal binary — Intel & Apple Silicon',
      gradient: 'from-slate-500 to-slate-300', iconBg: 'bg-slate-500/15', iconBorder: 'border-slate-500/25', iconColor: 'text-slate-300',
      reqs: isAr ? ['macOS ١٢ أو أحدث', 'RAM: ٤ جيجا', 'مساحة: ٢٠٠ ميجا', 'اتصال إنترنت'] : ['macOS 12 or later', '4 GB RAM', '200 MB storage', 'Internet connection'],
      files: [
        { name: 'ClinicOS-Intel.dmg', arch: 'Intel', format: '.dmg', size: '~85 MB', primary: true },
        { name: 'ClinicOS-AppleSilicon.dmg', arch: 'ARM64', format: '.dmg', size: '~80 MB', primary: false },
      ],
    },
    {
      id: 'linux', name: isAr ? 'لينكس' : 'Linux', icon: Terminal,
      accent: 'amber', description: isAr ? 'حزم أصلية لديبيان/أوبونتو وفيدورا/ريل' : 'Native packages for Debian/Ubuntu and Fedora/RHEL',
      gradient: 'from-amber-600 to-amber-400', iconBg: 'bg-amber-500/15', iconBorder: 'border-amber-500/25', iconColor: 'text-amber-400',
      reqs: isAr ? ['أوبونتو ٢٠ أو أحدث', 'RAM: ٤ جيجا', 'مساحة: ٢٠٠ ميجا', 'اتصال إنترنت'] : ['Ubuntu 20 or later', '4 GB RAM', '200 MB storage', 'Internet connection'],
      files: [
        { name: 'clinicos_1.0.0_amd64.deb', arch: 'amd64', format: '.deb', size: '~82 MB', primary: true },
        { name: 'clinicos-1.0.0-x86_64.rpm', arch: 'x86_64', format: '.rpm', size: '~84 MB', primary: false },
      ],
    },
    {
      id: 'android', name: isAr ? 'أندرويد' : 'Android', icon: Smartphone,
      accent: 'green', description: isAr ? 'تطبيق موبايل لأندرويد ٨.٠+ (تحميل مباشر APK)' : 'Mobile app for Android 8.0+ (APK direct download)',
      gradient: 'from-green-600 to-green-400', iconBg: 'bg-green-500/15', iconBorder: 'border-green-500/25', iconColor: 'text-green-400',
      reqs: isAr ? ['أندرويد ٨.٠ أو أحدث', 'RAM: ٢ جيجا', 'مساحة: ١٠٠ ميجا', 'اتصال إنترنت'] : ['Android 8.0 or later', '2 GB RAM', '100 MB storage', 'Internet connection'],
      storeUrl: 'https://play.google.com/store/apps/details?id=com.clinicos.app',
      files: [
        { name: 'ClinicOS-v1.0.0.apk', arch: 'ARM64/ARMv7', format: 'APK', size: '~45 MB', primary: true },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/5">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25">
            <Image src="/logo.png" alt="ClinicOS" width={40} height={40} className="object-contain p-1" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">ClinicOS</span>
        </Link>
        <Link href={`/${locale}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
        <Link href={`/${locale}/pricing`} className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          {isAr ? 'الأسعار' : 'Pricing'}
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-6">
          <Download className="w-3.5 h-3.5" />
          {isAr ? 'متاح على كل الأجهزة' : 'Available on All Devices'}
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          {isAr ? 'حمّل ClinicOS' : 'Download ClinicOS'}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          {isAr ? 'تطبيق متكامل يعمل على سطح المكتب والموبايل. اختر جهازك وابدأ.' : 'A full-featured desktop and mobile app. Pick your device and get started.'}
        </p>
        <div className="flex items-center justify-center gap-6">
          {[
            { icon: Monitor, label: 'Windows', color: 'text-blue-400' },
            { icon: Apple, label: 'macOS', color: 'text-slate-300' },
            { icon: Terminal, label: 'Linux', color: 'text-amber-400' },
            { icon: Smartphone, label: 'Android', color: 'text-green-400' },
          ].map(p => (
            <div key={p.label} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                <p.icon className={`w-7 h-7 ${p.color}`} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Cards */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map(p => {
            const Icon = p.icon
            const primaryFile = p.files.find(f => f.primary)
            const secondaryFiles = p.files.filter(f => !f.primary)
            return (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] flex flex-col">
                {/* Colored header */}
                <div className={`px-6 py-5 bg-gradient-to-r ${p.gradient} bg-opacity-10 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.iconBg} border ${p.iconBorder}`}>
                      <Icon className={`w-7 h-7 ${p.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{p.name}</h2>
                      <p className="text-sm text-white/60">{p.description}</p>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div className="p-6 space-y-3 flex-1">
                  {primaryFile && (
                    <a href={`/downloads/${primaryFile.name}`} download className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.iconBg} border ${p.iconBorder}`}>
                          <Download className={`w-5 h-5 ${p.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{primaryFile.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.iconBg} ${p.iconColor}`}>{primaryFile.format}</span>
                            <span className="text-[10px] text-slate-500">{primaryFile.arch}</span>
                            <span className="text-[10px] text-slate-500">{primaryFile.size}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${p.gradient} text-white shrink-0 opacity-90 group-hover:opacity-100 transition-opacity`}>
                        {isAr ? 'تحميل' : 'Download'}
                      </span>
                    </a>
                  )}
                  {secondaryFiles.map(file => (
                    <a key={file.name} href={`/downloads/${file.name}`} download className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-white/[0.03] transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileBox className={`w-4 h-4 ${p.iconColor} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500">{file.format}</span>
                            <span className="text-[10px] text-slate-600">&middot;</span>
                            <span className="text-[10px] text-slate-500">{file.arch}</span>
                            <span className="text-[10px] text-slate-600">&middot;</span>
                            <span className="text-[10px] text-slate-500">{file.size}</span>
                          </div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                    </a>
                  ))}
                  {p.storeUrl && (
                    <a href={p.storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/15 transition-all">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" /></svg>
                      {isAr ? 'احصل عليه من Google Play' : 'Get it on Google Play'}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* System Requirements */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="max-w-6xl mx-auto rounded-2xl p-8 border border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white mb-8">{isAr ? 'متطلبات النظام' : 'System Requirements'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map(p => {
              const Icon = p.icon
              return (
                <div key={p.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${p.iconColor}`} />
                    <h3 className="text-sm font-semibold text-slate-300">{p.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {p.reqs.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check className={`w-3.5 h-3.5 ${p.iconColor} shrink-0`} />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="ClinicOS" width={28} height={28} className="object-contain" />
                <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">ClinicOS</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{isAr ? 'نظام إدارة العيادات المتكامل — مصمم للسوق المصري.' : 'The complete clinic management system — built for Egypt.'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'المنتج' : 'Product'}</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/pricing`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'الأسعار والباقات' : 'Pricing & Plans'}</Link></li>
                <li><Link href={`/${locale}/download`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'تحميل التطبيق' : 'Download App'}</Link></li>
                <li><Link href={`/${locale}/contact`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'تواصل معنا' : 'Contact Us'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'القانوني' : 'Legal'}</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/terms`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'شروط الاستخدام' : 'Terms of Service'}</Link></li>
                <li><Link href={`/${locale}/terms`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{isAr ? 'حسابك' : 'Your Account'}</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/login`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link></li>
                <li><Link href={`/${locale}/register`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">{isAr ? 'إنشاء حساب مجاني' : 'Create Free Account'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">&copy; 2026 ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-4">
              <Link href={`/${locale}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
