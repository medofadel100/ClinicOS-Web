import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GeneralSettingsTab from './GeneralSettingsTab'
import DoctorsTab from './DoctorsTab'
import ServicesTab from './ServicesTab'
import StaffSettingsTab from './StaffSettingsTab'

export default async function SettingsPage({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  // Ensure user is an owner
  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) redirect(`/${locale}/clinic-switcher`)

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership || membership.role !== 'owner') {
    redirect(`/${locale}/${clinicId}`)
  }

  // Fetch initial data
  const { data: clinicSettings } = await supabase
    .from('clinic_settings')
    .select('*')
    .eq('clinic_id', clinicId)
    .single()

  const { data: doctors } = await supabase
    .from('doctor_profiles')
    .select(`
      id,
      bio,
      specialty,
      staff_member_id,
      staff_members (
        id,
        full_name,
        phone
      ),
      doctor_working_hours (
        id,
        day_of_week,
        start_time,
        end_time,
        is_active
      )
    `)
    .eq('clinic_id', clinicId)

  const { data: serviceCategories } = await supabase
    .from('service_categories')
    .select(`
      id,
      name,
      order_index,
      clinic_services (
        id,
        name,
        description,
        price,
        duration_minutes
      )
    `)
    .eq('clinic_id', clinicId)
    .order('order_index', { ascending: true })

  const { data: staffMemberships } = await supabase
    .from('clinic_staff_memberships')
    .select(`
      id,
      role,
      staff_members (
        id,
        full_name
      ),
      staff_payroll_config (*)
    `)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Settings</h1>
        <p className="text-muted-foreground">Manage your clinic profile, doctors, and services.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="staff">Staff & Payroll</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="services">Services Catalog</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsTab clinicId={clinicId} initialData={clinicSettings} />
        </TabsContent>
        <TabsContent value="staff" className="space-y-4">
          {/* @ts-expect-error Supabase inference mismatch */}
          <StaffSettingsTab clinicId={clinicId} staffMemberships={staffMemberships || []} />
        </TabsContent>
        <TabsContent value="doctors" className="space-y-4">
          {/* @ts-expect-error Supabase inference mismatch */}
          <DoctorsTab clinicId={clinicId} initialData={doctors || []} availableStaff={staffMemberships?.map(m => m.staff_members) || []} />
        </TabsContent>
        <TabsContent value="services" className="space-y-4">
          <ServicesTab clinicId={clinicId} initialData={serviceCategories || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
