import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { Sidebar } from '@/components/layout/Sidebar'
import { Menu, UserCircle } from 'lucide-react'

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
    <div className="min-h-screen flex bg-background w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar locale={locale} clinicId={clinicId} role={membership.role} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-lg hidden sm:block tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-2 hover:bg-accent p-2 rounded-md cursor-pointer transition-colors border border-transparent hover:border-border">
              <UserCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium hidden sm:block text-foreground">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-muted/20 p-4 md:p-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
      <OnboardingTour />
    </div>
  )
}
