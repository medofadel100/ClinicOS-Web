'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'

interface MedicalHistoryData {
  systemic_diseases?: string | null
  allergies?: string | null
  current_medications?: string | null
  notes?: string | null
}

export default function MedicalHistoryForm({ 
  clinicId, 
  patientId, 
  locale,
  initialData 
}: { 
  clinicId: string
  patientId: string
  locale: string
  initialData: MedicalHistoryData
}) {
  const [loading, setLoading] = useState(false)

  const isAr = locale === 'ar'

  const t = {
    title: isAr ? 'التاريخ الطبي' : 'Medical History',
    desc: isAr ? 'تحديث الحالات الطبية الأساسية للمريض.' : "Update the patient's basic medical conditions.",
    systemicDiseases: isAr ? 'الأمراض الجهازية' : 'Systemic Diseases',
    systemicDiseasesPlaceholder: isAr ? 'مثل السكري، ارتفاع ضغط الدم...' : 'e.g. Diabetes, Hypertension...',
    allergies: isAr ? 'الحساسية' : 'Allergies',
    allergiesPlaceholder: isAr ? 'مثل البنسلين، الفول السوداني...' : 'e.g. Penicillin, Peanuts...',
    currentMedications: isAr ? 'الأدوية الحالية' : 'Current Medications',
    currentMedicationsPlaceholder: isAr ? 'مثل الميتفورمين 500 ملغ...' : 'e.g. Metformin 500mg...',
    additionalNotes: isAr ? 'ملاحظات إضافية' : 'Additional Notes',
    additionalNotesPlaceholder: isAr ? 'أي معلومات طبية أخرى ذات صلة...' : 'Any other relevant medical info...',
    save: isAr ? 'حفظ التغييرات' : 'Save Changes',
    success: isAr ? 'تم تحديث التاريخ الطبي بنجاح' : 'Medical history updated successfully',
    error: isAr ? 'فشل في تحديث التاريخ الطبي' : 'Failed to update medical history'
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const { updateMedicalHistory } = await import('../actions')
      await updateMedicalHistory(patientId, clinicId, locale, formData)
      alert(t.success)
    } catch (err) {
      console.error(err)
      alert(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PremiumCard>
      <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">{t.title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t.desc}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="systemic_diseases">{t.systemicDiseases}</label>
          <textarea 
            id="systemic_diseases" 
            name="systemic_diseases" 
            defaultValue={initialData?.systemic_diseases || ''} 
            placeholder={t.systemicDiseasesPlaceholder}
            className="w-full min-h-[80px] p-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-y"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="allergies">{t.allergies}</label>
          <textarea 
            id="allergies" 
            name="allergies" 
            defaultValue={initialData?.allergies || ''} 
            placeholder={t.allergiesPlaceholder}
            className="w-full min-h-[80px] p-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-y"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="current_medications">{t.currentMedications}</label>
          <textarea 
            id="current_medications" 
            name="current_medications" 
            defaultValue={initialData?.current_medications || ''} 
            placeholder={t.currentMedicationsPlaceholder}
            className="w-full min-h-[80px] p-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-y"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="notes">{t.additionalNotes}</label>
          <textarea 
            id="notes" 
            name="notes" 
            defaultValue={initialData?.notes || ''} 
            placeholder={t.additionalNotesPlaceholder}
            className="w-full min-h-[80px] p-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-y"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="h-10 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: '#00d4aa', color: '#0a0f1e' }}
          >
            {loading ? '...' : t.save}
          </button>
        </div>
      </form>
    </PremiumCard>
  )
}
