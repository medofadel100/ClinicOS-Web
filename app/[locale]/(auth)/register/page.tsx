import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Building2, KeyRound, ArrowRight } from 'lucide-react'

export default async function RegisterGateway({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-6">
      
      {/* Background ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 mb-4">
            Welcome to ClinicOS
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Choose how you would like to set up your clinic workspace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Card 1: Free Trial */}
          <Link href={`/${locale}/register/trial`} className="group">
            <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-teal-500/50 hover:shadow-[0_0_40px_rgba(20,184,166,0.1)] hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Building2 className="w-7 h-7 text-teal-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Start Free Trial</h2>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                Create a completely new clinic workspace from scratch. Perfect for trying out all features free for 14 days.
              </p>
              <div className="flex items-center text-teal-400 font-medium group-hover:text-teal-300">
                Continue to Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Serial Code */}
          <Link href={`/${locale}/register/serial`} className="group">
            <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <KeyRound className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Activate Serial Code</h2>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                Have you purchased a ClinicOS license or received hardware? Enter your serial code here to claim your pre-configured clinic.
              </p>
              <div className="flex items-center text-indigo-400 font-medium group-hover:text-indigo-300">
                Enter Serial Code
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400">
            {t('already_have_account')}{' '}
            <Link href={`/${locale}/login`} className="text-teal-400 hover:text-teal-300 hover:underline transition-colors font-medium">
              {t('sign_in')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
