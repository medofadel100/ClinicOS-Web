# ClinicOS Web — Specialty Coverage & Default Services Audit (July 2026)

## Phase 1.1: `clinic_types` Audit

Based on a live query of the `clinic_types` table, the following specialties are currently registered in the database:
- `pediatrics` (Pediatrics Clinic)
- `orthopedics` (Orthopedics Clinic)
- `ophthalmology` (Ophthalmology Clinic)
- `obstetrics_gynecology` (Obstetrics & Gynecology Clinic)
- `psychology` (Psychology / Behavioral Clinic)
- `general_practice` (General Practice Clinic)
- `dental` (Dental)
- `medical_center` (Medical Center)
- `dermatology` (Dermatology)

Comparing this to the required list of 20 specialties, the following are **Missing Entirely**:
- المخ والأعصاب (Neurosurgery)
- المسالك البولية وأمراض الذكورة (Urology & Andrology)
- أمراض القلب والأوعية الدموية (Cardiology)
- الأنف والأذن والحنجرة (ENT)
- الأمراض العصبية (Neurology)
- الجهاز الهضمي والكبد (Gastroenterology & Hepatology)
- الغدد الصماء والسكر (Endocrinology & Diabetes)
- الأمراض الصدرية والتنفسية (Pulmonology)
- أمراض الدم (Hematology)
- طب الأورام (Oncology)
- التغذية العلاجية وعلاج السمنة (Clinical Nutrition & Obesity)
*(Note: "العلاج الطبيعي" is partially covered by `orthopedics` which is named "عيادة عظام وعلاج طبيعي")*

---

## Phase 1.2: Specialty-aware Data Model Coverage

There are no dedicated tables in the active schema for the mentioned fields (no `eye_examination_entries`, `gynecology_records`, etc.). Currently, **all** specialties fall back to the generic `patient_medical_history` text fields, except for **Dentistry**. 
`vital_signs_logs` also does not exist in the actual database schema right now.

| Specialty | Dedicated Table | Fallback | Status |
| --- | --- | --- | --- |
| Dentistry & Oral Surgery | `dental_chart_entries` | N/A | **Built** |
| All 19 other specialties | None | `patient_medical_history` | **Fallback** |

---

## Phase 1.3: Frontend Specialty Branching

**Yes, but only for Dentistry.**
File: `app/[locale]/(dashboard)/[clinicId]/patients/[patientId]/page.tsx`
Lines 48-61 check if the clinic is a dental clinic:
```ts
  const { data: clinicData } = await supabase
    .from('clinics')
    .select('clinic_types(name)')
    .eq('id', clinicId)
    .single()

  const typeName = Array.isArray(clinicData?.clinic_types) 
    ? clinicData?.clinic_types[0]?.name 
    : (clinicData?.clinic_types as unknown as { name?: string })?.name

  const isDental = typeName && typeName.toLowerCase().includes('dental')
```
*Bug note:* The `clinic_types` table has `name_en` and `name_ar`, but not `name`. This query is likely failing or returning null in production, meaning even the dental module might not render dynamically right now.

All other specialties use a single fixed generic view.

---

## Phase 1.4: Service Catalog Seeding

**Not Implemented.** 
Currently, the `create_clinic_self_signup` RPC merely creates the clinic and subscription rows. When a clinic signs up, its `service_categories` and `clinic_services` tables are entirely empty. The owner must manually create every category and service from scratch via the UI.

---

## Phase 2: Open Questions for Ahmed

1. **Missing Clinical Tables:** Which of the 14+ specialties without a dedicated clinical table should get one built next? (Priority order needed).
2. **`vital_signs_logs` Table:** Is this generic table meant to be the permanent home for specialties like الباطنة/القلب/الغدد, or a temporary stand-in until each gets its own table? (Note: It needs to be created, as it currently does not exist).
3. **Seed Data:** Real per-specialty service/procedure lists are needed to replace the placeholder seed data I am about to insert.
4. **`clinic_types` DB query Bug:** The patient file checks `clinic_types(name)` but the column is `name_en` or `name_ar`. I recommend patching this UI component when we build the new templates UI.

---

## Phase 2: Default Service Templates per Specialty (Build)

### Status
UNVERIFIED — not applied/tested in this environment.

### What was added
1) New additive migration created:
- `supabase/migrations/20260716000000_clinic_type_service_templates.sql`

It creates:
- `public.clinic_type_service_templates`
- RLS policy intended to restrict template management to Supabase service-role requests
- Placeholder template rows (4 per active `clinic_types` row)

2) Signup snapshot logic
- Extended `public.create_clinic_self_signup` in `supabase/migrations/20260714000020_patch_10_self_signup.sql`.
- After creating `clinics` + owner rows, it now inserts:
  - `service_categories` rows (one per distinct `category_name` in active templates for that `clinic_type_id`)
  - `clinic_services` rows for each active template, linked to the inserted category
- If a clinic_type has **zero** active template rows, the clinic starts with **no** services (no error).

### Admin management note (no UI in this pass)
A minimal UI could be slotted into the same Admin area where `clinic_types` / catalog-ish configuration is managed (near the places Ahmed already updates taxonomy/config). This pass intentionally does **not** add any new admin screens.

### Phase 2 migrations created (exact list)
- `supabase/migrations/20260716000000_clinic_type_service_templates.sql`

### Seed-data disclaimer
The inserted catalog entries are explicitly **placeholder** generic items:
- كشف أولي
- استشارة متابعة
- كشف طارئ
- إجراء أساسي

Ahmed must replace these with real per-specialty service/procedure lists later.


### Placeholder seed disclaimer
The inserted catalog entries are explicitly **placeholder** generic items:
- كشف أولي
- استشارة متابعة
- كشف طارئ
- إجراء أساسي

Ahmed must replace these with real per-specialty service/procedure lists.

### Manual verification steps (must be run by you)
1) Apply migrations in the Supabase project (or via your normal migration runner).
2) Confirm the new table exists:
   - `public.clinic_type_service_templates`
3) Sign up a new clinic under a known `clinic_type`.
4) Verify end-to-end:
   - Owner login works (re-tests Phase 0 fix)
   - `service_categories` and `clinic_services` are populated for that clinic after signup.
5) Confirm one-time snapshot behavior:
   - Edit the template rows in `clinic_type_service_templates`
   - Ensure existing clinic `clinic_services` do NOT change.

### Manual command hints (run one at a time)
Because this tool environment couldn’t reliably chain shell commands, run your normal migration apply command(s) **one at a time** in your terminal.

Exact commands depend on your migration runner, so use these placeholders based on typical Supabase setups:
- `supabase migration up` (or whatever you normally run)
- `supabase migration list`
- then a DB check like:
  - `select count(*) from public.clinic_type_service_templates;`
  - `select count(*) from public.service_categories where clinic_id = '<test_clinic_uuid>';`
  - `select count(*) from public.clinic_services where clinic_id = '<test_clinic_uuid>';`


### Upcoming Migrations
*(To be populated after Phase 2 build)*

- `supabase/migrations/20260716000000_clinic_type_service_templates.sql`


