'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'ear_findings', labelEn: 'Ear Findings', labelAr: 'فحص الأذن', type: 'textarea', width: 'third' },
  { name: 'nose_findings', labelEn: 'Nose Findings', labelAr: 'فحص الأنف', type: 'textarea', width: 'third' },
  { name: 'throat_findings', labelEn: 'Throat Findings', labelAr: 'فحص الحنجرة', type: 'textarea', width: 'third' },
  { name: 'hearing_test', labelEn: 'Hearing Test Result', labelAr: 'نتيجة اختبار السمع', type: 'text', width: 'half' },
  { name: 'audiometry_notes', labelEn: 'Audiometry Notes', labelAr: 'ملاحظات مقياس السمع', type: 'textarea', width: 'half' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function ENTExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="ent_examinations"
      titleEn="ENT Exam"
      titleAr="كشف الأنف والأذن والحنجرة"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
