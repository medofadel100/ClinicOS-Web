'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'cancer_type', labelEn: 'Cancer Type', labelAr: 'نوع الورم', type: 'text', width: 'half' },
  { name: 'cancer_stage', labelEn: 'Cancer Stage', labelAr: 'مرحلة الورم', type: 'text', width: 'half' },
  { name: 'tumor_location', labelEn: 'Tumor Location', labelAr: 'موقع الورم', type: 'text', width: 'half' },
  { name: 'treatment_type', labelEn: 'Treatment Type', labelAr: 'نوع العلاج', type: 'text', width: 'half' },
  { name: 'chemotherapy_cycle', labelEn: 'Chemotherapy Cycle', labelAr: 'جلسة العلاج الكيماوي رقم', type: 'number', width: 'half' },
  { name: 'radiation_sessions', labelEn: 'Radiation Sessions Count', labelAr: 'عدد جلسات الإشعاع', type: 'number', width: 'half' },
  { name: 'performance_status', labelEn: 'Performance Status (ECOG)', labelAr: 'الحالة العامة (ECOG)', type: 'text', width: 'half' },
  { name: 'lab_results', labelEn: 'Lab Results / Tumor Markers', labelAr: 'نتائج التحاليل و دلالات الأورام', type: 'textarea', width: 'full' },
  { name: 'imaging_notes', labelEn: 'Imaging Notes (PET/CT)', labelAr: 'ملاحظات الأشعة (PET/CT)', type: 'textarea', width: 'full' },
  { name: 'notes', labelEn: 'Clinical Notes', labelAr: 'ملاحظات طبية', type: 'textarea', width: 'full' },
]

export default function OncologyNotes({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="oncology_notes"
      titleEn="Oncology Notes"
      titleAr="ملاحظات الأورام"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
