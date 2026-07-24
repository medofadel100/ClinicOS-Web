'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'psa_level', labelEn: 'PSA Level (ng/mL)', labelAr: 'تحليل البروستاتا (PSA)', type: 'number', width: 'half' },
  { name: 'urinalysis_result', labelEn: 'Urinalysis Result', labelAr: 'نتيجة تحليل البول', type: 'text', width: 'half' },
  { name: 'ultrasound_notes', labelEn: 'Ultrasound Notes', labelAr: 'ملاحظات الأشعة التلفزيونية (الموجات فوق الصوتية)', type: 'textarea', width: 'full' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function UrologyExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="urology_examinations"
      titleEn="Urology Exam"
      titleAr="كشف المسالك البولية"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
