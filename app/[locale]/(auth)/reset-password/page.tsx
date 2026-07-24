import ResetPasswordForm from './ResetPasswordForm'
import { Stethoscope } from 'lucide-react'

export default async function ResetPasswordPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 animate-orb-1"
          style={{ background: 'hsl(168 100% 42%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 animate-orb-2"
          style={{ background: 'hsl(258 60% 55%)' }}
        />
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

        <div className="relative z-10 p-10 xl:p-14">
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

        <div className="relative z-10 px-10 xl:px-14 pb-10 xl:pb-14">
          <div className="space-y-5">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-[1.1] tracking-tight">
              {locale === 'ar' ? 'خطوة أخيرة' : 'One last step,'}
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, hsl(168 100% 52%) 0%, hsl(195 100% 65%) 50%, hsl(258 60% 70%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {locale === 'ar' ? 'اختر كلمة مرور جديدة.' : 'choose a new password.'}
              </span>
            </h1>
            <p className="text-base text-slate-400 max-w-sm leading-relaxed">
              {locale === 'ar'
                ? 'أدخل كلمة المرور الجديدة وتأكد منها ثم اضغط حفظ.'
                : 'Enter and confirm your new password to get back into your account.'}
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex flex-1 items-center justify-center p-6 sm:p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(222 47% 4%) 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06]"
          style={{ background: 'hsl(168 100% 42%)' }}
        />

        <div className="w-full max-w-[420px] space-y-8 relative z-10">
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

          <ResetPasswordForm locale={locale} />
        </div>
      </div>
    </div>
  )
}
