export interface Pin {
  id: string
  x: number
  y: number
  view: 'anterior' | 'posterior'
  condition: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
  date: string
}

export interface LaserSession {
  id: string
  session_number: number
  total_sessions: number
  treatment_area: string
  laser_type: 'hair_removal' | 'fractional' | 'ipl' | 'nd_yag' | 'co2' | 'diode' | 'alexandrite' | 'hifu' | 'cryo' | 'other'
  device_name: string
  energy_joules?: number
  power_watts?: number
  spot_size_mm?: number
  pulse_duration_ms?: number
  frequency_hz?: number
  cooling_type?: string
  skin_type_fitzpatrick?: number
  session_date: string
  next_session_date?: string
  pre_treatment_notes?: string
  post_treatment_notes?: string
  side_effects?: string
  patient_satisfaction?: number
  status: 'completed' | 'scheduled' | 'cancelled'
}

export interface InjectableRecord {
  id: string
  type: 'botox' | 'filler' | 'prp' | 'mesotherapy' | 'biorevitalization' | 'skin_booster' | 'other'
  product_name: string
  product_brand?: string
  quantity_ml?: number
  units?: number
  treatment_area: string
  injection_sites?: string
  injection_depth?: string
  session_date: string
  next_session_date?: string
  dilution?: string
  reconstitution_ratio?: string
  needle_gauge?: string
  notes?: string
  complications?: string
  status: 'completed' | 'scheduled' | 'cancelled'
}

export interface SkincareRecord {
  id: string
  type: 'chemical_peel' | 'hydrafacial' | 'dermapen' | 'microdermabrasion' | 'led_therapy' | 'oxygen_facial' | 'other'
  product_name?: string
  concentration?: string
  treatment_area: string
  session_date: string
  session_number?: number
  total_sessions?: number
  depth?: 'superficial' | 'medium' | 'deep'
  passes?: number
  needle_depth_mm?: number
  downtime_days?: number
  pre_care?: string
  post_care?: string
  notes?: string
  status: 'completed' | 'scheduled' | 'cancelled'
}

export interface TreatmentRecord {
  id: string
  condition: string
  diagnosis_type: 'clinical' | 'dermoscopy' | 'biopsy' | 'visual'
  treatment_type: 'cryotherapy' | 'topical' | 'systemic' | 'excision' | 'laser_surgical' | 'intralesional' | 'observation' | 'other'
  medication_name?: string
  medication_dosage?: string
  medication_frequency?: string
  medication_duration?: string
  area_affected?: string
  severity: 'mild' | 'moderate' | 'severe'
  start_date: string
  end_date?: string
  follow_up_date?: string
  notes?: string
  status: 'active' | 'resolved' | 'follow_up' | 'chronic'
}

export interface DermatologyAestheticsData {
  laser_sessions: LaserSession[]
  injectables: InjectableRecord[]
  skincare: SkincareRecord[]
  treatments: TreatmentRecord[]
}
