import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumCard, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { Calendar, Clock } from 'lucide-react'
import BookAppointmentDialog from './BookAppointmentDialog'
import WaitlistManagement from './WaitlistManagement'
import AppointmentStatusSelect from './AppointmentStatusSelect'
import RescheduleAppointmentDialog from './RescheduleAppointmentDialog'
import AppointmentFilters from './AppointmentFilters'
import CalendarView from './CalendarView'
import AppointmentsTable from './AppointmentsTable'
import { requireClinicId } from "@/lib/utils/clinic";

export default async function AppointmentsPage({
      params: { locale, clinicSlug },
      searchParams
    }: {
              params: { locale: string; clinicSlug: string },
              searchParams: { date?: string; doctor?: string }
            }) {
    const clinicId = await requireClinicId(clinicSlug);
  const isAr = locale === 'ar';
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const targetDate = searchParams.date || new Date().toISOString().split('T')[0]

  const startOfDay = new Date(targetDate)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setUTCHours(23, 59, 59, 999)

  let query = supabase
    .from('appointments')
    .select(`*, patients ( full_name, phone ), clinic_staff_memberships ( staff_members ( full_name ) ), clinic_services ( name )`)
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  if (searchParams.doctor) {
    query = query.eq('membership_id', searchParams.doctor)
  }

  const { data: appointments } = await query

  const { data: doctors } = await supabase
    .from('clinic_staff_memberships')
    .select(`id, staff_members(full_name)`)
    .eq('clinic_id', clinicId)
    .in('role', ['doctor', 'owner'])
    .eq('is_active', true)

  const { data: services } = await supabase
    .from('clinic_services')
    .select('id, name, duration_minutes, price')
    .eq('clinic_id', clinicId)

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name, phone, date_of_birth, gender')
    .eq('clinic_id', clinicId)

  const { data: waitlist } = await supabase
    .from('patient_waitlist')
    .select(`*, patients(full_name), clinic_staff_memberships(staff_members(full_name))`)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  type Doctor = { id: string; staff_members: { full_name: string } }
  type Service = { id: string; name: string; duration_minutes: number; price: number }
  type Patient = { id: string; full_name: string; phone?: string; date_of_birth?: string; gender?: string }
  type WaitlistEntry = {
    id: string; status: string; desired_from: string; desired_to: string;
    patients?: { full_name: string }
    clinic_staff_memberships?: { staff_members?: { full_name: string } }
  }

  const typedDoctors = (doctors || []) as unknown as Doctor[]
  const typedServices = (services || []) as unknown as Service[]
  const typedPatients = (patients || []) as unknown as Patient[]
  const typedWaitlist = (waitlist || []) as unknown as WaitlistEntry[]

  const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isAr ? 'المواعيد' : 'Appointments'}
        description={isAr ? `جدول ${formattedDate}` : `Schedule for ${formattedDate}`}
        icon={Calendar}
        iconColor="text-blue-400"
        iconBg="rgba(59,130,246,0.12)"
        badge={isAr ? `${appointments?.length ?? 0} اليوم` : `${appointments?.length ?? 0} today`}
        actions={
          <div className="flex items-center gap-2">
            <AppointmentFilters
              targetDate={targetDate}
              doctors={typedDoctors}
              selectedDoctor={searchParams.doctor || ''}
            />
            <BookAppointmentDialog
              clinicId={clinicId}
              locale={locale}
              doctors={typedDoctors}
              services={typedServices}
              patients={typedPatients}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main appointments Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Calendar */}
          <CalendarView 
            targetDate={targetDate}
            appointments={appointments || []}
            locale={locale}
          />
          
          <PremiumTableWrapper>
            <AppointmentsTable
              appointments={(appointments || []) as any[]}
              clinicId={clinicId}
              clinicSlug={clinicSlug}
              locale={locale}
              isAr={isAr}
              targetDate={targetDate}
            />
          </PremiumTableWrapper>
        </div>

        {/* Waitlist */}
        <div>
          <WaitlistManagement
            clinicId={clinicId}
            locale={locale}
            waitlist={typedWaitlist}
            patients={typedPatients}
            doctors={typedDoctors}
          />
        </div>
      </div>
    </div>
  )
}
