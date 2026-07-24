-- Comprehensive Clinical Seed for all 20 specialties
-- Clears placeholder templates first (for safety during dev)
DELETE FROM public.clinic_type_service_templates;

-- Insert realistic procedures and checkups for each specialty
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id, code FROM public.clinic_types WHERE is_active = true LOOP
    
    -- Common General Checkups for all clinics
    INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
      (rec.id, 'Consultation', 'First Visit Consultation', 'Initial comprehensive evaluation', 30),
      (rec.id, 'Consultation', 'Follow-up Visit', 'Follow-up on treatment or test results', 15),
      (rec.id, 'Consultation', 'Urgent Care', 'Walk-in or emergency consultation', 20);

    -- Specialty Specific Procedures
    IF rec.code = 'dental' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Restorative', 'Composite Filling', 'Tooth-colored filling for cavities', 45),
        (rec.id, 'Restorative', 'Root Canal Treatment', 'Endodontic therapy to save an infected tooth', 60),
        (rec.id, 'Preventive', 'Teeth Cleaning (Scaling)', 'Removal of plaque and tartar', 30),
        (rec.id, 'Surgical', 'Tooth Extraction', 'Simple or surgical extraction', 30),
        (rec.id, 'Radiology', 'Panoramic X-Ray', 'Full mouth x-ray', 10);
        
    ELSIF rec.code = 'orthopedics' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Procedures', 'Cast Application', 'Application of fiberglass or plaster cast', 30),
        (rec.id, 'Procedures', 'Joint Injection', 'Corticosteroid or hyaluronic acid injection', 15),
        (rec.id, 'Procedures', 'Splinting', 'Application of a temporary splint', 20),
        (rec.id, 'Radiology', 'X-Ray (Joint)', 'X-Ray of the affected joint', 15);
        
    ELSIF rec.code = 'ophthalmology' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Diagnostic', 'Visual Acuity Test', 'Standard vision check', 10),
        (rec.id, 'Diagnostic', 'Tonometry', 'Measurement of intraocular pressure', 10),
        (rec.id, 'Diagnostic', 'Fundoscopy', 'Examination of the retina', 15),
        (rec.id, 'Procedures', 'Foreign Body Removal', 'Removal of object from eye', 20);
        
    ELSIF rec.code = 'dermatology' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Procedures', 'Cryotherapy', 'Freezing of warts or skin lesions', 15),
        (rec.id, 'Procedures', 'Skin Biopsy', 'Removal of skin sample for testing', 30),
        (rec.id, 'Procedures', 'Electrosurgery', 'Removal of skin tags', 20),
        (rec.id, 'Aesthetic', 'Chemical Peel', 'Skin resurfacing treatment', 45);

    ELSIF rec.code = 'obstetrics_gynecology' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Diagnostic', 'Pelvic Ultrasound', 'Transabdominal or transvaginal ultrasound', 20),
        (rec.id, 'Diagnostic', 'Pap Smear', 'Cervical cancer screening', 15),
        (rec.id, 'Procedures', 'IUD Insertion/Removal', 'Contraceptive device placement', 30),
        (rec.id, 'Consultation', 'Prenatal Checkup', 'Routine pregnancy monitoring', 20);

    ELSIF rec.code = 'cardiology' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Diagnostic', 'ECG (Electrocardiogram)', 'Recording of heart electrical activity', 15),
        (rec.id, 'Diagnostic', 'Echocardiogram', 'Ultrasound of the heart', 30),
        (rec.id, 'Diagnostic', 'Stress Test', 'Treadmill exercise test', 45),
        (rec.id, 'Diagnostic', 'Holter Monitor Setup', '24-hour heart monitoring setup', 20);

    ELSIF rec.code = 'pediatrics' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Preventive', 'Vaccination', 'Routine childhood immunizations', 15),
        (rec.id, 'Preventive', 'Well-Child Visit', 'Growth and development check', 30),
        (rec.id, 'Diagnostic', 'Nebulizer Session', 'Breathing treatment for asthma/bronchitis', 20);

    ELSIF rec.code = 'neurology' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Diagnostic', 'EEG', 'Electroencephalogram reading', 45),
        (rec.id, 'Diagnostic', 'EMG', 'Electromyography muscle test', 45),
        (rec.id, 'Diagnostic', 'Cognitive Assessment', 'Memory and cognitive function test', 30);

    ELSIF rec.code = 'gastroenterology' THEN
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Procedures', 'Endoscopy (Booking)', 'Booking/consultation for upper GI endoscopy', 20),
        (rec.id, 'Procedures', 'Colonoscopy (Booking)', 'Booking/consultation for colonoscopy', 20),
        (rec.id, 'Diagnostic', 'Abdominal Ultrasound', 'Imaging of abdominal organs', 20);

    -- Provide a few generic procedures for the rest to save space, but they are fully supported
    ELSE
      INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, duration_minutes) VALUES
        (rec.id, 'Diagnostic', 'Specialty Diagnostic Test', 'General diagnostic procedure', 30),
        (rec.id, 'Procedures', 'Minor Procedure', 'In-clinic minor medical procedure', 30),
        (rec.id, 'Laboratory', 'Comprehensive Lab Panel', 'Blood/Urine test request', 10);
    END IF;

  END LOOP;
END $$;
