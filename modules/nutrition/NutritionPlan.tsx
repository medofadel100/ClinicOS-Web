'use client'

import BaseSpecialtyExam, { FieldConfig } from '@/components/patients/BaseSpecialtyExam'

const fields: FieldConfig[] = [
  { name: 'weight_kg', labelEn: 'Current Weight (kg)', labelAr: 'الوزن الحالي (كجم)', type: 'number', width: 'third' },
  { name: 'height_cm', labelEn: 'Height (cm)', labelAr: 'الطول (سم)', type: 'number', width: 'third' },
  { name: 'bmi', labelEn: 'BMI', labelAr: 'مؤشر كتلة الجسم', type: 'number', width: 'third' },
  { name: 'target_weight', labelEn: 'Target Weight (kg)', labelAr: 'الوزن المستهدف', type: 'number', width: 'third' },
  { name: 'daily_calories', labelEn: 'Daily Calories Target', labelAr: 'السعرات الحرارية اليومية', type: 'number', width: 'third' },
  { name: 'water_intake', labelEn: 'Water Intake (Liters)', labelAr: 'شرب الماء (لتر)', type: 'number', width: 'third' },
  { name: 'diet_type', labelEn: 'Diet Type (Keto, Low-Carb, etc.)', labelAr: 'نوع النظام الغذائي', type: 'text', width: 'half' },
  { name: 'dietary_restrictions', labelEn: 'Dietary Restrictions', labelAr: 'ممنوعات الطعام / حساسية', type: 'text', width: 'half' },
  { name: 'meal_plan', labelEn: 'Meal Plan', labelAr: 'خطة الوجبات', type: 'textarea', width: 'full' },
  { name: 'supplements', labelEn: 'Supplements', labelAr: 'المكملات الغذائية', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'Progress Notes', labelAr: 'ملاحظات التقدم', type: 'textarea', width: 'half' },
]

export default function NutritionPlan({ clinicId, locale, patientId, initialEntries }: any) {
  return (
    <BaseSpecialtyExam
      clinicId={clinicId}
      locale={locale}
      patientId={patientId}
      tableName="nutrition_plans"
      titleEn="Clinical Nutrition Plan"
      titleAr="خطة التغذية العلاجية"
      fields={fields}
      initialEntries={initialEntries || []}
    />
  )
}
