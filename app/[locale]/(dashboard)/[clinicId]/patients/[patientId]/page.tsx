import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MedicalHistoryForm from './MedicalHistoryForm'
import PatientFiles from './PatientFiles'
import { Card, CardContent } from '@/components/ui/card'
import { PremiumCard } from '@/components/layout/PageComponents'
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
      <PremiumCard>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 
              className="text-3xl font-bold tracking-tight mb-2"
              style={{
                background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {patient.full_name}
            </h1>
            <div className="text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>{patient.phone || 'No phone'}</span>
              {age !== null && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>{age} years old</span>}
              {patient.gender && <span className="flex items-center gap-1.5 capitalize"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{patient.gender}</span>}
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Registered {new Date(patient.registered_at).toLocaleDateString()}</span>
            </div>
            {patient.notes && (
              <p className="text-sm mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="font-semibold text-slate-300">Notes:</span> <span className="text-slate-400">{patient.notes}</span>
              </p>
            )}
          </div>
          {/* Action buttons could go here */}
        </div>
      </PremiumCard>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 w-full h-auto justify-start">
          <TabsTrigger 
            value="overview" 
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#00d4aa] data-[state=active]:text-[#0a0f1e] data-[state=inactive]:bg-white/[0.03] data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-white/[0.08]"
          >
            {locale === 'ar' ? 'نظرة عامة والتاريخ' : 'Overview & History'}
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#00d4aa] data-[state=active]:text-[#0a0f1e] data-[state=inactive]:bg-white/[0.03] data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-white/[0.08]"
          >
            {locale === 'ar' ? 'الملفات' : 'Files'}
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#00d4aa] data-[state=active]:text-[#0a0f1e] data-[state=inactive]:bg-white/[0.03] data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-white/[0.08]"
          >
            {locale === 'ar' ? 'المواعيد' : 'Appointments'}
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#00d4aa] data-[state=active]:text-[#0a0f1e] data-[state=inactive]:bg-white/[0.03] data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-white/[0.08]"
          >
            {locale === 'ar' ? 'الفواتير والباقات' : 'Billing & Plans'}
          </TabsTrigger>
          {isDental && (
            <TabsTrigger 
              value="chart"
              className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#00d4aa] data-[state=active]:text-[#0a0f1e] data-[state=inactive]:bg-white/[0.03] data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-white/[0.08]"
            >
              {locale === 'ar' ? 'رسم الأسنان' : 'Dental Chart'}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <MedicalHistoryForm 
            clinicId={clinicId} 
            patientId={patientId} 
            locale={locale}
            initialData={medicalHistory} 
          />
        </TabsContent>
        
        <TabsContent value="files" className="mt-0">
          <PatientFiles 
            clinicId={clinicId} 
            patientId={patientId} 
            locale={locale}
            initialData={files} 
          />
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-0">
          <PremiumCard>
            <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-base font-semibold text-slate-200">Appointments History</h2>
              <p className="text-sm text-slate-500 mt-0.5">Past and upcoming appointments for this patient.</p>
            </div>
            {patient.appointments?.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No appointments found for this patient.</p>
            ) : (
              <div className="space-y-4">
                {patient.appointments?.map((app: {
                  id: string
                  scheduled_at: string
                  status: string
                  clinic_services?: { name: string }
                  clinic_staff_memberships?: { staff_members?: { full_name: string } }
                }) => (
                  <div key={app.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="font-semibold text-slate-200">
                        {new Date(app.scheduled_at).toLocaleDateString()} at {new Date(app.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        Service: <span className="text-slate-300">{app.clinic_services?.name || 'N/A'}</span> • Doctor: <span className="text-slate-300">{app.clinic_staff_memberships?.staff_members?.full_name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className={`capitalize px-3 py-1 rounded-full text-xs font-semibold mt-2 sm:mt-0 ${
                      app.status === 'cancelled' || app.status === 'no_show' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                    }`}>
                      {app.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-0">
          <BillingTab 
            clinicId={clinicId}
            locale={locale}
            patientId={patientId}
            plans={(patient.treatment_plans as unknown as React.ComponentProps<typeof BillingTab>['plans']) || []}
          />
        </TabsContent>
        
        {isDental && (
          <TabsContent value="chart" className="mt-0">
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
