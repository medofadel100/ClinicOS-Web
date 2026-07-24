-- Seed Data: Sample of common medications available in Egypt
-- This provides the foundational "Global Drugs Index" for the clinic autocomplete.

INSERT INTO public.medications_global (brand_name_en, brand_name_ar, generic_name, concentration, form, manufacturer)
VALUES
-- Antibiotics
('Augmentin', 'أوجمنتين', 'Amoxicillin + Clavulanate', '1g', 'Tablet', 'GSK'),
('Augmentin', 'أوجمنتين', 'Amoxicillin + Clavulanate', '625mg', 'Tablet', 'GSK'),
('Augmentin', 'أوجمنتين', 'Amoxicillin + Clavulanate', '312mg', 'Suspension', 'GSK'),
('Hibiotic', 'هايبيوتك', 'Amoxicillin + Clavulanate', '1g', 'Tablet', 'Amoun'),
('Hibiotic', 'هايبيوتك', 'Amoxicillin + Clavulanate', '625mg', 'Tablet', 'Amoun'),
('Zithrokan', 'زيتروكان', 'Azithromycin', '500mg', 'Capsule', 'Hikma'),
('Cipro', 'سيبرو', 'Ciprofloxacin', '500mg', 'Tablet', 'Bayer'),

-- Pain & Fever (Analgesics / NSAIDs)
('Panadol', 'بانادول', 'Paracetamol', '500mg', 'Tablet', 'GSK'),
('Panadol Extra', 'بانادول اكسترا', 'Paracetamol + Caffeine', '500mg/65mg', 'Tablet', 'GSK'),
('Cataflam', 'كاتافلام', 'Diclofenac Potassium', '50mg', 'Tablet', 'Novartis'),
('Voltaren', 'فولتارين', 'Diclofenac Sodium', '50mg', 'Tablet', 'Novartis'),
('Voltaren', 'فولتارين', 'Diclofenac Sodium', '75mg/3ml', 'Ampoule', 'Novartis'),
('Brufen', 'بروفين', 'Ibuprofen', '400mg', 'Tablet', 'Abbott'),
('Brufen', 'بروفين', 'Ibuprofen', '600mg', 'Tablet', 'Abbott'),

-- Gastroenterology
('Controloc', 'كنترولوك', 'Pantoprazole', '40mg', 'Tablet', 'Takeda'),
('Controloc', 'كنترولوك', 'Pantoprazole', '20mg', 'Tablet', 'Takeda'),
('Antinal', 'أنتينال', 'Nifuroxazide', '200mg', 'Capsule', 'Amoun'),
('Antinal', 'أنتينال', 'Nifuroxazide', '220mg/5ml', 'Suspension', 'Amoun'),
('Nexium', 'نيكسيوم', 'Esomeprazole', '40mg', 'Tablet', 'AstraZeneca'),
('Nexium', 'نيكسيوم', 'Esomeprazole', '20mg', 'Tablet', 'AstraZeneca'),
('Motilium', 'موتيليوم', 'Domperidone', '10mg', 'Tablet', 'J&J'),
('Spasmocure', 'سبازموكیور', 'Drotaverine', '40mg', 'Tablet', 'Eva Pharma'),

-- Cold & Allergy (Antihistamines)
('Claritin', 'كلاريتين', 'Loratadine', '10mg', 'Tablet', 'Bayer'),
('Zyrtec', 'زيرتك', 'Cetirizine', '10mg', 'Tablet', 'GSK'),
('Telfast', 'تلفاست', 'Fexofenadine', '120mg', 'Tablet', 'Sanofi'),
('Telfast', 'تلفاست', 'Fexofenadine', '180mg', 'Tablet', 'Sanofi'),
('Congestal', 'كونجستال', 'Paracetamol + Pseudoephedrine + Chlorpheniramine', 'Standard', 'Tablet', 'Sigma'),
('123 Cold', 'وان تو ثرى', 'Paracetamol + Pseudoephedrine + Chlorpheniramine', 'Standard', 'Tablet', 'Hikma'),

-- Cardiovascular / Hypertension
('Concor', 'كونكور', 'Bisoprolol', '5mg', 'Tablet', 'Merck'),
('Concor', 'كونكور', 'Bisoprolol', '10mg', 'Tablet', 'Merck'),
('Concor Plus', 'كونكور بلس', 'Bisoprolol + Hydrochlorothiazide', '5mg/12.5mg', 'Tablet', 'Merck'),
('Amlor', 'أملور', 'Amlodipine', '5mg', 'Capsule', 'Pfizer'),
('Co-Diovan', 'كو-ديوفان', 'Valsartan + Hydrochlorothiazide', '160mg/12.5mg', 'Tablet', 'Novartis'),
('Lipitor', 'ليبيتور', 'Atorvastatin', '20mg', 'Tablet', 'Pfizer'),
('Lipitor', 'ليبيتور', 'Atorvastatin', '40mg', 'Tablet', 'Pfizer'),

-- Diabetes
('Glucophage', 'جلوكوفاج', 'Metformin', '500mg', 'Tablet', 'Merck'),
('Glucophage', 'جلوكوفاج', 'Metformin', '1000mg', 'Tablet', 'Merck'),
('Glucophage XR', 'جلوكوفاج إكس آر', 'Metformin', '1000mg', 'Extended Release Tablet', 'Merck'),
('Amaryl', 'أماريل', 'Glimepiride', '2mg', 'Tablet', 'Sanofi'),
('Amaryl', 'أماريل', 'Glimepiride', '3mg', 'Tablet', 'Sanofi'),
('Janumet', 'جانوميت', 'Sitagliptin + Metformin', '50mg/1000mg', 'Tablet', 'MSD'),

-- Respiratory / Asthma
('Ventolin', 'فنتولين', 'Salbutamol', '100mcg/dose', 'Inhaler', 'GSK'),
('Symbicort', 'سيمبيكورت', 'Budesonide + Formoterol', '160/4.5mcg', 'Turbuhaler', 'AstraZeneca'),
('Pulmicort', 'بولميكورت', 'Budesonide', '0.5mg/ml', 'Respules', 'AstraZeneca'),

-- Neuro / Psychiatry
('Cipralex', 'سيبرالكس', 'Escitalopram', '10mg', 'Tablet', 'Lundbeck'),
('Lyrica', 'ليريكا', 'Pregabalin', '75mg', 'Capsule', 'Pfizer'),
('Lyrica', 'ليريكا', 'Pregabalin', '150mg', 'Capsule', 'Pfizer'),
('Tegretol', 'تيجريتول', 'Carbamazepine', '200mg', 'Tablet', 'Novartis'),

-- Vitamins & Supplements
('Neuroton', 'نيوروتون', 'Vitamin B Complex', 'Standard', 'Tablet', 'Amoun'),
('Neurovit', 'نيوروفيت', 'Vitamin B Complex', 'Standard', 'Tablet', 'Eva Pharma'),
('Feroglobin', 'فيروجلوبين', 'Iron + Vitamins', 'Standard', 'Capsule', 'Vitabiotics'),
('Osteocare', 'أوستيوكير', 'Calcium + Magnesium + Zinc + Vit D3', 'Standard', 'Tablet', 'Vitabiotics');
