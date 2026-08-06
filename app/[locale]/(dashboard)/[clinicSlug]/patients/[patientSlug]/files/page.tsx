import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from "@/lib/utils/clinic"
import PatientFiles from '../PatientFiles'
import { PremiumCard, PageHeader } from '@/components/layout/PageComponents'
import { FileText } from 'lucide-react'

export default async function PatientFilesPage({
  params: { locale, clinicSlug, patientSlug }
}: {
  params: { locale: string; clinicSlug: string; patientSlug: string }
}) {
  const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  const isAr = locale === 'ar'
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientSlug)
  
  let patientQuery = supabase
    .from('patients')
    .select('*, patient_uploaded_files(*)')
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient } = await patientQuery.single()

  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  // Get storage quota info
  const { data: quotaSetting } = await supabase
    .from('clinic_settings')
    .select('storage_quota_mb')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  const quotaMB = parseInt(quotaSetting?.storage_quota_mb || '15000', 10)

  const files = patient.patient_uploaded_files || []
  const totalUsedBytes = files.reduce((sum: number, f: { file_size?: number }) => sum + (f.file_size || 0), 0)
  const usedMB = Math.round(totalUsedBytes / (1024 * 1024) * 100) / 100

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={isAr ? `ملفات ${patient.full_name}` : `${patient.full_name}'s Files`}
        description={isAr ? 'إدارة المستندات ونتائج الفحوصات والصور الطبية.' : 'Manage documents, test results, and medical images.'}
        icon={FileText}
        iconColor="text-blue-400"
        iconBg="rgba(59,130,246,0.12)"
      />

      {/* Storage Quota Bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">
              {isAr ? 'المساحة المستخدمة' : 'Storage Used'}
            </span>
            <span className="text-xs text-slate-500">
              {usedMB >= 1024 ? `${(usedMB / 1024).toFixed(1)} GB` : `${usedMB} MB`} / {quotaMB >= 1024 ? `${(quotaMB / 1024).toFixed(0)} GB` : `${quotaMB} MB`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (usedMB / quotaMB) * 100)}%`,
                background: (usedMB / quotaMB) > 0.9 ? '#ef4444' : (usedMB / quotaMB) > 0.7 ? '#f59e0b' : '#00d4aa',
              }}
            />
          </div>
        </div>
      </div>
      
      <PremiumCard className="p-6">
        <PatientFiles initialData={files} patientId={patient.id} clinicId={clinicId} locale={locale} />
      </PremiumCard>
    </div>
  )
}
