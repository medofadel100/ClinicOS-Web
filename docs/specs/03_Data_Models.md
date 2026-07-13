# ClinicOS Web — Data Models

Single source of truth for this app's schema. All tables below are new,
added to the **same Supabase project** as ClinicOS Admin — they sit
alongside (not instead of) `clinics`, `clinic_types`, `plans`, `features`,
`clinic_subscriptions` etc. from that repo. Every table here carries
`clinic_id uuid, FK → clinics.id` and has RLS scoping data to that clinic —
this is repeated in every table below as "clinic_id (standard)" to avoid
restating the same row 30 times.

**Compatibility note for the future Windows desktop app**: tables that the
offline app will need to mirror locally (patients, appointments, services,
payments, dental chart) use only plain scalar columns and avoid Postgres-
specific types where a simpler type works, so a SQLite mirror stays
straightforward. This is a standing constraint on any new column added to
those tables later, not just the initial design.

## 1. Staff & multi-clinic identity

### `staff_members`
One row per real person, regardless of how many clinics they work at.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| auth_user_id | uuid, unique, FK → `auth.users.id` | |
| full_name | text | |
| phone | text | |
| preferred_language | `language_pref` enum: `ar`, `en` | drives next-intl redirect on login |
| created_at | timestamptz | |

### `clinic_staff_memberships`
Links a person to a clinic with a role. One person can have several rows
(one per clinic).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| staff_member_id | uuid, FK → `staff_members.id` | |
| clinic_id | uuid, FK → `clinics.id` | (standard) |
| role | `staff_role` enum: `owner`, `doctor`, `reception`, `accountant`, `other` | |
| is_active | boolean | default true; soft-disable, never delete |
| joined_at | timestamptz | |

Composite unique `(staff_member_id, clinic_id)`.

### `doctor_profiles`
Extra data for staff whose role is `doctor` at a given clinic. One row per
`clinic_staff_memberships` row where role = doctor.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | |
| specialty_title | text | e.g. "Orthodontist", shown to patients & used by the AI bot |
| bio_ar | text, nullable | used by the AI bot when recommending a doctor |
| bio_en | text, nullable | |
| years_experience | integer, nullable | |

### `doctor_working_hours`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | |
| day_of_week | integer | 0–6 |
| start_time | time | |
| end_time | time | |

## 2. Services & scheduling

### `services`
Each clinic's own billable service catalog — works for any specialty.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| name_ar | text | |
| name_en | text | |
| price_egp | numeric(10,2) | |
| duration_minutes | integer | |
| is_active | boolean | default true |
| created_at | timestamptz | |

### `patients`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| full_name | text | |
| phone | text | used for WhatsApp matching |
| date_of_birth | date, nullable | |
| gender | `gender` enum: `male`, `female`, nullable | |
| parent_patient_id | uuid, FK → `patients.id`, nullable | links a child to the parent/guardian's own patient record, so one WhatsApp number manages several children — see section 9 |
| notes | text, nullable | |
| registered_at | timestamptz | |

