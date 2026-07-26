import Link from 'next/link'
import Image from 'next/image'
import { Monitor, Smartphone, Apple, Download, Check, ArrowLeft, HardDrive, FileBox, Terminal } from 'lucide-react'

const platforms = [
  {
    id: 'windows',
    name_en: 'Windows',
    name_ar: 'ويندوز',
    icon: Monitor,
    color: 'text-blue-400',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.2)',
    description_en: 'Full desktop application for Windows 10/11',
    description_ar: 'تطبيق سطح مكتب كامل لويندوز ١٠/١١',
    files: [
      { name: 'ClinicOS-Setup-x64.exe', arch: 'x64', format: 'EXE', size: '~85 MB', icon: HardDrive },
      { name: 'ClinicOS-Setup-x86.exe', arch: 'x86', format: 'EXE', size: '~80 MB', icon: HardDrive },
      { name: 'ClinicOS-x64.msi', arch: 'x64', format: 'MSI', size: '~88 MB', icon: FileBox },
      { name: 'ClinicOS-x86.msi', arch: 'x86', format: 'MSI', size: '~83 MB', icon: FileBox },
    ]
  },
  {
    id: 'linux',
    name_en: 'Linux',
    name_ar: 'لينكس',
    icon: Terminal,
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    description_en: 'Native packages for Debian/Ubuntu and Fedora/RHEL',
    description_ar: 'حزم أصلية لديبيان/أوبونتو وفيدورا/ريل',
    files: [
      { name: 'clinicos_1.0.0_amd64.deb', arch: 'amd64', format: '.deb', size: '~82 MB', icon: FileBox },
      { name: 'clinicos-1.0.0-x86_64.rpm', arch: 'x86_64', format: '.rpm', size: '~84 MB', icon: FileBox },
    ]
  },
  {
    id: 'mac',
    name_en: 'macOS',
    name_ar: 'ماك',
    icon: Apple,
    color: 'text-slate-300',
    bg: 'rgba(148,163,184,0.12)',
    border: 'rgba(148,163,184,0.2)',
    description_en: 'Universal binary — works on both Intel and Apple Silicon',
    description_ar: 'ملف شامل — يعمل على إنتل و Apple Silicon',
    files: [
      { name: 'ClinicOS-Intel.dmg', arch: 'Intel', format: '.dmg', size: '~85 MB', icon: HardDrive },
      { name: 'ClinicOS-AppleSilicon.dmg', arch: 'ARM64', format: '.dmg', size: '~80 MB', icon: HardDrive },
    ]
  },
  {
    id: 'android',
    name_en: 'Android',
    name_ar: 'أندرويد',
    icon: Smartphone,
    color: 'text-green-400',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.2)',
    description_en: 'Mobile app for Android 8.0+ (APK direct download)',
    description_ar: 'تطبيق موبايل لأندرويد ٨.٠+ (تحميل مباشر APK)',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.clinicos.app',
    files: [
      { name: 'ClinicOS-v1.0.0.apk', arch: 'ARM64/ARMv7', format: 'APK', size: '~45 MB', icon: Smartphone },
    ]
  },
]

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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 100%)' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15" style={{ background: 'hsl(168 100% 42%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ background: 'hsl(195 100% 50%)' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/[0.06]">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 20px rgba(0,212,170,0.4)' }}>
            <Image src="/logo.png" alt="ClinicOS" width={40} height={40} className="object-contain p-1" />
          </div>
          <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
        </Link>
        <Link href={`/${locale}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: 'hsl(168 100% 52%)' }}>
          <Download className="w-3.5 h-3.5" />
          {isAr ? ' متاح على كل الأجهزة' : 'Available on All Devices'}
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          {isAr ? 'حمّل ClinicOS' : 'Download ClinicOS'}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          {isAr
            ? 'تطبيق متكامل يعمل على سطح المكتب والموبايل. اختر جهازك وابدأ.'
            : 'A full-featured app for desktop and mobile. Pick your device and get started.'}
        </p>
      </section>

      {/* Platform sections */}
      <section className="relative z-10 px-6 lg:px-12 pb-20">
        <div className="max-w-5xl mx-auto space-y-8">
          {platforms.map(platform => (
            <div key={platform.id} className="rounded-2xl p-6 lg:p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: platform.bg, border: `1px solid ${platform.border}` }}>
                  <platform.icon className={`w-7 h-7 ${platform.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{isAr ? platform.name_ar : platform.name_en}</h2>
                  <p className="text-sm text-slate-400 mt-1">{isAr ? platform.description_ar : platform.description_en}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {platform.files.map(file => (
                  <div key={file.name} className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white/[0.04] group" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: platform.bg }}>
                      <file.icon className={`w-5 h-5 ${platform.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-300 truncate">{file.format}</p>
                      <p className="text-[10px] text-slate-500">{file.arch} &middot; {file.size}</p>
                    </div>
                    <button className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" style={{ background: platform.bg }}>
                      <Download className={`w-4 h-4 ${platform.color}`} />
                    </button>
                  </div>
                ))}
              </div>
              {'storeUrl' in platform && platform.storeUrl && (
                <a
                  href={platform.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.04]"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" /></svg>
                  {isAr ? 'احصل عليه من Google Play' : 'Get it on Google Play'}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* System Requirements */}
      <section className="relative z-10 px-6 lg:px-12 pb-20">
        <div className="max-w-4xl mx-auto rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-bold text-white mb-6">{isAr ? 'متطلبات النظام' : 'System Requirements'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">{isAr ? 'ويندوز' : 'Windows'}</h3>
              <ul className="space-y-2">
                {(isAr ? ['ويندوز ١٠ أو أحدث', 'RAM: ٤ جيجا أو أكثر', 'مساحة: ٢٠٠ ميجا', 'اتصال إنترنت'] : ['Windows 10 or later', 'RAM: 4 GB minimum', 'Storage: 200 MB', 'Internet connection']).map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400"><Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">{isAr ? 'أندرويد' : 'Android'}</h3>
              <ul className="space-y-2">
                {(isAr ? ['أندرويد ٨.٠ أو أحدث', 'RAM: ٢ جيجا أو أكثر', 'مساحة: ١٠٠ ميجا', 'اتصال إنترنت'] : ['Android 8.0 or later', 'RAM: 2 GB minimum', 'Storage: 100 MB', 'Internet connection']).map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400"><Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="ClinicOS" width={24} height={24} className="object-contain" />
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, hsl(168 100% 52%), hsl(195 100% 70%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicOS</span>
          </div>
          <p className="text-xs text-slate-600">&copy; 2026 ClinicOS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  )
}
