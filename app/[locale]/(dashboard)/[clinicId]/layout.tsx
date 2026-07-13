import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  // Get staff member ID
  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) {
    redirect(`/${locale}/clinic-switcher`)
  }

  // Verify membership to this specific clinic
  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) {
    // If not a member of this clinic, redirect to switcher
    redirect(`/${locale}/clinic-switcher`)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-muted/20 p-4 hidden md:flex flex-col">
        <div className="font-bold text-xl mb-6">ClinicOS Web</div>
        <nav className="flex-1 space-y-2">
          <div className="text-xs uppercase text-muted-foreground font-semibold mb-2">Navigation</div>
          <a href={`/${locale}/${clinicId}`} className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Dashboard</a>
          <a href={`/${locale}/${clinicId}/patients`} className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Patients</a>
          {membership.role === 'owner' && (
            <a href={`/${locale}/${clinicId}/settings`} className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Settings</a>
          )}
        </nav>
        <div className="mt-auto border-t pt-4">
          <div className="text-sm font-medium">Role: <span className="capitalize text-primary">{membership.role}</span></div>
          <a href={`/${locale}/clinic-switcher`} className="text-xs text-muted-foreground hover:underline mt-2 inline-block">Switch Clinic</a>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-background p-6">
        {children}
      </main>
    </div>
  )
}
