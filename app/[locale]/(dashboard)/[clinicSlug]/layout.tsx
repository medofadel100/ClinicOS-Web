import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import ToastProvider from '@/components/layout/ToastProvider'
import { requireClinicId } from "@/lib/utils/clinic";

export default async function DashboardLayout({
      children,
      params: { locale, clinicSlug }
    }: {
              children: React.ReactNode
              params: { locale: string; clinicSlug: string }
            }) {
    const clinicId = await requireClinicId(clinicSlug);
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
      slug,
      clinic_type_id,
      clinic_types ( code, name_ar, name_en )
    `)
    .eq('id', clinicId)
    .single()

  if (clinic?.slug && clinicSlug !== clinic.slug) {
    redirect(`/${locale}/${clinic.slug}`)
  }

  const types = clinic?.clinic_types as any
  const specialtyCode = (Array.isArray(types) ? types[0]?.code : types?.code)?.toLowerCase() || ''
  const isDental = specialtyCode.includes('dental')
  const clinicName = clinic?.name || 'Clinic'

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
      <DashboardShell
        locale={locale}
        clinicSlug={clinicSlug}
        role={membership.role}
        specialty={isDental ? 'dental' : ''}
        clinicName={clinicName}
        userInitials={userInitials}
        roleLabel={roleLabel}
        userEmail={user.email || ''}
        headerActions={
          <HeaderActions
            userEmail={user.email || ''}
            userInitials={userInitials}
            roleLabel={roleLabel}
            locale={locale}
            clinicId={clinicSlug}
          />
        }
      >
        {children}
      </DashboardShell>

      <OnboardingTour />
      <ToastProvider />
    </div>
  )
}
