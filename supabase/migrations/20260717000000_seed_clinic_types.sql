-- Seed all 20 specialty clinic types
-- Uses ON CONFLICT to be idempotent (safe to re-run)

INSERT INTO public.clinic_types (code, name_en, name_ar, description, is_active) VALUES
  ('dental', 'Dental', 'أسنان', 'Dental clinics and oral surgery', true),
  ('orthopedics', 'Orthopedics', 'عظمى', 'Orthopedic surgery and musculoskeletal conditions', true),
  ('ophthalmology', 'Ophthalmology', 'عيون', 'Eye care and vision treatment', true),
  ('dermatology', 'Dermatology', 'جلدية', 'Skin, hair, and nail conditions', true),
  ('pediatrics', 'Pediatrics', 'أطفال', 'Medical care for infants, children, and adolescents', true),
  ('obstetrics_gynecology', 'Obstetrics & Gynecology', 'نساء وتوليد', 'Women reproductive health and childbirth', true),
  ('cardiology', 'Cardiology', 'قلب', 'Heart and cardiovascular system', true),
  ('neurology', 'Neurology', ' أعصاب', 'Brain and nervous system disorders', true),
  ('general_practice', 'General Practice', 'باطنة عامة', 'General internal medicine and primary care', true),
  ('urology', 'Urology', 'مسالك بولية', 'Urinary tract and male reproductive system', true),
  ('ent', 'ENT', 'أنف وأذن وحنجرة', 'Ear, nose, and throat conditions', true),
  ('psychology', 'Psychology', 'نفسية', 'Mental health and psychological disorders', true),
  ('pulmonology', 'Pulmonology', 'صدرية', 'Lung and respiratory system diseases', true),
  ('gastroenterology', 'Gastroenterology', 'جهاز هضمي', 'Digestive system disorders', true),
  ('endocrinology', 'Endocrinology', 'غدد صماء', 'Hormonal and metabolic disorders', true),
  ('oncology', 'Oncology', 'أورام', 'Cancer diagnosis and treatment', true),
  ('hematology', 'Hematology', 'أمراض الدم', 'Blood disorders and diseases', true),
  ('clinical_nutrition', 'Clinical Nutrition', 'تغذية علاجية', 'Medical nutrition therapy', true),
  ('neurosurgery', 'Neurosurgery', 'جراحة أعصاب', 'Surgical treatment of nervous system disorders', true),
  ('medical_center', 'Medical Center', 'مركز طبي', 'Multi-specialty medical center', true),
  ('physical_therapy', 'Physical Therapy', 'علاج طبيعي', 'Physical rehabilitation and physiotherapy', true)
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
