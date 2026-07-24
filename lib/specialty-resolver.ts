export type SpecialtyCode =
  | 'dental'
  | 'orthopedics'
  | 'ophthalmology'
  | 'dermatology'
  | 'pediatrics'
  | 'obstetrics_gynecology'
  | 'cardiology'
  | 'neurology'
  | 'general_practice'
  | 'urology'
  | 'ent'
  | 'psychology'
  | 'pulmonology'
  | 'gastroenterology'
  | 'endocrinology'
  | 'oncology'
  | 'hematology'
  | 'clinical_nutrition'
  | 'neurosurgery'
  | 'medical_center'
  | 'physical_therapy'

export type SpecialtyModule = {
  code: SpecialtyCode
  hasSpecialtyTab: boolean
  tabLabel: { en: string; ar: string }
  tabIcon: string
  featureCode: string | null
}

const SPECIALTY_MODULE_MAP: Record<string, SpecialtyModule> = {
  dental: {
    code: 'dental',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Dental Chart', ar: 'رسم الأسنان' },
    tabIcon: 'Tooth',
    featureCode: 'dental_module',
  },
  orthopedics: {
    code: 'orthopedics',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Orthopedic Exam', ar: 'كشف عظمى' },
    tabIcon: 'Bone',
    featureCode: 'orthopedics_module',
  },
  ophthalmology: {
    code: 'ophthalmology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Eye Exam', ar: 'كشف عيون' },
    tabIcon: 'Eye',
    featureCode: 'ophthalmology_module',
  },
  dermatology: {
    code: 'dermatology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Skin Map', ar: 'خريطة الجلد' },
    tabIcon: 'ScanFace',
    featureCode: 'dermatology_module',
  },
  pediatrics: {
    code: 'pediatrics',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Growth & Development', ar: 'النمو والتطور' },
    tabIcon: 'Baby',
    featureCode: 'pediatrics_module',
  },
  obstetrics_gynecology: {
    code: 'obstetrics_gynecology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'OB/GYN Exam', ar: 'كشف نساء' },
    tabIcon: 'Heart',
    featureCode: 'obgyn_module',
  },
  cardiology: {
    code: 'cardiology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Cardiac Exam', ar: 'كشف قلب' },
    tabIcon: 'HeartPulse',
    featureCode: 'cardiology_module',
  },
  neurology: {
    code: 'neurology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Neuro Exam', ar: 'كشف أعصاب' },
    tabIcon: 'Brain',
    featureCode: 'neurology_module',
  },
  general_practice: {
    code: 'general_practice',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Vital Signs', ar: 'العلامات الحيوية' },
    tabIcon: 'Activity',
    featureCode: 'vital_signs_module',
  },
  urology: {
    code: 'urology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Urology Exam', ar: 'كشف مسالك بولية' },
    tabIcon: 'Droplets',
    featureCode: 'urology_module',
  },
  ent: {
    code: 'ent',
    hasSpecialtyTab: true,
    tabLabel: { en: 'ENT Exam', ar: 'كشف أنف وأذن وحنجرة' },
    tabIcon: 'Ear',
    featureCode: 'ent_module',
  },
  psychology: {
    code: 'psychology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Session Notes', ar: 'محاضر الجلسات' },
    tabIcon: 'Brain',
    featureCode: 'psychology_module',
  },
  pulmonology: {
    code: 'pulmonology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Pulmonary Exam', ar: 'كشف صدرية' },
    tabIcon: 'Wind',
    featureCode: 'pulmonology_module',
  },
  gastroenterology: {
    code: 'gastroenterology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'GI Exam', ar: 'كشف جهاز هضمي' },
    tabIcon: 'Stethoscope',
    featureCode: 'gi_module',
  },
  endocrinology: {
    code: 'endocrinology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Endocrine Exam', ar: 'كشف غدد صماء' },
    tabIcon: 'FlaskConical',
    featureCode: 'endocrine_module',
  },
  oncology: {
    code: 'oncology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Oncology Notes', ar: 'ملاحظات الأورام' },
    tabIcon: 'Ribbon',
    featureCode: 'oncology_module',
  },
  hematology: {
    code: 'hematology',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Blood Work', ar: 'فحوصات الدم' },
    tabIcon: 'Droplet',
    featureCode: 'hematology_module',
  },
  clinical_nutrition: {
    code: 'clinical_nutrition',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Nutrition Plan', ar: 'خطة التغذية' },
    tabIcon: 'Apple',
    featureCode: 'nutrition_module',
  },
  neurosurgery: {
    code: 'neurosurgery',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Neurosurgery Notes', ar: 'ملاحظات جراحة أعصاب' },
    tabIcon: 'BrainCircuit',
    featureCode: 'neurosurgery_module',
  },
  medical_center: {
    code: 'medical_center',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Vital Signs', ar: 'العلامات الحيوية' },
    tabIcon: 'Activity',
    featureCode: 'vital_signs_module',
  },
  physical_therapy: {
    code: 'physical_therapy',
    hasSpecialtyTab: true,
    tabLabel: { en: 'Physiotherapy', ar: 'العلاج الطبيعي' },
    tabIcon: 'Dumbbell',
    featureCode: 'physical_therapy_module',
  },
}

export function resolveSpecialty(code: string | undefined | null): SpecialtyModule | null {
  if (!code) return null
  return SPECIALTY_MODULE_MAP[code.toLowerCase()] || null
}

export function getSpecialtyCodeFromClinic(clinicTypeCode: string): SpecialtyCode | null {
  const code = clinicTypeCode.toLowerCase()
  if (code in SPECIALTY_MODULE_MAP) return code as SpecialtyCode
  return null
}

export const ALL_SPECIALTY_CODES = Object.keys(SPECIALTY_MODULE_MAP) as SpecialtyCode[]
