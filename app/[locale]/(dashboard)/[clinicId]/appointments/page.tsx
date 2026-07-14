import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import BookAppointmentDialog from './BookAppointmentDialog'
import WaitlistManagement from './WaitlistManagement'
import AppointmentStatusSelect from './AppointmentStatusSelect'
import RescheduleAppointmentDialog from './RescheduleAppointmentDialog'

export default async function AppointmentsPage({
  params: { locale, clinicId },
  searchParams
}: {
  params: { locale: string; clinicId: string },
  searchParams: { date?: string; doctor?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Default to today
  const targetDate = searchParams.date || new Date().toISOString().split('T')[0]

  // Fetch appointments for this clinic on the target date
  // Since scheduled_at is timestamptz, we query >= startOfDay and < startOfNextDay
  const startOfDay = new Date(targetDate)
  startOfDay.setUTCHours(0,0,0,0)
  const endOfDay = new Date(targetDate)
  endOfDay.setUTCHours(23,59,59,999)

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients ( full_name, phone ),
      clinic_staff_memberships (
        staff_members ( full_name )
      ),
      clinic_services ( name )
    `)
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  if (searchParams.doctor) {
    query = query.eq('membership_id', searchParams.doctor)
  }

  const { data: appointments } = await query

  // Fetch doctors and services and patients for the booking dialog
  const { data: doctors } = await supabase
    .from('clinic_staff_memberships')
    .select(`id, staff_members(full_name)`)
    .eq('clinic_id', clinicId)
    .eq('role', 'doctor')
    .eq('is_active', true)

  const { data: services } = await supabase
    .from('clinic_services')
    .select('id, name, duration_minutes')
    .eq('clinic_id', clinicId)

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('clinic_id', clinicId)

  // Fetch waitlist
  const { data: waitlist } = await supabase
    .from('patient_waitlist')
    .select(`
      *,
      patients(full_name),
      clinic_staff_memberships(staff_members(full_name))
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  // Type casting to satisfy strict ESLint rules
  type Doctor = { id: string; staff_members: { full_name: string } }
  type Service = { id: string; name: string; duration_minutes: number }
  type Patient = { id: string; full_name: string }
  type WaitlistEntry = {
    id: string
    status: string
    desired_from: string
    desired_to: string
    patients?: { full_name: string }
    clinic_staff_memberships?: { staff_members?: { full_name: string } }
  }

  const typedDoctors = (doctors || []) as unknown as Doctor[]
  const typedServices = (services || []) as unknown as Service[]
  const typedPatients = (patients || []) as unknown as Patient[]
  const typedWaitlist = (waitlist || []) as unknown as WaitlistEntry[]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your clinic&apos;s schedule.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Simple date picker nav for MVP */}
          <form className="flex items-center gap-2" method="GET">
            <input 
              type="date" 
              name="date" 
              defaultValue={targetDate} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
              onChange={(e) => {
                // Auto-submit on date change
                e.target.form?.submit()
              }}
            />
            {typedDoctors.length > 0 && (
              <select
                name="doctor"
                defaultValue={searchParams.doctor || ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  e.target.form?.submit()
                }}
              >
                <option value="">All Doctors</option>
                {typedDoctors.map(d => (
                  <option key={d.id} value={d.id}>{d.staff_members.full_name}</option>
                ))}
              </select>
            )}
          </form>

          <BookAppointmentDialog 
            clinicId={clinicId} 
            locale={locale} 
            doctors={typedDoctors} 
            services={typedServices} 
            patients={typedPatients} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule for {new Date(targetDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No appointments scheduled for this day.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments?.map(app => {
                      const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      return (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{time}</TableCell>
                          <TableCell>
                            <a href={`/${locale}/${clinicId}/patients/${app.patient_id}`} className="text-primary hover:underline">
                              {app.patients?.full_name}
                            </a>
                          </TableCell>
                          <TableCell>{app.clinic_staff_memberships?.staff_members?.full_name}</TableCell>
                          <TableCell>{app.clinic_services?.name}</TableCell>
                          <TableCell className="flex gap-2 items-center">
                            <AppointmentStatusSelect 
                              appointmentId={app.id} 
                              clinicId={clinicId} 
                              locale={locale} 
                              initialStatus={app.status} 
                            />
                            {app.status === 'scheduled' && (
                              <RescheduleAppointmentDialog
                                appointmentId={app.id}
                                clinicId={clinicId}
                                locale={locale}
                                initialDate={targetDate}
                                initialTime={new Date(app.scheduled_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
