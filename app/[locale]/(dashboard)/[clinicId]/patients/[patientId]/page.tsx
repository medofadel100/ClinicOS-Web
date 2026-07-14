import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MedicalHistoryForm from './MedicalHistoryForm'
import PatientFiles from './PatientFiles'
import { Card, CardContent } from '@/components/ui/card'
import DentalChart from '@/modules/dental/DentalChart'
import BillingTab from './billing/BillingTab'
import { checkEntitlements } from '@/lib/entitlements'
import LockedFeature from '@/components/LockedFeature'

export default async function PatientFilePage({
  params: { locale, clinicId, patientId }
}: {
  params: { locale: string; clinicId: string; patientId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Check access to this patient/clinic
  const { data: patient } = await supabase
    .from('patients')
    .select(`
      *,
      patient_medical_history (*),
      patient_uploaded_files (*),
      treatment_plans (
        *,
        treatment_plan_sessions (*),
        patient_payments (*)
      ),
      appointments (
        *,
        clinic_services ( name ),
        clinic_staff_memberships (
          staff_members ( full_name )
        )
      )
    `)
    .eq('id', patientId)
    .eq('clinic_id', clinicId)
    .single()

  if (!patient) redirect(`/${locale}/${clinicId}/patients`)

  // Check if clinic is a dental clinic
  const { data: clinicData } = await supabase
    .from('clinics')
    .select('clinic_types(name)')
    .eq('id', clinicId)
    .single()

  // Supabase types might infer clinic_types as an array if it's a 1:N or lacks unique constraints. We'll handle both.
  const typeName = Array.isArray(clinicData?.clinic_types) 
    ? clinicData?.clinic_types[0]?.name 
    : (clinicData?.clinic_types as unknown as { name?: string })?.name

  const isDental = typeName && typeName.toLowerCase().includes('dental')

  const entitlements = await checkEntitlements(clinicId)
  const hasDentalModule = entitlements.features.includes('dental_module')

  let dentalEntries = []
  if (isDental && hasDentalModule) {
    const { data } = await supabase
      .from('dental_chart_entries')
      .select('*')
      .eq('patient_id', patientId)
    if (data) dentalEntries = data
  }

  // Use the first record of medical history since it's 1-to-1
  const medicalHistory = patient.patient_medical_history[0] || {}
  const files = patient.patient_uploaded_files || []

  // Compute age
  let age = null
  if (patient.date_of_birth) {
    const dob = new Date(patient.date_of_birth)
    const diff_ms = Date.now() - dob.getTime()
    const age_dt = new Date(diff_ms) 
    age = Math.abs(age_dt.getUTCFullYear() - 1970)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Patient Header */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{patient.full_name}</h1>
            <div className="text-muted-foreground flex items-center gap-4 mt-1 text-sm">
              <span>{patient.phone || 'No phone'}</span>
              {age !== null && <span>• {age} years old</span>}
              {patient.gender && <span className="capitalize">• {patient.gender}</span>}
              <span>• Registered {new Date(patient.registered_at).toLocaleDateString()}</span>
            </div>
            {patient.notes && (
              <p className="text-sm mt-2"><span className="font-medium text-foreground">Notes:</span> {patient.notes}</p>
            )}
          </div>
          {/* Action buttons could go here */}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview & History</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
          {isDental && <TabsTrigger value="chart">Dental Chart</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview">
          <MedicalHistoryForm 
            clinicId={clinicId} 
            patientId={patientId} 
            locale={locale}
            initialData={medicalHistory} 
          />
        </TabsContent>
        
        <TabsContent value="files">
          <PatientFiles 
            clinicId={clinicId} 
            patientId={patientId} 
            locale={locale}
            initialData={files} 
          />
        </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-6">
              {patient.appointments?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No appointments found for this patient.</p>
              ) : (
                <div className="space-y-4">
                  {patient.appointments?.map((app: {
                    id: string
                    scheduled_at: string
                    status: string
                    clinic_services?: { name: string }
                    clinic_staff_memberships?: { staff_members?: { full_name: string } }
                  }) => (
                    <div key={app.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md">
                      <div>
                        <div className="font-semibold text-lg">
                          {new Date(app.scheduled_at).toLocaleDateString()} at {new Date(app.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-muted-foreground text-sm mt-1">
                          Service: {app.clinic_services?.name} • Doctor: {app.clinic_staff_memberships?.staff_members?.full_name}
                        </div>
                      </div>
                      <div className={`capitalize px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0 ${
                        app.status === 'cancelled' || app.status === 'no_show' ? 'bg-destructive/10 text-destructive' :
                        app.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-secondary text-secondary-foreground'
                      }`}>
                        {app.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <BillingTab 
            clinicId={clinicId}
            locale={locale}
            patientId={patientId}
            plans={(patient.treatment_plans as unknown as React.ComponentProps<typeof BillingTab>['plans']) || []}
          />
        </TabsContent>
        
        {isDental && (
          <TabsContent value="chart">
            {hasDentalModule ? (
              <DentalChart 
                clinicId={clinicId}
                locale={locale}
                patientId={patientId}
                initialEntries={dentalEntries}
              />
            ) : (
              <LockedFeature clinicId={clinicId} featureCode="dental_module" featureName="Advanced Dental Module">
                <div className="p-8 border rounded-lg bg-slate-50 min-h-[400px] flex flex-col items-center justify-center opacity-50">
                  <h3 className="text-xl font-bold mb-8">Dental Chart</h3>
                  <div className="flex gap-4 justify-center">
                    <div className="w-10 h-12 bg-white border-2 rounded-t-lg border-slate-200"></div>
                    <div className="w-10 h-12 bg-white border-2 rounded-t-lg border-slate-200"></div>
                    <div className="w-10 h-12 bg-white border-2 rounded-t-lg border-slate-200"></div>
                    <div className="w-10 h-12 bg-white border-2 rounded-t-lg border-slate-200"></div>
                  </div>
                </div>
              </LockedFeature>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
