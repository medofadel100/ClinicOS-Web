'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'pain_scale', labelEn: 'Pain Scale (0-10)', labelAr: 'مقياس الألم (0-10)', type: 'number', width: 'third' },
  { name: 'range_of_motion', labelEn: 'Range of Motion (ROM)', labelAr: 'مدى الحركة', type: 'text', width: 'third' },
  { name: 'muscle_strength', labelEn: 'Muscle Strength', labelAr: 'قوة العضلات', type: 'text', width: 'third' },
  { name: 'treatment_modalities', labelEn: 'Treatment Modalities (US, TENS, etc.)', labelAr: 'طرق العلاج (أجهزة التنبيه والموجات)', type: 'textarea', width: 'half' },
  { name: 'exercises_performed', labelEn: 'Exercises Performed', labelAr: 'التمارين المنفذة بالعيادة', type: 'textarea', width: 'half' },
  { name: 'home_exercise_plan', labelEn: 'Home Exercise Plan', labelAr: 'برنامج التمارين المنزلي', type: 'textarea', width: 'half' },
  { name: 'progress_notes', labelEn: 'Progress Notes', labelAr: 'ملاحظات التحسن', type: 'textarea', width: 'half' },
]

export default function Physiotherapy({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="physical_therapy_sessions"
      titleEn="Physiotherapy Session"
      titleAr="جلسة العلاج الطبيعي"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
