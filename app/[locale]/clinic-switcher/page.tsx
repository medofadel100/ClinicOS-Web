import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

interface ClinicMembership {
  clinic_id: string;
  role: string;
  clinics: {
    id: string;
    name: string;
  } | null;
}

export default async function ClinicSwitcherPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const t = await getTranslations('ClinicSwitcher')

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Fetch staff member profile
  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id, preferred_language')
    .eq('auth_user_id', user.id)
    .single()

  // Handle locale redirection based on preference
  if (staffMember && staffMember.preferred_language && staffMember.preferred_language !== locale) {
    redirect(`/${staffMember.preferred_language}/clinic-switcher`)
  }

  // Fetch memberships
  const { data: membershipsData, error } = await supabase
    .from('clinic_staff_memberships')
    .select(`
      clinic_id,
      role,
      clinics (
        id,
        name
      )
    `)
    .eq('is_active', true)
    .eq('staff_member_id', staffMember?.id)

  const memberships = membershipsData as unknown as ClinicMembership[] | null;

  if (error || !memberships) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-destructive">{t('errorLoading')}</p>
      </div>
    )
  }

  // Redirect if exactly 1 clinic
  if (memberships.length === 1) {
    redirect(`/${locale}/${memberships[0].clinic_id}`)
  }

  // Display error if 0 clinics
  if (memberships.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('noClinicsTitle')}</CardTitle>
            <CardDescription>{t('noClinicsDesc')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Display switcher UI if > 1
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m) => (
            <Link key={m.clinic_id} href={`/${locale}/${m.clinic_id}`}>
              <Card className="h-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{m.clinics?.name || 'Unknown Clinic'}</CardTitle>
                  <CardDescription className="capitalize">{m.role}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
