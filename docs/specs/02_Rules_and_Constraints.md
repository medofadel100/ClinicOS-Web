# ClinicOS Web — Rules and Constraints

Same spirit as ClinicOS Admin's rules file — binding, not suggestions. This
file assumes familiarity with that repo's `02_Rules_and_Constraints.md`;
rules that are simply "the same rule again" are stated briefly with a
cross-reference rather than fully re-explained.

## A. Carried over from ClinicOS Admin (apply identically here)

- RLS mandatory on every table, default-deny, matching the role matrix in
  section B below (own admin/support tool logic doesn't apply — different
  roles).
- Soft delete only, no `DELETE` statements — use `is_active`/`status`.
- Money as `numeric`, EGP only, dates as `timestamptz` UTC.
- TypeScript `strict: true`, no `any`.
- Every mutation to financial data (`patient_payments`, `payroll_runs`,
  `clinic_expenses`) writes an audit trail — this app needs its own
  `audit_log` table (clinic-scoped), following the same pattern as Admin's.
- Secrets & source protection: identical rules to ClinicOS Admin section H
  — private repo, `.env.local` gitignored from commit 1, service-role key
  server-side only, no production source maps.
- Schema evolution: additive migrations only, per Admin section I. This
  matters even more here because of the Windows desktop app's future
  offline sync — a breaking schema change here breaks that app's sync
  logic too.

## B. Role permission matrix (clinic-level roles — different from Admin's)

| Action | owner | doctor | reception | accountant | other |
|---|---|---|---|---|---|
| Manage clinic settings, staff, WhatsApp bot config | yes | no | no | no | no |
| View/edit own patients & appointments | yes | yes (own) | yes (all) | no | no |
| Record patient payments | per `clinic_settings.who_can_record_payments` — this column decides, not a hardcoded role list |
| View clinic finance (expenses, payroll) | yes | no | no | yes | no |
| Edit dental chart / specialty module data | yes | yes (own patients) | no | no | no |
| Manage inventory | yes | no | yes | no | no |
| Send patient marketing | yes | no | yes | no | no |

`other` (e.g. cleaning staff) can have a login for attendance-tracking
purposes only — no access to any patient, financial, or clinic data. Do
not grant an `other`-role account any table access beyond their own
`staff_attendance` rows.

## C. Multi-tenancy is non-negotiable

Every single table added to this app — including ones invented later that
aren't in `03_Data_Models.md` yet — must carry `clinic_id` and RLS scoping
from the moment it's created, no exceptions, no "we'll add tenancy later."
A table without `clinic_id` in this app is a bug, full stop.

## D. WhatsApp: bot logic here, connection layer in the separate service

- This repo (`ClinicOS Web`) owns all bot reasoning: rule-based menu logic,
  AI prompt construction (personality + custom instructions + system
  facts about doctors/services/availability), and every automation in
  `whatsapp_automation_settings`.
- The Baileys service (`07_Baileys_Service_Spec.md`, separate repo) is
  never given business logic to implement — if a task description for
  that service starts describing booking rules or AI prompts, stop, that
  belongs here instead.
- **Entitlement check before every AI or rule-based bot response.** Before
  answering, the bot logic must confirm `whatsapp_bot_config.mode` is
  actually allowed by the clinic's current plan (via the
  `/api/v1/entitlements/check` call to ClinicOS Admin) — a clinic
  downgrading or lapsing must not keep using a bot mode they no longer pay
  for, even if their local `whatsapp_bot_config` row still says `ai`.
- **WhatsApp ban-risk discipline** (same principle as ClinicOS Admin
  section G, applied here to patient-facing messages): every outbound
  automated message (reminders, follow-ups, marketing) is rate-limited and
  only sent to patients already in the `patients` table for that clinic —
  never to an unknown number.
- **Patient marketing requires checking `patient_marketing_opt_outs`
  before every send, no exceptions** — this is a hard requirement, not a
  best-effort filter.

## E. Patient-uploaded files need explicit review, never auto-trust

Per `03_Data_Models.md` section 9, anything a patient sends via WhatsApp
(`uploaded_via = 'whatsapp'`) starts as `review_status = 'pending'` and is
never treated as part of the official medical record, never shown in the
main file view alongside reviewed items, and never used by the AI bot as
context, until a doctor explicitly approves it.

## F. Financial correctness

- `payroll_runs` values are computed, not manually typed in free-form —
  the computation logic (base + commission + overtime − deductions +
  bonuses) lives in one function, reused everywhere it's needed, matching
  the "one entitlement function" discipline from ClinicOS Admin.
- A `payroll_runs` row moves `draft → finalized → paid` — once
  `finalized`, its computed values don't silently recalculate if
  underlying attendance/adjustment data changes after the fact; finalizing
  is a deliberate snapshot action.
- `expense_occurrences` generation for a recurring expense stops
  automatically once `clinic_expenses.end_date` passes — this must be
  enforced by the generation logic itself, not left to a human to
  remember to disable it.

## G. Specialty modules stay decoupled from Core

Dental-specific code (the tooth chart) must not leak into shared
components used by non-dental clinics. If a Core component (patient file
tabs, appointment form) needs a conditional branch for "if dental, show
X," that's a sign the specialty module boundary is being violated — the
tooth chart tab should register itself into the patient file rather than
the patient file component knowing about dentistry. Ask before merging
Core and module code if this distinction becomes unclear on a given task.

## H. What NOT to build in this phase

- No native mobile app (Capacitor/React Native) — PWA installability
  (Architecture.md section 11) is the mobile story for now.
- No offline storage in this repo — that's the future Windows desktop
  app's responsibility.
- No automated payroll disbursement (bank transfer integration) —
  `payroll_runs.status = 'paid'` is marked manually once Ahmed's clinic
  customers actually pay their staff outside the system.
- No multi-department "each doctor has their own specialty module" support
  yet — this phase is single-specialty-per-clinic (Dental first). Flagged
  in Architecture.md section 3 as a later checkpoint.
