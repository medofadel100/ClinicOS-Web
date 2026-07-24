-- =============================================================================
-- Migration: Comprehensive medical services seed data per specialty
-- Run AFTER: 20260716000000_clinic_type_service_templates.sql
-- =============================================================================

TRUNCATE public.clinic_type_service_templates CASCADE;

-- DENTAL
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'كشف أسنان مبدئي', 'فحص شامل للأسنان واللثة', 200, 30, 0),
  ('كشف وفحص', 'أشعة سينية للأسنان', 'أشعة مقطعية أو عادية لتقييم جذور الأسنان', 150, 15, 1),
  ('كشف وفحص', 'استشارة علاج', 'تحديد خطة العلاج والمتابعة', 100, 20, 2),
  ('علاجات', 'حشو أسنان عادي', 'حشو أسنان بالمرسب (كومبوزيت)', 300, 30, 0),
  ('علاجات', 'حشو عصب', 'علاج لب الأسنان (Root Canal)', 1500, 60, 1),
  ('علاجات', 'خلع سن عادي', 'خلع سن بسيط', 400, 20, 2),
  ('علاجات', 'خلع سن جراحي', 'خلع سن زجاجي أو ضرس عقل', 800, 45, 3),
  ('علاجات', 'تاج أسنان (طربوش)', 'تركيب تاج خزفي أو معدني', 2500, 45, 4),
  ('علاجات', 'جسر أسنان', 'تركيب جسر لتعويض أسنان مفقودة', 5000, 60, 5),
  ('علاجات', 'زراعة سن', 'زراعة سن بتيتانيوم', 8000, 90, 6),
  ('علاجات', 'تبييض أسنان', 'تبييض بالليزر أو جل', 1500, 60, 7),
  ('علاجات', 'تقويم أسنان', 'تقويم معدني أو شفاف', 15000, 30, 8),
  ('علاجات', 'علاج اللثة', 'تنظيف عميق وعلاج التهاب اللثة', 500, 45, 9)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'dental' AND ct.is_active = true;

-- CARDIOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة قلب', 'فحص سريري شامل للقلب والأوعية الدموية', 500, 30, 0),
  ('كشف وفحص', 'تخطيط قلب (ECG)', 'تسجيل كهربائي للقلب', 200, 15, 1),
  ('كشف وفحص', 'تصوير صدى القلب (Echo)', 'تصوير بالصدى لحجرات القلب', 800, 45, 2),
  ('كشف وفحص', 'اختبار الجهد (Stress Test)', 'اختبار الجهد على جهاز المشي', 1200, 60, 3),
  ('كشف وفحص', 'متابعة هولتر 24 ساعة', 'تسجيل نشاط القلب لمدة 24 ساعة', 1500, 1440, 4),
  ('إجراءات', 'قسطرة قلب Diagnostic', 'قسطرة تشخيصية عبر الشريان الفخذي أو الساعد', 15000, 120, 0),
  ('إجراءات', 'زراعة دسار قلب (Pacemaker)', 'زراعة جهاز تنظيم ضربات القلب', 50000, 180, 1)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'cardiology' AND ct.is_active = true;

-- DERMATOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة جلدية', 'تشخيص وعلاج مشاكل الجلد', 400, 20, 0),
  ('كشف وفحص', 'خزعة جلدية (Biopsy)', 'أخذ عينة من الجلد للتحليل', 600, 30, 1),
  ('إجراءات', 'تجميد بالنيتروجين (Cryotherapy)', 'علاج الثآليل والتصقات الجلدية', 300, 15, 0),
  ('إجراءات', 'علاج بالليزر', 'ليزر لإزالة الشعر أو الندبات', 1000, 45, 1),
  ('إجراءات', 'تقشير كيميائي', 'تقشير للبشرة وتجديد الخلايا', 800, 30, 2),
  ('إجراءات', 'حقن بوتوكس', 'بوتوكس للتجاعيد', 3000, 30, 3),
  ('إجراءات', 'حقن فيلر', 'فيلر للوجه والشفاه', 4000, 45, 4)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'dermatology' AND ct.is_active = true;

