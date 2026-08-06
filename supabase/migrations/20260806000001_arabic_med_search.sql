-- ============================================================
-- Migration: Arabic-normalized medication search
-- Fixes: full drug names not matching (hamza/typing variants),
--        Arabic active-ingredient search, partial-vs-full mismatch
-- ============================================================

-- 1. Arabic generic names (active ingredient) so users can search
--    the ingredient in Arabic (e.g. "باراسيتامول" -> Paracetamol)
ALTER TABLE public.medications_global
  ADD COLUMN IF NOT EXISTS generic_name_ar text;

-- 2. Arabic text normalizer (immutable, index-friendly)
--    * strips Arabic diacritics + tatweel
--    * unifies أ/إ/آ/ٱ -> ا, ة -> ه, ى -> ي, ؤ -> و, ئ -> ي
--    * lowercases for case-insensitive matching
CREATE OR REPLACE FUNCTION public.normalize_ar_text(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  result text;
BEGIN
  result := regexp_replace(
    coalesce(input, ''),
    '[' || chr(0x064B) || '-' || chr(0x0652) || chr(0x0640) || ']',
    '',
    'g'
  );
  result := translate(result, 'أإآٱةىؤئ', 'ااااهيوي');
  RETURN lower(result);
END;
$$;

-- 3. Search global medications (brand EN/AR + generic EN/AR)
CREATE OR REPLACE FUNCTION public.search_medications(p_query text)
RETURNS SETOF public.medications_global
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT mg.*
  FROM public.medications_global mg
  WHERE normalize_ar_text(
          mg.brand_name_en || ' '
          || coalesce(mg.brand_name_ar, '') || ' '
          || mg.generic_name || ' '
          || coalesce(mg.generic_name_ar, '')
        ) ILIKE '%' || normalize_ar_text(p_query) || '%'
  ORDER BY mg.brand_name_en, mg.concentration
  LIMIT 20;
$$;

-- 4. Search by active ingredient only (used for "Find Alternatives")
CREATE OR REPLACE FUNCTION public.search_medications_by_generic(p_query text)
RETURNS SETOF public.medications_global
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT mg.*
  FROM public.medications_global mg
  WHERE normalize_ar_text(
          mg.generic_name || ' ' || coalesce(mg.generic_name_ar, '')
        ) ILIKE '%' || normalize_ar_text(p_query) || '%'
  ORDER BY mg.brand_name_en, mg.concentration
  LIMIT 20;
$$;

-- 5. Search a clinic's custom medications (no global id)
CREATE OR REPLACE FUNCTION public.search_clinic_medications(p_clinic uuid, p_query text)
RETURNS SETOF public.clinic_medications
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT cm.*
  FROM public.clinic_medications cm
  WHERE cm.clinic_id = p_clinic
    AND (
      normalize_ar_text(coalesce(cm.custom_brand_name, '')) ILIKE '%' || normalize_ar_text(p_query) || '%'
      OR normalize_ar_text(coalesce(cm.custom_generic_name, '')) ILIKE '%' || normalize_ar_text(p_query) || '%'
    )
  ORDER BY cm.created_at DESC
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.search_medications(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_medications_by_generic(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_clinic_medications(uuid, text) TO authenticated;

-- 6. Backfill Arabic active-ingredient names for the seeded drugs
UPDATE public.medications_global SET generic_name_ar = 'أموكسيسيلين + حمض الكلافولانيك' WHERE generic_name = 'Amoxicillin + Clavulanate';
UPDATE public.medications_global SET generic_name_ar = 'أزيثروميسين' WHERE generic_name = 'Azithromycin';
UPDATE public.medications_global SET generic_name_ar = 'سيبروفلوكساسين' WHERE generic_name = 'Ciprofloxacin';
UPDATE public.medications_global SET generic_name_ar = 'باراسيتامول' WHERE generic_name = 'Paracetamol';
UPDATE public.medications_global SET generic_name_ar = 'باراسيتامول + كافيين' WHERE generic_name = 'Paracetamol + Caffeine';
UPDATE public.medications_global SET generic_name_ar = 'باراسيتامول + سودوإيفيدرين + كلورفينيرامين' WHERE generic_name = 'Paracetamol + Pseudoephedrine + Chlorpheniramine';
UPDATE public.medications_global SET generic_name_ar = 'ديكلوفيناك بوتاسيوم' WHERE generic_name = 'Diclofenac Potassium';
UPDATE public.medications_global SET generic_name_ar = 'ديكلوفيناك صوديوم' WHERE generic_name = 'Diclofenac Sodium';
UPDATE public.medications_global SET generic_name_ar = 'إيبوبروفين' WHERE generic_name = 'Ibuprofen';
UPDATE public.medications_global SET generic_name_ar = 'بانتوبرازول' WHERE generic_name = 'Pantoprazole';
UPDATE public.medications_global SET generic_name_ar = 'نيفوروكسازيد' WHERE generic_name = 'Nifuroxazide';
UPDATE public.medications_global SET generic_name_ar = 'إيزوميبرازول' WHERE generic_name = 'Esomeprazole';
UPDATE public.medications_global SET generic_name_ar = 'دومبيريدون' WHERE generic_name = 'Domperidone';
UPDATE public.medications_global SET generic_name_ar = 'دروتافيرين' WHERE generic_name = 'Drotaverine';
UPDATE public.medications_global SET generic_name_ar = 'لوراتادين' WHERE generic_name = 'Loratadine';
UPDATE public.medications_global SET generic_name_ar = 'سيتيريزين' WHERE generic_name = 'Cetirizine';
UPDATE public.medications_global SET generic_name_ar = 'فيكسوفينادين' WHERE generic_name = 'Fexofenadine';
UPDATE public.medications_global SET generic_name_ar = 'بيسوبرولول' WHERE generic_name = 'Bisoprolol';
UPDATE public.medications_global SET generic_name_ar = 'بيسوبرولول + هيدروكلوروثيازيد' WHERE generic_name = 'Bisoprolol + Hydrochlorothiazide';
UPDATE public.medications_global SET generic_name_ar = 'أملوديبين' WHERE generic_name = 'Amlodipine';
UPDATE public.medications_global SET generic_name_ar = 'فالسارتان + هيدروكلوروثيازيد' WHERE generic_name = 'Valsartan + Hydrochlorothiazide';
UPDATE public.medications_global SET generic_name_ar = 'أتورفاستاتين' WHERE generic_name = 'Atorvastatin';
UPDATE public.medications_global SET generic_name_ar = 'ميتفورمين' WHERE generic_name = 'Metformin';
UPDATE public.medications_global SET generic_name_ar = 'جليميبيريد' WHERE generic_name = 'Glimepiride';
UPDATE public.medications_global SET generic_name_ar = 'سيتاجليبتين + ميتفورمين' WHERE generic_name = 'Sitagliptin + Metformin';
UPDATE public.medications_global SET generic_name_ar = 'سالبوتامول' WHERE generic_name = 'Salbutamol';
UPDATE public.medications_global SET generic_name_ar = 'بوديزونيد + فورموتيرول' WHERE generic_name = 'Budesonide + Formoterol';
UPDATE public.medications_global SET generic_name_ar = 'بوديزونيد' WHERE generic_name = 'Budesonide';
UPDATE public.medications_global SET generic_name_ar = 'إسيتالوبرام' WHERE generic_name = 'Escitalopram';
UPDATE public.medications_global SET generic_name_ar = 'بريجابالين' WHERE generic_name = 'Pregabalin';
UPDATE public.medications_global SET generic_name_ar = 'كاربامازيبين' WHERE generic_name = 'Carbamazepine';
UPDATE public.medications_global SET generic_name_ar = 'فيتامين ب المركب' WHERE generic_name = 'Vitamin B Complex';
UPDATE public.medications_global SET generic_name_ar = 'حديد + فيتامينات' WHERE generic_name = 'Iron + Vitamins';
UPDATE public.medications_global SET generic_name_ar = 'كالسيوم + ماغنيسيوم + زنك + فيتامين د3' WHERE generic_name = 'Calcium + Magnesium + Zinc + Vit D3';
