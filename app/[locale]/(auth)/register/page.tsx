import RegisterForm from './RegisterForm'
import { createClient } from '@/lib/supabase/server'

export default async function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  
  // Fetch active clinic types
  const { data: clinicTypes } = await supabase
    .from('clinic_types')
    .select('id, name_en, name_ar')
    .eq('is_active', true)
    
  // Fetch active plans and their features
  const { data: plans } = await supabase
    .from('plans')
    .select(`
      id, name_en, name_ar, description_en, description_ar, price_egp,
      plan_features (
        feature_id,
        features (
          id, name_en, name_ar
        )
      )
    `)
    .eq('is_active', true)

  return (
    <div className="flex min-h-screen h-screen">
      {/* Left side - Branding/Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6"><path d="M256 128v256M128 256h256" stroke="currentColor" strokeWidth="64" strokeLinecap="round"/></svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">ClinicOS</span>
        </div>

        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Start your clinic's<br/>digital transformation.
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Join thousands of clinics using ClinicOS to provide better care and grow their business.
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-8 sm:p-12 relative overflow-y-auto">
        {/* Subtle background glow for right side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="w-full max-w-[480px] my-auto py-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6"><path d="M256 128v256M128 256h256" stroke="currentColor" strokeWidth="64" strokeLinecap="round"/></svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">ClinicOS</span>
          </div>

          <RegisterForm 
            locale={locale} 
            initialClinicTypes={clinicTypes || []} 
            initialPlans={plans || []} 
          />
        </div>
      </div>
    </div>
  )
}
