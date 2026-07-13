# ClinicOS Web — Modular Generation Checkpoints

Same discipline as ClinicOS Admin: one checkpoint at a time, review and
approval before the next starts, track progress in `CHECKPOINT_STATUS.md`.

---

## Checkpoint 0 — Project setup

- Next.js 14 + TypeScript strict, Tailwind + shadcn/ui, next-intl scaffolded
  with `/ar` and `/en` locale routing.
- Connect to the **existing** Supabase project (same one as ClinicOS
  Admin) — confirm `clinics`, `plans`, `features` etc. are visible, don't
  create a new project.
- PWA manifest + minimal service worker for installability
  (Architecture.md section 11).
- GitHub → Vercel deploy pipeline working.
- **Acceptance:** visiting `/ar` and `/en` renders correctly in the right
  language/direction; a placeholder page confirms Supabase connectivity to
  the shared project; the browser offers a PWA install prompt.

## Checkpoint 1 — Staff auth & multi-clinic identity

- `staff_members`, `clinic_staff_memberships` tables + RLS (Data_Models.md
  section 1).
- Login; a user with memberships at more than one clinic sees a clinic
  switcher, otherwise goes straight into their one clinic.
- Role-based route access per the matrix in Rules_and_Constraints.md
  section B.
- **Acceptance:** a staff member with two clinic memberships can switch
  between them and never sees the other clinic's data; RLS independently
  blocks cross-clinic access even via a direct query.

## Checkpoint 2 — Clinic profile, services catalog, doctor profiles

- `services`, `doctor_profiles`, `doctor_working_hours`,
  `clinic_settings` tables + RLS.
- Settings UI: clinic profile, services catalog (add/edit/price), doctor
  bios & working hours.
- **Acceptance:** an owner can define their service catalog and each
  doctor's bio/hours entirely through the UI.

## Checkpoint 3 — Patients (Core patient file)

- `patients` table + RLS, including `parent_patient_id` linking.
- Patient list, patient file (basic info tab), create/edit patient.
- **Acceptance:** creating a patient with a `parent_patient_id` correctly
  shows under the parent's own record as a linked child.

## Checkpoint 4 — Appointments & scheduling

- `appointments`, `patient_waitlist` tables + RLS.
- Calendar/list view per doctor, booking flow (patient + doctor + service
  + time), status transitions, waitlist entry when no slot fits.
- **Acceptance:** booking, rescheduling, and cancelling an appointment all
  work through the UI; cancelling with a matching waitlist entry correctly
  flags that waitlist entry as `notified` (actual WhatsApp notification
  comes later, Checkpoint 12 — this checkpoint only needs the status flip
  and a visible "waitlist match" indicator in the UI).

## Checkpoint 5 — Dental specialty module

- `dental_chart_entries` table + RLS.
- The tooth chart UI (per the reference screenshots Ahmed provided),
  registered into the patient file per the Core/module boundary in
  Rules_and_Constraints.md section G.
- Only rendered for clinics whose `clinic_type` has this module active.
- **Acceptance:** the module never renders for a non-dental clinic; saving
  a tooth's condition persists and reloads correctly.

## Checkpoint 6 — Billing: treatment plans & payments

- `treatment_plans`, `treatment_plan_sessions`, `patient_payments`,
  `treatment_plan_approvals` tables + RLS.
- UI: create a treatment plan with sessions, record payments (deposit /
  per-session / full), track paid vs. remaining.
- Enforce `clinic_settings.who_can_record_payments` at the RLS level, not
  just hidden UI.
- **Acceptance:** a treatment plan's "remaining balance" is always
  `total_price_egp` minus the sum of its linked `patient_payments`,
  computed live, never stored redundantly.

## Checkpoint 7 — Medical inventory

- `medical_inventory_items`, `inventory_transactions` tables + RLS.
- Stock list with low-stock highlighting (below `min_threshold`),
  restock/usage logging.
- **Acceptance:** logging a usage transaction correctly decrements
  `quantity_on_hand` and triggers the low-stock indicator when it crosses
  `min_threshold`.

## Checkpoint 8 — Clinic finance: expenses

