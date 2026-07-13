import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MedicalHistoryForm from './MedicalHistoryForm'
import PatientFiles from './PatientFiles'
import { Card, CardContent } from '@/components/ui/card'

export default async function PatientFilePage({
  params: { locale, clinicId, patientId }
}: {
  params: { locale: string; clinicId: string; patientId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Check access to this patient/clinic
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select(`
      *,
      patient_medical_history (*),
      patient_uploaded_files (*)
    `)
    .eq('id', patientId)
    .eq('clinic_id', clinicId)
    .single()

  if (patientError || !patient) {
    redirect(`/${locale}/${clinicId}/patients`)
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
        <TabsList>
          <TabsTrigger value="overview">Overview & History</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="chart">Dental Chart</TabsTrigger>
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
            <CardContent className="p-12 text-center text-muted-foreground">
              Appointments module will be available in Checkpoint 4.
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Dental Chart module will be available in Checkpoint 5.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