-- ENT
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة أنف وأذن وحنجرة', 'فحص شامل للأنف والأذن والحنجرة', 400, 20, 0),
  ('كشف وفحص', 'قياس السمع (Audiometry)', 'اختبار حاسة السمع', 300, 30, 1),
  ('كشف وفحص', 'منظار أنفي', 'فحص الأنف والجيوب الأنفية بالمنظار', 400, 20, 2),
  ('إجراءات', 'إزالة لوزتين (Tonsillectomy)', 'استئصال اللوزتين جراحيًا', 8000, 60, 0),
  ('إجراءات', 'تركيب أنبوب الأذن', 'تركيب أنبوب لتصريف السائل من الأذن الوسطى', 3000, 30, 1),
  ('إجراءات', 'علاج الشخير', 'علاج اضطرابات الشخير والتنفس أثناء النوم', 500, 30, 2)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'ent' AND ct.is_active = true;

-- ENDOCRINOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة غدد صماء', 'تشخيص وعلاج اضطرابات الغدد الصماء', 500, 30, 0),
  ('كشف وفحص', 'تصوير غدة الدرقية بالصدى', 'تصوير لغدة الدرقية', 500, 20, 1),
  ('كشف وفحص', 'قياس كثافة العظام (DEXA)', 'قياس كثافة العظام للتشخيص', 800, 30, 2),
  ('إجراءات', 'حقن الكورتيزون الموضعي', 'حقن موضعي للالتهابات', 400, 15, 0),
  ('متابعة', 'متابعة مرض السكر', 'متابعة شاملة لمرضى السكر', 300, 20, 0),
  ('متابعة', 'متابعة الغدة الدرقية', 'متابعة وتعديل جرعات الدرقة', 300, 20, 1)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'endocrinology' AND ct.is_active = true;

-- FAMILY MEDICINE
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'كشف أولي عام', 'فحص شامل للصحة العامة', 300, 30, 0),
  ('كشف وفحص', 'متابعة مزمنات', 'متابعة السكر والضغط والكوليسترول', 200, 20, 1),
  ('خدمات', 'تطعيمات عامة', 'تطعيمات الأنفلونزا والذئبة وغيرها', 200, 15, 0),
  ('خدمات', 'دم وتحاليل', 'سحب عينات دم للتحاليل المخبرية', 100, 10, 1),
  ('خدمات', 'صفحة طبية شاملة', 'إعداد ملف طبي شامل للمريض', 150, 30, 2)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'family_medicine' AND ct.is_active = true;

-- GASTROENTEROLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة جهاز هضمي', 'تشخيص وعلاج أمراض الجهاز الهضمي', 500, 30, 0),
  ('كشف وفحص', 'تنظار مريئي (EGD)', 'تنظار للجزء العلوي من الجهاز الهضمي', 3000, 30, 1),
  ('كشف وفحص', 'تنظار قولون (Colonoscopy)', 'تنظار للقولون والمستقيم', 5000, 45, 2),
  ('كشف وفحص', 'اختبار جرثومة المعدة (H. Pylori)', 'تحليل تنفس لجرثومة المعدة', 400, 15, 3),
  ('إجراءات', 'إزالة полيب قولوني', 'إزالة أورام حميدة أثناء التنظار', 6000, 60, 0),
  ('متابعة', 'متابعة أمراض الكبد', 'متابعة التهاب الكبد والتشحن الكبدي', 400, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'gastroenterology' AND ct.is_active = true;

-- GENERAL PRACTICE
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'كشف عام', 'فحص سريري شامل', 250, 20, 0),
  ('كشف وفحص', 'متابعة مزمنات', 'متابعة السكر والضغط والكوليسترول', 200, 15, 1),
  ('خدمات', 'تحاليل مخبرية', 'تحليل دم شامل ووظائف الكلى والكبد', 150, 10, 0),
  ('خدمات', 'تطعيمات', 'تطعيمات الأنفلونزا والالتهاب الكبدي', 150, 10, 1),
  ('إجراءات', 'حقن أو منظار', 'إجراءات بسيطة في العيادة', 300, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'general_practice' AND ct.is_active = true;

-- INTERNAL MEDICINE
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'كشف عام', 'فحص سريري شامل', 250, 20, 0),
  ('كشف وفحص', 'متابعة مزمنات', 'متابعة السكر والضغط والكوليسترول', 200, 15, 1),
  ('خدمات', 'تحاليل مخبرية', 'تحليل دم شامل ووظائف الكلى والكبد', 150, 10, 0),
  ('خدمات', 'تطعيمات', 'تطعيمات الأنفلونزا والالتهاب الكبدي', 150, 10, 1),
  ('إجراءات', 'حقن أو منظار', 'إجراءات بسيطة في العيادة', 300, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'internal_medicine' AND ct.is_active = true;

-- GENERAL SURGERY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة جراحة عامة', 'تقييم جراحي وتحديد خطة العلاج', 500, 30, 0),
  ('إجراءات', 'استئصال كيس دهني (Lipoma)', 'استئصال كيس دهني صغير', 2000, 30, 0),
  ('إجراءات', 'خياطة جرح', 'خياطة وعلاج الجروح', 500, 20, 1),
  ('إجراءات', 'استئصال الزائدة الدودية', 'جراحة استئصال الزائدة', 25000, 120, 2),
  ('إجراءات', 'علاج الفتق (Hernia)', 'جراحة الفتق الإربي أو السري', 20000, 90, 3)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'general_surgery' AND ct.is_active = true;

-- HEMATOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة أمراض الدم', 'تشخيص وعلاج اضطرابات الدم', 500, 30, 0),
  ('كشف وفحص', 'دمعة دم محيطية (Blood Smear)', 'تحليل ميكروسكوبي لخلايا الدم', 300, 15, 1),
  ('إجراءات', 'خزعة نخاع العظم', 'أخذ عينة من نخاع العظم', 3000, 45, 0),
  ('متابعة', 'متابعة فقر الدم', 'متابعة وعلاج فقر الدم', 300, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'hematology' AND ct.is_active = true;

-- NEPHROLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة كلى', 'تشخيص وعلاج أمراض الكلى', 500, 30, 0),
  ('كشف وفحص', 'تصوير كلى بالصدى', 'تصوير بالصدى للكلى والمثانة', 400, 20, 1),
  ('إجراءات', 'غسيل كلوي جلدي', 'جلسة غسيل كلوي واحدة', 2000, 240, 0),
  ('متابعة', 'متابعة مرضى الكلى', 'متابعة وظائف الكلى والجلوولين', 400, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'nephrology' AND ct.is_active = true;

-- NEUROLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة أعصاب', 'تشخيص وعلاج أمراض الجهاز العصبي', 500, 30, 0),
  ('كشف وفحص', 'تخطيط دماغ (EEG)', 'تسجيل نشاط الدماغ الكهربائي', 1000, 45, 1),
  ('كشف وفحص', 'دراسة التوصيل العصبي (EMG)', 'اختبار التوصيل الكهربائي للعصب', 1500, 60, 2),
  ('إجراءات', 'حقن بوتوكس للصداع النصفي', 'بوتوكس علاجي للصداع المزمن', 3000, 30, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'neurology' AND ct.is_active = true;

-- NEUROSURGERY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة جراحة أعصاب', 'تقييم جراحي لأمراض الجهاز العصبي', 700, 30, 0),
  ('كشف وفحص', 'مراجعة أشعة (MRI/CT)', 'مراجعة أشعة المقطعية والرنين المغناطيسي', 500, 20, 1),
  ('إجراءات', 'استئصال ورم دماغي', 'جراحة إزالة أورام الدماغ', 80000, 240, 0),
  ('إجراءات', 'علاج الانزلاق الغضروفي', 'جراحة العمود الفقري', 40000, 180, 1),
  ('متابعة', 'متابعة ما بعد الجراحة', 'متابعة بعد جراحة الأعصاب', 500, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'neurosurgery' AND ct.is_active = true;

-- OB/GYN
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة نساء', 'فحص نسائي شامل', 400, 20, 0),
  ('كشف وفحص', 'متابعة الحمل', 'متابعة دورية أثناء الحمل', 300, 20, 1),
  ('كشف وفحص', 'سونار الحمل', 'تصوير بالصدى لمتابعة الجنين', 500, 30, 2),
  ('كشف وفحص', 'مسحة بابلاك (Pap Smear)', 'فحص يقظي لسرطان عنق الرحم', 300, 15, 3),
  ('إجراءات', 'ولادة طبيعية', 'إدارة الولادة الطبيعية', 15000, 480, 0),
  ('إجراءات', 'ولادة قيصرية', 'جراحة الولادة القيصرية', 25000, 120, 1),
  ('إجراءات', 'تنظير رحمي', 'تنظير تشخيصي للرحم', 3000, 30, 2)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'obstetrics_gynecology' AND ct.is_active = true;

-- ONCOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة أورام', 'تقييم وتشخيص الأورام', 800, 30, 0),
  ('كشف وفحص', 'marcadores الورمية (Tumor Markers)', 'تحليل علامات الأورام في الدم', 500, 15, 1),
  ('إجراءات', 'جلسة كيماوي (Chemotherapy)', 'جلسة علاج كيميائي', 5000, 180, 0),
  ('إجراءات', 'خزعة ورم', 'أخذ عينة من الورم للتحليل', 2000, 30, 1),
  ('متابعة', 'متابعة ما بعد العلاج', 'متابعة دورية بعد انتهاء العلاج', 500, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'oncology' AND ct.is_active = true;

-- OPHTHALMOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'فحص عيون شامل', 'فحص شامل لصحة العيون والبصريات', 400, 30, 0),
  ('كشف وفحص', 'قياس النظر', 'قياس درجة النظارة والعدسة', 150, 15, 1),
  ('كشف وفحص', 'قياس ضغط العين (Tonometry)', 'قياس الضغط الداخلي للعين', 200, 10, 2),
  ('كشف وفحص', 'فحص قاع العين', 'فحص شبكية العين بالمصباح الشق', 300, 20, 3),
  ('إجراءات', 'علاج الساد (Cataract)', 'استئصال الساد وتركيب العدسة', 15000, 30, 0),
  ('إجراءات', 'استشارة ليزك (LASIK)', 'تقييم الليزك لتصحيح النظر', 500, 30, 1),
  ('إجراءات', 'حقن بالعين', 'حقن مضاد VEGF لعلاج التنكس البقعي', 5000, 15, 2)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'ophthalmology' AND ct.is_active = true;

-- ORTHOPEDICS
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة عظام', 'تشخيص وعلاج أمراض العظام والمفاصل', 500, 20, 0),
  ('كشف وفحص', 'مراجعة أشعة عظام', 'تقييم الأشعة السينية', 200, 15, 1),
  ('إجراءات', 'حقن مفصل', 'حقن كورتيزون أو هايلورونيك في المفصل', 800, 20, 0),
  ('إجراءات', 'تركيب جبيرة', 'علاج الكسور بالجبيرة', 500, 30, 1),
  ('إجراءات', 'جراحة استبدال مفصل', 'استبدال مفصل الركبة أو الورك', 60000, 180, 2),
  ('متابعة', 'متابعة كسور', 'متابعة التئام الكسور', 300, 15, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'orthopedics' AND ct.is_active = true;

-- PEDIATRICS
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'كشف أطفال عام', 'فحص شامل لصحة الطفل', 300, 20, 0),
  ('كشف وفحص', 'متابعة النمو', 'تقييم النمو الجسدي والعقلي', 250, 20, 1),
  ('خدمات', 'تطعيمات أطفال', 'الجدول الزمني للتطعيمات', 200, 15, 0),
  ('خدمات', 'تحاليل أطفال', 'تحاليل دم بسيطة للأطفال', 150, 10, 1),
  ('إجراءات', 'علاج حمى الأطفال', 'إدارة حمى الأطفال', 200, 15, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'pediatrics' AND ct.is_active = true;

-- PHYSICAL THERAPY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'تقييم أولي', 'تقييم شامل لحالة المريض وتحديد خطة العلاج', 400, 45, 0),
  ('جلسات علاج', 'جلسة علاج طبيعي', 'جلسة علاج بالأجهزة والتمارين', 300, 45, 1),
  ('جلسات علاج', 'علاج بالموجات فوق الصوتية', 'Ultrasonic therapy', 200, 30, 2),
  ('جلسات علاج', 'علاج بالتيار الكهربائي (TENS)', 'Electrical stimulation therapy', 200, 30, 3),
  ('جلسات علاج', 'علاج بالليزر الشعاعي', 'Low-level laser therapy', 300, 20, 4),
  ('جلسات علاج', 'علاج يدوي', 'Manual therapy and mobilization', 350, 30, 5),
  ('متابعة', 'متابعة التقدم', 'تقييم دوري للتحسن', 200, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'physical_therapy' AND ct.is_active = true;

-- PSYCHIATRY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة نفسية', 'تقييم نفسي وتشخيصي', 600, 45, 0),
  ('متابعة', 'متابعة نفسية', 'متابعة وتعديل الأدوية', 400, 20, 1),
  ('إجراءات', 'تقييم ما قبل الجراحة', 'تقييم نفسي قبل إجراء جراحي', 500, 30, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'psychiatry' AND ct.is_active = true;

-- PSYCHOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('جلسات', 'جلسة علاج نفسي', 'جلسة علاج سلوكي معرفي (CBT)', 500, 50, 0),
  ('جلسات', 'تقييم نفسي', 'تقييم شامل للحالة النفسية', 800, 60, 1),
  ('جلسات', 'تقييم ذكاء', 'اختبار IQ وتقديرات الملف الذهني', 1000, 90, 2),
  ('جلسات', 'استشارة أسرية', 'استشارة زوجية أو أسرية', 600, 60, 3)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'psychology' AND ct.is_active = true;

-- PULMONOLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة صدرية', 'تشخيص وعلاج أمراض الرئة والتنفس', 500, 30, 0),
  ('كشف وفحص', 'اختبار وظائف الرئة (PFT)', 'قياس سعة الرئة وتدفق الهواء', 500, 30, 1),
  ('كشف وفحص', 'تنظار قصبات رئوي (Bronchoscopy)', 'تنظار للقصبات الهوائية', 5000, 45, 2),
  ('إجراءات', 'سحب سائل من الصدر', 'استخراج السائل من تجويف الصدر', 2000, 30, 0),
  ('متابعة', 'متابعة الربو', 'متابعة وتعديل خطة علاج الربو', 300, 20, 0),
  ('متابعة', 'متابعة COPD', 'متابعة انسداد الرئة المزمن', 300, 20, 1)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'pulmonology' AND ct.is_active = true;

-- UROLOGY
INSERT INTO public.clinic_type_service_templates (clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index)
SELECT ct.id, v.category_name, v.name, v.description, v.suggested_price_egp, v.duration_minutes, v.order_index
FROM public.clinic_types ct, (VALUES
  ('كشف وفحص', 'استشارة مسالك بولية', 'تشخيص وعلاج أمراض المسالك البولية', 500, 20, 0),
  ('كشف وفحص', 'تصوير مثانة بالصدى', 'تصوير بالصدى للمسالك البولية', 400, 20, 1),
  ('كشف وفحص', 'تنظار مثانة (Cystoscopy)', 'تنظار تشخيصي للمثانة', 3000, 30, 2),
  ('إجراءات', 'علاج حصوات الكلى', 'تفتيت أو استخراج حصوات الكلى', 10000, 60, 0),
  ('إجراءات', 'استئصال غدة البروستاتا', 'جراحة استئصال البروستاتا', 30000, 120, 1),
  ('متابعة', 'متابعة البروستاتا', 'متابعة تضخم البروستاتا الحميد', 400, 20, 0)
) AS v(category_name, name, description, suggested_price_egp, duration_minutes, order_index)
WHERE ct.code = 'urology' AND ct.is_active = true;
