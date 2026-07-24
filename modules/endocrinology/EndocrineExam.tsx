'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'fasting_glucose', labelEn: 'Fasting Glucose', labelAr: 'سكر صائم', type: 'number', width: 'third' },
  { name: 'hba1c', labelEn: 'HbA1c (%)', labelAr: 'السكر التراكمي', type: 'number', width: 'third' },
  { name: 'cortisol_level', labelEn: 'Cortisol Level', labelAr: 'مستوى الكورتيزول', type: 'number', width: 'third' },
  { name: 'thyroid_tsh', labelEn: 'TSH', labelAr: 'هرمون TSH', type: 'number', width: 'third' },
  { name: 'thyroid_t3', labelEn: 'T3', labelAr: 'هرمون T3', type: 'number', width: 'third' },
  { name: 'thyroid_t4', labelEn: 'T4', labelAr: 'هرمون T4', type: 'number', width: 'third' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function EndocrineExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="endocrine_examinations"
      titleEn="Endocrine Exam"
      titleAr="كشف الغدد الصماء"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
