export type PatientRecord = {
  id: string
  display_id: string | null
  clinic_id: string
  full_name: string
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  notes: string | null
  marketing_campaign_id: string | null
  created_by: string | null
  registered_at: string
}

export type Entitlements = {
  features: string[]
  limits: Record<string, number>
  plan: string
}

export type VitalsRecord = {
  id: string
  clinic_id: string
  patient_id: string
  content: {
    bp?: string
    hr?: string
    temp?: string
    weight?: string
  }
  recorded_at: string
}

export type ClinicalNote = {
  id: string
  clinic_id: string
  patient_id: string
  note_type: string
  content: Record<string, unknown>
  created_at: string
}

export type StaffMember = {
  id: string
  full_name: string
  auth_user_id: string | null
}

export type ClinicStaffMembership = {
  id: string
  role: string
  is_active: boolean
  staff_member_id: string
  staff_members?: StaffMember
}

export type AttendanceRecord = {
  id: string
  membership_id: string
  work_date: string
  check_in_at: string | null
  check_out_at: string | null
  status: string
  clinic_staff_memberships?: ClinicStaffMembership
}

export type PayrollRun = {
  id: string
  period_month: string
  base_salary_egp: number
  net_pay_egp: number
  status: string
  clinic_staff_memberships?: ClinicStaffMembership
}

export type MedicationSearchResult = {
  type: string
  clinic_medication_id: string | null
  medication_global_id: string | null
  brandName: string
  genericName: string
  dosage: string
  frequency: string
  duration: string
  original: Record<string, unknown>
}

export type PrescriptionTemplate = {
  id: string
  template_name: string
  created_at: string
  prescription_template_items: PrescriptionTemplateItem[]
}

export type PrescriptionTemplateItem = {
  id: string
  clinic_medication_id: string
  dosage: string
  frequency: string
  timing: string
  duration: string
  instructions: string
  clinic_medications?: {
    custom_brand_name?: string
    custom_generic_name?: string
    medications_global?: {
      brand_name_en?: string
      brand_name_ar?: string
      generic_name?: string
    }
  }
}
