-- Migration: e-Prescriptions and Pharmacy Module

-- 1. Global Medications Index
CREATE TABLE public.medications_global (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_name_en text NOT NULL,
    brand_name_ar text,
    generic_name text NOT NULL, -- Active ingredient
    concentration text,
    form text, -- e.g., Tablet, Syrup, Injection
    manufacturer text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Clinic's Custom Medication List (Pharmacy)
CREATE TABLE public.clinic_medications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    medication_global_id uuid REFERENCES public.medications_global(id) ON DELETE SET NULL,
    
    -- Overrides or custom drugs if global_id is null
    custom_brand_name text,
    custom_generic_name text,
    concentration text,
    form text,
    
    -- Doctor's preferred defaults for this drug
    default_dosage text,
    default_frequency text,
    default_duration text,
    
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Prescription Templates (e.g. "Standard Post-Op", "Cold & Flu")
CREATE TABLE public.prescription_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    doctor_id uuid REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
    template_name text NOT NULL,
    diagnosis_tags text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Prescription Template Items
CREATE TABLE public.prescription_template_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid REFERENCES public.prescription_templates(id) ON DELETE CASCADE NOT NULL,
    clinic_medication_id uuid REFERENCES public.clinic_medications(id) ON DELETE CASCADE NOT NULL,
    dosage text NOT NULL, -- e.g., "1 Tablet"
    frequency text NOT NULL, -- e.g., "Every 8 hours"
    timing text, -- e.g., "After meals"
    duration text, -- e.g., "For 5 days"
    instructions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Patient Prescriptions (The actual Rx given to the patient)
CREATE TABLE public.patient_prescriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    doctor_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
    encounter_id uuid REFERENCES public.patient_encounters(id) ON DELETE SET NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. Patient Prescription Items (The drugs inside the Rx)
CREATE TABLE public.patient_prescription_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id uuid REFERENCES public.patient_prescriptions(id) ON DELETE CASCADE NOT NULL,
    clinic_medication_id uuid REFERENCES public.clinic_medications(id) ON DELETE RESTRICT NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    timing text,
    duration text,
    instructions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.medications_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_prescription_items ENABLE ROW LEVEL SECURITY;

-- Global Medications: Anyone authenticated can read
CREATE POLICY "Anyone can read global medications" ON public.medications_global FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins can insert global meds" ON public.medications_global FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE auth_user_id = auth.uid()));

-- Clinic Medications
CREATE POLICY "Staff can view clinic meds" ON public.clinic_medications FOR SELECT USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));
CREATE POLICY "Staff can insert clinic meds" ON public.clinic_medications FOR INSERT WITH CHECK (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));
CREATE POLICY "Staff can update clinic meds" ON public.clinic_medications FOR UPDATE USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));

-- Prescription Templates
CREATE POLICY "Staff can view clinic templates" ON public.prescription_templates FOR SELECT USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));
CREATE POLICY "Staff can manage templates" ON public.prescription_templates FOR ALL USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));

CREATE POLICY "Staff can view template items" ON public.prescription_template_items FOR SELECT USING (
    template_id IN (SELECT id FROM public.prescription_templates WHERE clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c))
);
CREATE POLICY "Staff can manage template items" ON public.prescription_template_items FOR ALL USING (
    template_id IN (SELECT id FROM public.prescription_templates WHERE clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c))
);

-- Patient Prescriptions
CREATE POLICY "Staff can view clinic prescriptions" ON public.patient_prescriptions FOR SELECT USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));
CREATE POLICY "Staff can insert clinic prescriptions" ON public.patient_prescriptions FOR INSERT WITH CHECK (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));

-- Patient Prescription Items
CREATE POLICY "Staff can view prescription items" ON public.patient_prescription_items FOR SELECT USING (
    prescription_id IN (SELECT id FROM public.patient_prescriptions WHERE clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c))
);
CREATE POLICY "Staff can insert prescription items" ON public.patient_prescription_items FOR INSERT WITH CHECK (
    prescription_id IN (SELECT id FROM public.patient_prescriptions WHERE clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c))
);
