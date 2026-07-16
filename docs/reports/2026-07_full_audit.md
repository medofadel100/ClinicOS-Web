# ClinicOS Web — Full Codebase Audit & Discovery Report (July 2026)

## Summary Table

| Area | Status | Note |
| --- | --- | --- |
| DB connection | **Working** | Proper distinction between `createBrowserClient` and `createServerClient`. Uses Service Role in isolated `admin.ts`. |
| Signup flow | **Broken** | `create_clinic_self_signup` RPC creates a clinic but fails to create the owner's `staff_members` or `clinic_staff_memberships` row. Owner is locked out post-signup. |
| Plan/entitlement display | **Partial** | Registration reads active plans dynamically from DB. Dashboard settings shows locked price. `LockedFeature` components blur/disable UI elements. |
| Appointments | **Working / Conflicted** | Booking flows exist and write to `appointments` table. Waitlist is fragmented into `patient_waitlist` (used by UI) and `appointments_waitlist` (used by bot). |
| Patient records (generic) | **Working** | Base tables `patients`, `patient_medical_history`, and `patient_uploaded_files` exist. |
| Patient records (specialty-aware) | **Partial** | Only Dentistry is implemented (`dental_chart_entries`). The remaining 19 specialties share generic records. |
| Offline licensing (Web-side) | **Not Built** | No UI, tables, or scaffolding exist for device limits, activations, or offline license management. |
| Roles/permissions enforcement | **Partial / Broken** | No Next.js route protection based on roles. HR and Finance pages are technically accessible to any staff if RLS isn't strict. |
| UI styling | **Working** | Premium UI and dynamic designs implemented across `(dashboard)` and `(auth)`. |

---

## 1. Data & Storage Architecture

### Supabase Tables
*Identified from `supabase/migrations/`*. (Note: `clinics`, `plans`, and license tables are managed externally via the Admin project migrations, but operate on the same DB).
- `staff_members` - Stores user profile and name.
- `clinic_staff_memberships` - Maps `staff_members` to `clinics` with a specific role.
- `clinic_settings` - Clinic configuration preferences.
- `doctor_profiles` - Extended info for doctors.
- `doctor_working_hours` - Shift configuration.
- `service_categories` & `clinic_services` - Clinic billing services.
- `patients` - Core patient entity.
- `patient_medical_history` - Generic medical notes.
- `patient_uploaded_files` - Reference to uploaded files in storage.
- `appointments` - Core booking system.
- `patient_waitlist` - UI-facing waitlist table.
- `appointments_waitlist` - Bot-facing waitlist table.
- `dental_chart_entries` - Specialty-specific dental charting.
- `treatment_plans` & `treatment_plan_sessions` & `treatment_plan_approvals` - Multi-session billing models.
- `patient_payments` - Billing transactions.
- `medical_inventory_items` & `inventory_transactions` - Inventory system.
- `clinic_expenses` & `expense_occurrences` - Outgoing cashflow.
- `staff_payroll_config` & `payroll_runs` & `staff_leave_requests` - HR and Payroll.
- `whatsapp_bot_config`, `whatsapp_menu_options`, `whatsapp_conversation_states`, `whatsapp_automation_settings`, `service_followup_rules` - WhatsApp integration.
- `marketing_campaigns`, `whatsapp_campaigns`, `whatsapp_campaign_recipients` - Broadcast marketing.
- `clinic_subscriptions` & `upgrade_requests` - Handles SaaS billing and trial cycles.

### RLS Policies
RLS is heavily used. Key policies (from `20260714000018_ultimate_rls_fix.sql` and others):
- **staff_members**: "Staff can view their own profile", "Owners can view their clinic staff profiles".
- **clinic_staff_memberships**: "Staff can view their own memberships", "Staff can view others in their clinics", "Owners can manage memberships".
- **Plans / Features**: Publicly readable (e.g., "Allow public read of active plans").
- **Subscriptions**: "Staff can view their clinic subscriptions".

### Storage Buckets
**NOT IMPLEMENTED.** No `storage.buckets` creation logic exists in the migrations. Patient files and avatars are referenced in code, but the buckets are not programmatically defined.

### Supabase Connection
- **Client/Server**: Follows Next.js SSR best practices using `@supabase/ssr` (`lib/supabase/client.ts` and `lib/supabase/server.ts`).
- **Service Role**: `SUPABASE_SERVICE_ROLE_KEY` is safely isolated in `lib/supabase/admin.ts`. It is **only** called server-side (e.g. `app/api/invite/accept/route.ts` and Registration Action), meaning there are no client-side security leaks.
- **CRUD Operations**: Handled via Server Actions (e.g., Patients CRUD -> `app/[locale]/(dashboard)/[clinicId]/patients/actions.ts`).

---

## 2. Site Map / Pages

Actual Route Tree in `app/[locale]/(dashboard)/[clinicId]/`:
- `/` (`page.tsx`) - Main dashboard view. Fully Built. Requires Auth.
- `/appointments` - Calendar booking system. Fully Built. Requires Auth.
- `/finance` - Cashflow, expenses, and patient payments. Partially Built. Requires Auth.
- `/hr` - Staff directory, attendance, payroll. Partially Built. Requires Auth.
- `/inventory` - Medical stock management. Built. Requires Auth.
- `/marketing` - WhatsApp broadcasting. Built. Requires Auth.
- `/patients` - Patient database and files. Built. Requires Auth.
- `/reports` - Analytics. Placeholder/Partial. Requires Auth.
- `/settings` - Clinic setup, staff invites. Built. Requires Auth.
- `/whatsapp` - WhatsApp AI Assistant settings. Built. Requires Auth.

---

## 3. Appointments System

