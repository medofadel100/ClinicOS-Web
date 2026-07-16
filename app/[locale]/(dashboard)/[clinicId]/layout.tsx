import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { Menu } from 'lucide-react'

export default async function DashboardLayout({
  children,
  params: { locale, clinicId }
}: {
  children: React.ReactNode
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) {
    redirect(`/${locale}/clinic-switcher`)
  }

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) {
    redirect(`/${locale}/clinic-switcher`)
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select(`
      name,
      clinic_type_id,
      clinic_types ( code, name_ar, name_en )
    `)
    .eq('id', clinicId)
    .single()

  const specialtyCode = clinic?.clinic_types?.code?.toLowerCase() || ''
  const isDental = specialtyCode.includes('dental')
  const clinicName = clinic?.name || 'Clinic'

  // Prefer full_name from staff_members, fall back to email
  const displayName = staffMember.full_name || user.email || ''
  const emailName = user.email?.split('@')[0] || 'User'
  const userInitials = (staffMember.full_name
    ? staffMember.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : emailName.slice(0, 2)
  ).toUpperCase()

  const roleLabel = membership.role.charAt(0).toUpperCase() + membership.role.slice(1)

  return (
    <div
      className="flex min-h-screen w-full overflow-hidden"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 4%) 100%)',
      }}
    >
      <Sidebar
        locale={locale}
        clinicId={clinicId}
        role={membership.role}
        specialty={isDental ? 'dental' : ''}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* ── Premium Header ── */}
        <header
          className="relative z-30 h-16 flex items-center justify-between px-6 shrink-0"
          style={{
            background: 'rgba(10, 15, 30, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.4)',
          }}
        >
          {/* Left: mobile menu + clinic name */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(0,212,170,0.06) 100%)',
                  border: '1px solid rgba(0,212,170,0.2)',
                  color: 'hsl(168 100% 52%)',
                }}
              >
                {clinicName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-200 tracking-tight">
                {clinicName}
              </span>
            </div>
          </div>

          {/* Right: interactive header actions (client component) */}
          <HeaderActions
            userEmail={user.email || ''}
            userInitials={userInitials}
            roleLabel={roleLabel}
            locale={locale}
            clinicId={clinicId}
          />
        </header>

        {/* ── Main Content ── */}
        <main
          className="flex-1 overflow-auto relative"
          style={{
            background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 4%) 100%)',
          }}
        >
          {/* Ambient background decorations */}
          <div
            className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.04]"
            aria-hidden="true"
            style={{ background: 'hsl(168 100% 42%)' }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.03]"
            aria-hidden="true"
            style={{ background: 'hsl(258 60% 55%)' }}
          />

          <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <OnboardingTour />
    </div>
  )
}
