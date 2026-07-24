'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'blood_pressure', labelEn: 'Blood Pressure (e.g. 120/80)', labelAr: 'ضغط الدم', type: 'text', width: 'third' },
  { name: 'heart_rate', labelEn: 'Heart Rate (bpm)', labelAr: 'معدل نبضات القلب', type: 'number', width: 'third' },
  { name: 'ejection_fraction', labelEn: 'Ejection Fraction (%)', labelAr: 'الكفاءة القلبية (EF%)', type: 'number', width: 'third' },
  { name: 'ecg_notes', labelEn: 'ECG Notes', labelAr: 'ملاحظات رسم القلب (ECG)', type: 'textarea', width: 'half' },
  { name: 'echocardiogram_notes', labelEn: 'Echocardiogram Notes', labelAr: 'ملاحظات الإيكو', type: 'textarea', width: 'half' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function CardiacExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="cardiology_examinations"
      titleEn="Cardiac Exam"
      titleAr="كشف القلب"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
