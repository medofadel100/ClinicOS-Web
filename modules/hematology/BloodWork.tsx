'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'hemoglobin', labelEn: 'Hemoglobin (g/dL)', labelAr: 'الهيموجلوبين', type: 'number', width: 'third' },
  { name: 'wbc_count', labelEn: 'WBC Count', labelAr: 'كرات الدم البيضاء', type: 'number', width: 'third' },
  { name: 'platelet_count', labelEn: 'Platelet Count', labelAr: 'الصفائح الدموية', type: 'number', width: 'third' },
  { name: 'cbc_results', labelEn: 'Full CBC Results', labelAr: 'نتائج صورة الدم الكاملة', type: 'textarea', width: 'half' },
  { name: 'coagulation_profile', labelEn: 'Coagulation Profile (PT/PTT)', labelAr: 'عوامل التجلط', type: 'textarea', width: 'half' },
  { name: 'blood_smear_notes', labelEn: 'Blood Smear Notes', labelAr: 'ملاحظات مسحة الدم', type: 'textarea', width: 'full' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function BloodWork({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="hematology_notes"
      titleEn="Blood Work & Hematology"
      titleAr="فحوصات أمراض الدم"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