### `appointments`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | the doctor |
| service_id | uuid, FK → `services.id` | can be changed after the visit to reflect what actually happened |
| scheduled_at | timestamptz | |
| duration_minutes | integer | |
| status | `appointment_status` enum: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show` | |
| created_via | `created_via` enum: `staff`, `whatsapp_bot` | |
| created_at | timestamptz | |

### `patient_waitlist`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| membership_id | uuid, FK → `clinic_staff_memberships.id`, nullable | preferred doctor, if any |
| desired_from | date | |
| desired_to | date | |
| status | `waitlist_status` enum: `waiting`, `notified`, `booked`, `expired` | |
| created_at | timestamptz | |

When an appointment is cancelled, the bot (section 9) checks this table for
a matching waiting patient and offers them the freed slot.

## 3. Billing

### `treatment_plans`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| title | text | |
| total_price_egp | numeric(10,2) | |
| status | `plan_status` enum: `active`, `completed`, `cancelled` | |
| created_by | uuid, FK → `staff_members.id` | |
| created_at | timestamptz | |

### `treatment_plan_sessions`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| treatment_plan_id | uuid, FK → `treatment_plans.id` | |
| appointment_id | uuid, FK → `appointments.id`, nullable | |
| sequence_number | integer | |
| session_price_egp | numeric(10,2) | |
| status | `session_status` enum: `pending`, `completed` | |

### `patient_payments`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| treatment_plan_id | uuid, FK → `treatment_plans.id`, nullable | |
| appointment_id | uuid, FK → `appointments.id`, nullable | |
| amount_egp | numeric(10,2) | |
| payment_type | `patient_payment_type` enum: `deposit`, `session_payment`, `full_payment`, `other` | |
| payment_method | `payment_method` enum: `cash`, `card`, `bank_transfer`, `other` | |
| recorded_by | uuid, FK → `staff_members.id` | who is allowed to record this is a clinic-level setting — see `clinic_settings.who_can_record_payments`, section 8 |
| paid_at | timestamptz | |
| created_at | timestamptz | |

### `treatment_plan_approvals`
Digital sign-off before an expensive procedure, sent over WhatsApp.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| treatment_plan_id | uuid, FK → `treatment_plans.id` | |
| sent_at | timestamptz | |
| approval_method | `approval_method` enum: `whatsapp_reply` | |
| status | `approval_status` enum: `pending`, `approved`, `declined` | |
| responded_at | timestamptz, nullable | |

## 4. Dental specialty module

### `dental_chart_entries`
Current tooth-by-tooth state. Only present for clinics whose `clinic_type`
has the dental module active.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| tooth_number | integer | FDI notation, 11–48 |
| condition | `tooth_condition` enum: `normal`, `cavity`, `extracted`, `root_canal`, `crown`, `implant` | |
| updated_by | uuid, FK → `staff_members.id` | |
| updated_at | timestamptz | |

Composite unique `(patient_id, tooth_number)` — one current-state row per
tooth. Historical change tracking is a later enhancement, not this phase.

## 5. Medical inventory

### `medical_inventory_items`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| name | text | |
| unit | text | e.g. "box", "piece" |
| quantity_on_hand | numeric | |
| min_threshold | numeric | triggers the low-stock alert on the dashboard |
| category | text, nullable | |
| updated_at | timestamptz | |

### `inventory_transactions`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| item_id | uuid, FK → `medical_inventory_items.id` | |
| change_quantity | numeric | positive = restock, negative = usage |
| transaction_type | `inventory_txn_type` enum: `restock`, `usage`, `adjustment` | |
| note | text, nullable | |
| created_by | uuid, FK → `staff_members.id` | |
| created_at | timestamptz | |

## 6. Clinic finance (separate from patient billing)

### `clinic_expenses`
Recurring or one-off clinic costs — rent, salaries-related transfers,
installments, utilities.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| title | text | |
| category | `expense_category` enum: `rent`, `salaries`, `installment`, `utilities`, `supplies`, `other` | |
| amount_egp | numeric(10,2) | |
| recurrence | `expense_recurrence` enum: `one_time`, `weekly`, `monthly`, `yearly` | |
| start_date | date | |
| end_date | date, nullable | recurring expense stops generating occurrences after this date — e.g. an installment plan that ends |
| is_active | boolean | default true |
| created_by | uuid, FK → `staff_members.id` | |
| created_at | timestamptz | |

### `expense_occurrences`
Generated log entries for a recurring expense, one per period, until
`end_date`.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| expense_id | uuid, FK → `clinic_expenses.id` | |
| period_date | date | |
| amount_egp | numeric(10,2) | |
| status | `occurrence_status` enum: `pending`, `paid` | |
| paid_at | timestamptz, nullable | |

## 7. Payroll & HR

### `staff_payroll_config`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| membership_id | uuid, FK → `clinic_staff_memberships.id`, unique | |
| salary_type | `salary_type` enum: `fixed`, `commission`, `fixed_plus_commission` | |
| base_salary_egp | numeric(10,2), nullable | |
| commission_percentage | numeric(5,2), nullable | applied to `service_revenue` they personally generated (via `appointments`/`patient_payments`) |

### `staff_attendance`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | |
| work_date | date | |
| check_in_at | timestamptz, nullable | |
| check_out_at | timestamptz, nullable | |
| status | `attendance_status` enum: `present`, `absent`, `late`, `leave` | |

### `staff_shift_schedule`
The "expected" hours attendance and overtime are computed against.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | |
| day_of_week | integer | 0–6 |
| scheduled_start | time | |
| scheduled_end | time | |

### `staff_adjustments`
Bonuses and deductions applied to a specific payroll period.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | |
| adjustment_type | `adjustment_type` enum: `bonus`, `deduction` | |
| amount_egp | numeric(10,2) | |
| reason | text | |
| period_month | date | first of the month this applies to |
| created_by | uuid, FK → `staff_members.id` | |
| created_at | timestamptz | |

### `payroll_runs`
One row per staff member per month — the computed result.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| membership_id | uuid, FK → `clinic_staff_memberships.id` | |
| period_month | date | |
| base_salary_egp | numeric(10,2) | |
| commission_earned_egp | numeric(10,2) | |
| overtime_hours | numeric(6,2) | actual hours worked (from `staff_attendance`) minus scheduled hours (from `staff_shift_schedule`), floored at 0 |
| overtime_pay_egp | numeric(10,2) | |
| bonuses_egp | numeric(10,2) | sum of that period's `staff_adjustments` where type = bonus |
| deductions_egp | numeric(10,2) | sum of that period's `staff_adjustments` where type = deduction |
| net_pay_egp | numeric(10,2) | computed total |
| status | `payroll_status` enum: `draft`, `finalized`, `paid` | |
| finalized_at | timestamptz, nullable | |

## 8. Clinic settings

### `clinic_settings`
One row per clinic — small config flags that don't deserve their own
table.

| Column | Type | Notes |
|---|---|---|
| clinic_id | uuid, PK, FK → `clinics.id` | |
| who_can_record_payments | `staff_role`[] | which roles are allowed to record a `patient_payments` row |

## 9. WhatsApp bot

### `whatsapp_bot_config`

| Column | Type | Notes |
|---|---|---|
| clinic_id | uuid, PK, FK → `clinics.id` | |
| mode | `bot_mode` enum: `none`, `rule_based`, `ai` | gated by the clinic's plan via the entitlements check (Architecture.md section 5) — this column reflects what they've configured, not what they're allowed; the app must still check entitlements before honoring `ai` |
| personality | `bot_personality` enum: `formal`, `friendly`, `playful`, nullable | AI mode only |
| custom_instructions | text, nullable | AI mode only; appended to the system prompt |
| is_connected | boolean | whether the Baileys session is currently active |
| connected_phone_number | text, nullable | |

### `whatsapp_menu_options`
Rule-based bot's numbered menu — the three defaults (book, cancel, inquiry)
plus whatever a clinic adds.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| option_number | integer | |
| label_ar | text | |
| label_en | text | |
| response_type | `menu_response_type` enum: `action_book`, `action_cancel`, `action_inquiry`, `static_text` | the three defaults use the `action_*` types (wired to real system logic); anything a clinic adds themselves is `static_text` |
| static_response | text, nullable | only used when `response_type = static_text` |
| is_active | boolean | default true |

### `whatsapp_automation_settings`
One row per clinic — every automation is its own on/off toggle plus
whatever timing it needs, exactly as Ahmed specified ("option he turns on
and configures").

| Column | Type | Notes |
|---|---|---|
| clinic_id | uuid, PK, FK → `clinics.id` | |
| no_show_followup_enabled | boolean | default false |
| pre_appointment_reminder_enabled | boolean | default false |
| pre_appointment_reminder_minutes_before | integer, nullable | set by the doctor/owner |
| morning_summary_enabled | boolean | default false |
| morning_summary_time | time, nullable | |
| waitlist_autofill_enabled | boolean | default false |
| patient_upload_intake_enabled | boolean | default false | whether patients can send x-rays/files via WhatsApp — see `patient_uploaded_files` below |

### `service_followup_rules`
Per-service automatic follow-up messages ("3 days after an extraction, ask
how they're doing") — deliberately tied to `services`, not one blanket
clinic-wide rule.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| service_id | uuid, FK → `services.id` | |
| followup_after_value | integer | |
| followup_after_unit | `time_unit` enum: `hours`, `days`, `months` | |
| message_template | text | |
| is_active | boolean | default true |

### `patient_uploaded_files`
Files a patient sends via WhatsApp (or staff upload directly).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| file_url | text | |
| category | `file_category` enum: `xray`, `prescription`, `other` | |
| uploaded_via | `upload_source` enum: `staff`, `whatsapp` | |
| review_status | `review_status` enum: `pending`, `approved`, `rejected` | WhatsApp uploads default to `pending`; staff uploads default to `approved` |
| reviewed_by | uuid, FK → `staff_members.id`, nullable | the doctor who confirms it before it's treated as part of the official record |
| reviewed_at | timestamptz, nullable | |
| created_at | timestamptz | |

## 10. Patient marketing (clinic → its own patients)

Distinct from ClinicOS Admin's `announcements` (ClinicOS → clinics). Same
WhatsApp-ban-risk discipline applies (rate-limited, existing patients only)
— see `02_Rules_and_Constraints.md`.

### `patient_marketing_campaigns`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid | (standard) |
| title | text | |
| message | text | |
| audience_filter | jsonb | |
| status | `campaign_status` enum: `draft`, `scheduled`, `sending`, `sent` | |
| scheduled_at | timestamptz, nullable | |
| created_by | uuid, FK → `staff_members.id` | |
| created_at | timestamptz | |

### `patient_marketing_recipients`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| campaign_id | uuid, FK → `patient_marketing_campaigns.id` | |
| patient_id | uuid, FK → `patients.id` | |
| status | `delivery_status` enum: `pending`, `sent`, `failed`, `skipped_opt_out` | |
| sent_at | timestamptz, nullable | |

### `patient_marketing_opt_outs`

| Column | Type | Notes |
|---|---|---|
| clinic_id | uuid | (standard) |
| patient_id | uuid, FK → `patients.id` | |
| opted_out_at | timestamptz | |

Composite PK `(clinic_id, patient_id)`. Checked before every marketing send
— an opted-out patient is never included, no exceptions.
