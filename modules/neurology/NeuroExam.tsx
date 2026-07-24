'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'chief_complaint', labelEn: 'Chief Complaint', labelAr: 'الشكوى الرئيسية', type: 'textarea', width: 'full' },
  { name: 'mental_status', labelEn: 'Mental Status', labelAr: 'الحالة الذهنية', type: 'text', width: 'half' },
  { name: 'cranial_nerves', labelEn: 'Cranial Nerves', labelAr: 'الأعصاب القحفية', type: 'text', width: 'half' },
  { name: 'motor_function', labelEn: 'Motor Function', labelAr: 'الوظيفة الحركية', type: 'text', width: 'half' },
  { name: 'sensory_function', labelEn: 'Sensory Function', labelAr: 'الوظيفة الحسية', type: 'text', width: 'half' },
  { name: 'reflexes', labelEn: 'Reflexes', labelAr: 'ردود الفعل (Reflexes)', type: 'text', width: 'half' },
  { name: 'coordination', labelEn: 'Coordination', labelAr: 'التناسق الحركي', type: 'text', width: 'half' },
  { name: 'eeg_notes', labelEn: 'EEG Notes', labelAr: 'ملاحظات رسم المخ (EEG)', type: 'textarea', width: 'half' },
  { name: 'mri_notes', labelEn: 'MRI / CT Notes', labelAr: 'ملاحظات الرنين / الأشعة المقطعية', type: 'textarea', width: 'half' },
  { name: 'diagnosis', labelEn: 'Diagnosis', labelAr: 'التشخيص', type: 'textarea', width: 'half' },
  { name: 'treatment', labelEn: 'Treatment', labelAr: 'العلاج', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Additional Notes', labelAr: 'ملاحظات إضافية', type: 'textarea', width: 'full' },
]

export default function NeuroExam({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="neurology_examinations"
      titleEn="Neurological Exam"
      titleAr="كشف الأعصاب"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
