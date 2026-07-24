'use client'

import { PremiumCard } from '@/components/layout/PageComponents'
import { AlertTriangle, Activity, Pill, Stethoscope, Phone, Calendar } from 'lucide-react'

import EditContextDialog from './EditContextDialog'

export default function PatientSidebarContext({ patient, clinicId, locale }: { patient: any, clinicId: string, locale: string }) {
  const medicalHistory = patient.patient_medical_history?.[0] || {}
  const isAr = locale === 'ar'

  let age = null
  if (patient.date_of_birth) {
    const dob = new Date(patient.date_of_birth)
    const diff_ms = Date.now() - dob.getTime()
    const age_dt = new Date(diff_ms) 
    age = Math.abs(age_dt.getUTCFullYear() - 1970)
  }

  const hasAllergies = medicalHistory.allergies && medicalHistory.allergies.trim().length > 0
  const hasChronic = medicalHistory.systemic_diseases && medicalHistory.systemic_diseases.trim().length > 0
  const hasMeds = medicalHistory.current_medications && medicalHistory.current_medications.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Patient Identity */}
      <PremiumCard className="p-5 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-teal-400">
            {patient.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{patient.full_name}</h2>
        {patient.display_id && (
          <span className="text-xs font-mono font-medium px-2 py-0.5 bg-white/5 text-slate-400 rounded border border-white/10 mt-2">
            #{patient.display_id}
          </span>
        )}
        
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-4">
          {age !== null && (
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {age} {isAr ? 'سنة' : 'yrs'}
            </span>
          )}
          {patient.phone && (
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              {patient.phone}
            </span>
          )}
        </div>
      </PremiumCard>

      {/* Critical Alerts (Allergies) */}
      <PremiumCard className={`p-5 border ${hasAllergies ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${hasAllergies ? 'text-rose-500' : 'text-slate-500'}`} />
            <span className={hasAllergies ? 'text-rose-400' : 'text-slate-400'}>{isAr ? 'الحساسية' : 'Allergies'}</span>
          </h3>
          <EditContextDialog clinicId={clinicId} locale={locale} patientId={patient.id} initialData={medicalHistory} />
        </div>
        {hasAllergies ? (
          <div className="flex flex-wrap gap-2">
            {medicalHistory.allergies.split(',').map((a: string) => (
              <span key={a} className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md text-xs font-bold">
                {a.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{isAr ? 'لا توجد حساسية معروفة' : 'No known allergies'}</p>
        )}
      </PremiumCard>

      {/* Medical Context */}
      <PremiumCard className="p-5 space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2 text-slate-400">
            <Stethoscope className="w-4 h-4 text-orange-400" />
            {isAr ? 'الأمراض المزمنة' : 'Chronic Conditions'}
          </h3>
          {hasChronic ? (
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {medicalHistory.systemic_diseases}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{isAr ? 'لم يتم الإبلاغ' : 'None reported'}</p>
          )}
        </div>

        <div className="h-px bg-white/5" />

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2 text-slate-400">
            <Pill className="w-4 h-4 text-violet-400" />
            {isAr ? 'الأدوية الحالية' : 'Current Meds'}
          </h3>
          {hasMeds ? (
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {medicalHistory.current_medications}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{isAr ? 'لم يتم الإبلاغ' : 'None reported'}</p>
          )}
        </div>
      </PremiumCard>
    </div>
  )
}
