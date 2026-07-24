'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'oxygen_saturation', labelEn: 'SpO2 (%)', labelAr: 'نسبة الأكسجين', type: 'number', width: 'third' },
  { name: 'respiratory_rate', labelEn: 'Respiratory Rate', labelAr: 'معدل التنفس', type: 'number', width: 'third' },
  { name: 'peak_flow', labelEn: 'Peak Flow', labelAr: 'تدفق الهواء الأقصى', type: 'number', width: 'third' },
  { name: 'lung_sounds', labelEn: 'Lung Sounds', labelAr: 'أصوات الرئة', type: 'text', width: 'half' },
  { name: 'pulmonary_function_test', labelEn: 'Pulmonary Function Test', labelAr: 'وظائف الرئة', type: 'text', width: 'half' },
  { name: 'chest_xray_notes', labelEn: 'Chest X-Ray Notes', labelAr: 'ملاحظات أشعة الصدر', type: 'textarea', width: 'full' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function PulmonaryExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="pulmonology_examinations"
      titleEn="Pulmonary Exam"
      titleAr="كشف الصدرية"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