- `clinic_expenses`, `expense_occurrences` tables + RLS.
- UI to create a recurring or one-time expense; a scheduled job (or
  on-demand generation, agent's choice, confirm with Ahmed) creates
  `expense_occurrences` rows up to the current period, stopping at
  `end_date`.
- **Acceptance:** a monthly expense with an `end_date` three months out
  generates exactly the right number of occurrences and no more once that
  date passes.

## Checkpoint 9 — Payroll & HR

- `staff_payroll_config`, `staff_attendance`, `staff_shift_schedule`,
  `staff_adjustments`, `payroll_runs` tables + RLS.
- Attendance check-in/out UI, payroll config per staff member, monthly
  payroll run screen showing the computed breakdown
  (Rules_and_Constraints.md section F).
- **Acceptance:** running payroll for a staff member with
  `fixed_plus_commission` correctly sums base salary + commission (from
  their own completed appointments' service prices) + overtime
  (attendance vs. scheduled hours) + bonuses − deductions into
  `net_pay_egp`; finalizing a run locks its values against later data
  changes.

## Checkpoint 10 — Entitlements integration

- `lib/entitlements.ts` calling ClinicOS Admin's
  `/api/v1/entitlements/check`.
- Locked-feature UI pattern (blurred preview + upgrade CTA) applied to at
  least the WhatsApp AI mode and the dental module, writing an
  `upgrade_requests` row on click.
- **Acceptance:** a clinic on a plan without the AI bot feature sees the
  locked state when trying to enable AI mode in WhatsApp settings, and
  clicking "upgrade" creates a row visible in ClinicOS Admin's inbox.

## Checkpoint 11 — WhatsApp connection (this repo's side)

- `whatsapp_bot_config` table + RLS.
- Settings UI to trigger `POST /sessions/:clinicId/init` on the separate
  Baileys service, display the returned QR code, poll/subscribe for
  connected status.
- `lib/whatsapp-client.ts` wrapping calls to that service.
- **Acceptance:** scanning the QR shown in this app connects that specific
  clinic's WhatsApp number, verified by the status flipping to connected
  in the UI (requires the Baileys service to be deployed and reachable —
  coordinate with that repo's own checkpoints).

## Checkpoint 12 — Rule-based WhatsApp bot

- `whatsapp_menu_options` table + RLS, seeded with the three defaults
  (book/cancel/inquiry) per clinic on setup.
- `lib/bot/rule-based.ts` handling inbound messages from
  `/api/whatsapp/inbound`, matching menu options, executing real
  booking/cancellation actions against `appointments`.
- Settings UI to add/edit custom static-response options.
- **Acceptance:** texting the connected test number with a menu number
  correctly books/cancels a real appointment or returns the configured
  static response; an unrecognized input gets a fallback message, not
  silence.

## Checkpoint 13 — AI WhatsApp bot

- Requires Checkpoint 10 (entitlements) and 12 (bot infrastructure) done.
- `lib/bot/ai/prompt-builder.ts` (personality + custom instructions +
  doctor bios + service catalog + live availability) and
  `lib/bot/ai/tools.ts` (function-calling: book, reschedule, cancel, look
  up a patient's own info).
- **Acceptance:** the AI bot correctly recommends a doctor based on a
  natural-language symptom description, books a real appointment via
  function calling, and respects the clinic's configured personality and
  custom instructions in its tone.

## Checkpoint 14 — Automations: reminders, follow-ups, morning summary, waitlist autofill

- `whatsapp_automation_settings`, `service_followup_rules` tables + RLS.
- Scheduled jobs (or triggered checks, agent's choice, confirm approach
  with Ahmed) for: pre-appointment reminders, no-show follow-up,
  per-service recall messages, morning doctor summaries, and
  waitlist-autofill on cancellation.
- Settings UI toggles for each, matching Ahmed's "option he turns on and
  configures" requirement.
- **Acceptance:** each automation can be independently toggled on/off and,
  when on, fires correctly against test data without needing any
  configuration outside the UI.

## Checkpoint 15 — Patient file uploads via WhatsApp

- `patient_uploaded_files` table + RLS.
- Inbound media from WhatsApp lands as `review_status = 'pending'`; a
  review screen for doctors to approve/reject before it appears in the
  main patient file.
- **Acceptance:** a pending upload never appears in the patient's official
  file view until approved, per Rules_and_Constraints.md section E.

## Checkpoint 16 — Patient marketing

- `patient_marketing_campaigns`, `patient_marketing_recipients`,
  `patient_marketing_opt_outs` tables + RLS.
- Compose/send UI, opt-out enforcement, rate-limited sending through the
  same WhatsApp client used elsewhere.
- **Acceptance:** an opted-out patient is never included in a send, even
  if they match the audience filter; verified with a test case that
  includes both opted-in and opted-out matching patients.

## Checkpoint 17 — Reports

- Per-clinic financial and operational reporting (revenue, appointments,
  payroll totals, inventory value) — agent proposes a reasonable first set
  based on the data models above, confirm scope with Ahmed before
  building.

---

## After checkpoint 17

Stop and ask Ahmed for direction. Do not start on additional specialty
modules (pediatrics, orthopedics, etc.) or the Windows desktop app from
this repo without a new spec update.
