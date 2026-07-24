'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'neurological_exam', labelEn: 'Neurological Exam Notes', labelAr: 'ملاحظات الفحص العصبي', type: 'textarea', width: 'full' },
  { name: 'imaging_review', labelEn: 'Imaging Review (MRI, CT Scan)', labelAr: 'مراجعة الأشعة (رنين، مقطعية)', type: 'textarea', width: 'full' },
  { name: 'surgery_type', labelEn: 'Proposed Surgery Type', labelAr: 'نوع الجراحة المقترحة', type: 'text', width: 'half' },
  { name: 'surgical_risks', labelEn: 'Surgical Risks Discussed', labelAr: 'مخاطر الجراحة التي تمت مناقشتها', type: 'textarea', width: 'half' },
  { name: 'post_op_notes', labelEn: 'Post-Operative Notes', labelAr: 'ملاحظات ما بعد العملية', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'General Clinical Notes', labelAr: 'ملاحظات طبية عامة', type: 'textarea', width: 'half' },
]

export default function NeurosurgeryNotes({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="neurosurgery_notes"
      titleEn="Neurosurgery Notes"
      titleAr="ملاحظات جراحة الأعصاب"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
