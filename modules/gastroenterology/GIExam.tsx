'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'abdominal_examination', labelEn: 'Abdominal Examination', labelAr: 'فحص البطن', type: 'textarea', width: 'half' },
  { name: 'endoscopy_notes', labelEn: 'Endoscopy Notes', labelAr: 'ملاحظات المنظار', type: 'textarea', width: 'half' },
  { name: 'colonoscopy_notes', labelEn: 'Colonoscopy Notes', labelAr: 'ملاحظات منظار القولون', type: 'textarea', width: 'half' },
  { name: 'liver_function', labelEn: 'Liver Function', labelAr: 'وظائف الكبد', type: 'text', width: 'half' },
  { name: 'h_pylori_status', labelEn: 'H. Pylori Status', labelAr: 'حالة جرثومة المعدة', type: 'text', width: 'half' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function GIExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="gastro_examinations"
      titleEn="Gastroenterology Exam"
      titleAr="كشف الجهاز الهضمي"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
