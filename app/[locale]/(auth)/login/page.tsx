import LoginForm from './LoginForm'
import { Stethoscope, Shield, Zap, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Real-time sync across all your devices and staff',
  },
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    desc: 'Enterprise-grade security for patient data',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Actionable insights to grow your practice',
  },
]

export default async function LoginPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* ── LEFT PANEL: Brand/Hero ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 100%)',
        }}
      >
        {/* Ambient orbs */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 animate-orb-1"
          style={{ background: 'hsl(168 100% 42%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 animate-orb-2"
          style={{ background: 'hsl(258 60% 55%)' }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10"
          style={{ background: 'hsl(195 100% 50%)' }}
        />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
                boxShadow: '0 0 24px rgba(0,212,170,0.5)',
              }}
            >
              <Stethoscope className="w-6 h-6 text-[#0a0f1e]" strokeWidth={2.5} />
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, hsl(168 100% 52%) 0%, hsl(195 100% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ClinicOS
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 px-10 xl:px-14 pb-10 xl:pb-14 space-y-10">
          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
              style={{
                background: 'rgba(0,212,170,0.12)',
                border: '1px solid rgba(0,212,170,0.25)',
                color: 'hsl(168 100% 52%)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(168 100% 42%)', boxShadow: '0 0 6px rgba(0,212,170,0.8)' }}
              />
              Next-Generation Platform
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              The future of
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, hsl(168 100% 52%) 0%, hsl(195 100% 65%) 50%, hsl(258 60% 70%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                clinic management
              </span>
              <br />
              is here.
            </h1>

            <p className="text-base text-slate-400 max-w-sm leading-relaxed">
              Streamline operations, manage appointments, and elevate patient care with our state-of-the-art platform.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="flex items-start gap-4 animate-slide-in-left"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                  style={{
                    background: 'rgba(0,212,170,0.1)',
                    border: '1px solid rgba(0,212,170,0.2)',
                  }}
                >
                  <f.icon className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div
        className="flex flex-1 items-center justify-center p-6 sm:p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(222 47% 4%) 100%)',
        }}
      >
        {/* Subtle ambient */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06]"
          style={{ background: 'hsl(168 100% 42%)' }}
        />

        <div className="w-full max-w-[420px] space-y-8 relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
                boxShadow: '0 0 20px rgba(0,212,170,0.4)',
              }}
            >
              <Stethoscope className="w-5 h-5 text-[#0a0f1e]" strokeWidth={2.5} />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, hsl(168 100% 52%) 0%, hsl(195 100% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ClinicOS
            </span>
          </div>

          <LoginForm locale={locale} />
        </div>
      </div>
    </div>
  )
}