- **End-to-End**: A user navigates to `/appointments`, selects a slot, and creates an appointment via `appointments/actions.ts`. It writes directly to the `appointments` table.
- **Waitlist Duplicate Conflict**: 
  - There are indeed **two** duplicate tables: `patient_waitlist` and `appointments_waitlist`.
  - The UI (e.g., `appointments/actions.ts`) reads/writes to `patient_waitlist`.
  - The WhatsApp Bot (e.g., `lib/bot/automations/waitlist-autofill.ts`) queries `appointments_waitlist`. 
  - This is a disjointed system where UI waitlist requests won't trigger AI autofill logic.

---

## 4. Per-Clinic Specialty Model

**Not Implemented** at the global architecture level. There is no `clinic_type` enum enforced structurally in the frontend. All clinics share the exact same UI layout out of the box.

### Patient Record Extensibility
- Fixed medical-record schema. Uses `patient_medical_history` for generic text-based notes.

### 20 Specialties Review
1. الباطنة: Not implemented
2. طب الأطفال وحديثي الولادة: Not implemented
3. أمراض النساء والتوليد: Not implemented
4. **طب وجراحة الفم والأسنان: PARTIALLY IMPLEMENTED.** `modules/dental/DentalChart.tsx` exists and reads/writes to `dental_chart_entries`. It is gated via `<LockedFeature featureCode="dental_module">`.
5. الجلدية والتناسلية: Not implemented
6. المخ والأعصاب: Not implemented
7. المسالك البولية وأمراض الذكورة: Not implemented
8. أمراض القلب والأوعية الدموية: Not implemented
9. الأنف والأذن والحنجرة: Not implemented
10. الرمد وجراحة العيون: Not implemented
11. الأمراض العصبية: Not implemented
12. الجهاز الهضمي والكبد: Not implemented
13. الغدد الصماء والسكر: Not implemented
14. الأمراض الصدرية والتنفسية: Not implemented
15. أمراض الدم: Not implemented
16. طب الأورام: Not implemented
17. العلاج الطبيعي: Not implemented
18. التغذية العلاجية وعلاج السمنة: Not implemented
19. الطب النفسي: Not implemented
20. جراحة العظام والمفاصل: Not implemented

---

## 5. Known Bugs / Problems

1. **Critical: Self-Signup Lockout.**
   - *File:* `RegisterForm.tsx` & `supabase/migrations/20260714000020_patch_10_self_signup.sql`
   - *Issue:* The RPC function `create_clinic_self_signup` creates the `clinics` row but **never creates a `staff_members` or `clinic_staff_memberships` row for the owner**. The user authenticates but is redirected to a void because they don't belong to the clinic they just created.
   - *Severity:* Blocks core flow.
2. **Major: Duplicate Waitlist Tables.**
   - *File:* `appointments/actions.ts` vs `lib/bot/automations/waitlist-autofill.ts`
   - *Issue:* UI uses `patient_waitlist`. AI Bot uses `appointments_waitlist`.
   - *Severity:* Blocks feature (Automated Waitlist Fill).
3. **Security: Lack of Route Protection for HR/Finance.**
   - *File:* `hr/page.tsx`, `layout.tsx`
   - *Issue:* Any user with a valid `clinicId` can navigate to `/hr`. There is no `if (role !== 'owner') redirect()` in the Next.js layouts or pages. Depends entirely on RLS throwing errors rather than graceful UI handling.
   - *Severity:* Security Risk.

---

## 6. Accounts, Plans & Subscriptions

- **Signup Write Path:**
  1. `supabase.auth.signUp`
  2. `create_clinic_self_signup` RPC writes to:
     - `clinics` (status: trial)
     - `clinic_subscriptions` (links to real `chosen_plan_id` if selected, otherwise trial).
- **Plan Display:** The `RegisterForm.tsx` fetches `plans` and `plan_features` live from the database. No hardcoded cards.
- **Entitlements UI:** The dashboard (`settings/page.tsx`) correctly reads `subscription?.price_locked_egp`. Pages like `patients/[patientId]/page.tsx` use `<LockedFeature featureCode="dental_module">` to blur/disable access if the feature is not active in the plan.

---

## 7. Offline Licensing / Desktop Activation

**NOT IMPLEMENTED.**
- Zero code references to "device limits", "activations", or offline files in the Web dashboard.
- Requires completion of the Checkpoint 11 Licensing architecture from the Admin side before Web can surface it.

---

## 8. Roles & Permissions

- **Roles Present:** `owner`, `doctor`, `receptionist`, `accountant`, `nurse` (defined in `InviteStaffDialog.tsx`).
- **Enforcement Mechanisms:**
  - Primarily enforced via Supabase RLS policies (e.g. `Owners can manage memberships`).
  - Some Server Actions do check roles (e.g. `if (!membership || membership.role !== 'owner')` in `settings/actions.ts`).
  - **Insecure Pages:** The UI routing in `app/[locale]/(dashboard)` does not verify roles. A receptionist navigating to `/hr` or `/finance` is not bounced by Next.js middleware or server components. They will hit the page and rely on RLS returning empty data, which is bad UX and a potential data leak if RLS is misconfigured.

---

## Open Questions for Ahmed

1. **Waitlist Consolidation:** Should we drop `appointments_waitlist` and migrate the bot logic to `patient_waitlist`, or vice versa?
2. **Specialties:** Do you want standard layouts created for the other 19 specialties, or should they dynamically default to the generic layout indefinitely?
3. **Route Protection:** Should we implement a strict role-checking middleware in Next.js to restrict `/hr` and `/finance` access exclusively to `owner` and `accountant` roles?
4. **Registration Fix:** The RPC `create_clinic_self_signup` must be modified to insert the owner's membership. Should I patch the SQL migration or rewrite the registration flow to handle it via the service role client (`linkClinicOwner`)?
