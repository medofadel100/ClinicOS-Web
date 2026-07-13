# ClinicOS Web — Architecture

Status: MVP phase 1
Owner: Ahmed
Last updated: 2026-07-13

## 1. Purpose

ClinicOS Web is the clinic-facing product — what a clinic's owner, doctors,
and staff actually use every day: patients, appointments, treatment,
billing, inventory, payroll, and the WhatsApp bot. It is a separate repo
from `ClinicOS Admin` (a sibling folder under `ClinicOS/`), but **shares
the same Supabase project** — `clinics`, `plans`, `features`, and
`clinic_subscriptions` already exist there from the Admin build, and this
app reads/writes against that same database rather than duplicating it.

Every clinic using this product is a row in the `clinics` table (created by
Ahmed's team in Admin when a customer signs up). This app is where that
clinic's actual day-to-day data lives.

## 2. Tech stack

Same core choices as ClinicOS Admin, for consistency and future code
sharing: Next.js 14 (App Router) + TypeScript, Tailwind + shadcn/ui,
Supabase (Postgres + Auth + RLS + Realtime), hosted on Vercel, deployed
from GitHub. The lightweight context-based i18n approach used in Admin
does **not** apply here — see section 8. This app is also installable as a
PWA (Progressive Web App) — see section 11.

One new piece: the **WhatsApp service** (`clinicos-whatsapp-service`) is a
**separate deployable repo**, not part of this Next.js app, because Baileys
needs a long-lived persistent process (a WebSocket connection to WhatsApp)
which Vercel's serverless functions cannot provide. See
`07_Baileys_Service_Spec.md` for that repo's own spec — it is a distinct
codebase with its own deployment target (Railway/Oracle/VPS, not Vercel).

## 3. Core + specialty modules (the extensibility model)

Every clinic type shares one **Core** (patients, appointments, billing,
inventory, staff, WhatsApp bot). On top of Core, a clinic gets a
**specialty module** matching its `clinic_type` — e.g. dental clinics get
the tooth chart module, pediatric clinics get growth-curve/vaccination
tracking, orthopedic clinics get session-package tracking. This phase
builds Core plus **one specialty module: Dental** (the tooth chart), since
that's Ahmed's immediate need. Every specialty module is built as a
self-contained package so more can be added later without touching Core.

**How this is enforced in code**: a specialty module is a set of
components + routes gated behind `clinic.clinic_type_id`, not a hardcoded
`if (isDental)` scattered through Core. See
`06_Project_Structure_and_Paths.md` for exactly where module code lives.
For a multi-department medical center, each doctor carries their own
specialty configuration rather than the clinic having one fixed type —
this is a later checkpoint (see `05_Modular_Generation_Checkpoints.md`),
not part of the Dental-first MVP.

## 4. Multi-tenancy & multi-clinic owners

- Every data table in this app carries `clinic_id` and is scoped by RLS,
  exactly like the pattern in ClinicOS Admin.
- A person (doctor/owner) can be linked to more than one clinic. Staff
  accounts live in a `clinic_staff` table (this app) that links a Supabase
  Auth user to one or more clinics, each with its own role
  (`owner`/`doctor`/`reception`/`accountant`/`other`) — see
  `03_Data_Models.md` section 1.
- On login, if a user has access to more than one clinic, they see a
  clinic switcher; otherwise they land directly in their one clinic.
  Switching clinics never mixes data — each clinic's data is fully
  isolated by RLS regardless of which clinics a user can access.

## 5. Entitlement enforcement (talking to Admin)

This app must respect what a clinic is actually allowed to use, per the
plan/feature system built in ClinicOS Admin. It does this by calling the
`/api/v1/entitlements/check` endpoint already built in that repo (see
ClinicOS Admin's `01_Architecture.md` section 6) — this app does **not**
maintain its own copy of plan/feature logic. A locked feature renders the
"locked" UI pattern (blurred preview + "contact us to upgrade" — matching
the rule in ClinicOS Admin's `02_Rules_and_Constraints.md` section C-3),
which on click creates an `upgrade_requests` row (writing directly to that
table in the shared database, no API roundtrip needed since it's the same
Postgres instance).

## 6. High-level modules (Core)

1. **Patients** — the patient file, with the specialty module's extra tabs
   layered in for clinics with one active.
2. **Appointments & scheduling** — per-doctor calendars, service-type
   selection, doctor working hours/availability.
3. **Services catalog** — each clinic defines its own list of billable
   services (checkup, filling, extraction, ... — whatever fits its
   specialty), each with a price; an appointment/visit is tied to a
   service, changeable after the visit to reflect what actually happened.
4. **Billing & payments** — patient payments, deposits, multi-session
   treatment plans with installment tracking.
5. **Clinic finance** — recurring expenses (rent, salaries, installments,
   with an end date) and one-off expenses, separate from patient billing.
6. **Payroll & HR** — staff salary configuration (fixed / commission /
   both), attendance & auto-calculated overtime, bonuses & deductions,
   monthly payroll runs.
7. **Medical inventory** — stock levels with low-stock alerts (per the
   Admin schema's `usage_logs`-adjacent pattern, but this is clinic-owned
   inventory, not platform usage).
8. **Staff & roles** — accounts, roles, per-clinic access.
9. **WhatsApp bot configuration** — rule-based or AI, depending on plan;
   personality/instructions/doctor bios for the AI tier; reminders, recall
   campaigns, morning summaries, waitlist auto-fill — all as clinic-
   configurable toggles (see `03_Data_Models.md` sections 14–18).
10. **Patient marketing** — clinic-to-its-own-patients promotions,
    distinct from ClinicOS Admin's clinic-to-customer announcements, with
    mandatory opt-out tracking.
11. **Reports** — per-clinic financial and operational reporting.

## 7. The WhatsApp architecture (Core bot logic lives here, not in the Baileys service)

The Baileys service (separate repo, section 2) is intentionally kept
"dumb" — it only handles the WhatsApp connection itself: generating a
clinic's QR code, sending messages, and forwarding incoming messages. All
business logic — the rule-based menu, the AI bot's reasoning, booking
appointments, sending reminders — lives here, in ClinicOS Web, and talks to
the Baileys service over a simple internal HTTP API. This split means the
fragile part (the WhatsApp connection) can be restarted, redeployed, or
even replaced later without touching any bot logic.

Flow: WhatsApp message arrives at the Baileys service → forwarded via
webhook to `POST /api/whatsapp/inbound` in this app → this app decides how
to respond (rule-based lookup or AI call) → this app calls the Baileys
service's `POST /send` to reply.

## 8. Language / bilingual UI

Unlike ClinicOS Admin (an internal tool for a handful of known people),
this app is used by many clinics' staff and needs a properly scalable
i18n setup. Use **next-intl** with locale-based routing
(`/ar/...`, `/en/...`), matching Ahmed's established pattern from his other
public-facing projects (Romad Laser, the furniture e-commerce site).
Language preference is still stored per user (on `clinic_staff`), used to
redirect to the right locale on login, but the actual rendering goes
through next-intl rather than a hand-rolled context — this app is too big
for the simpler approach used in Admin.

## 9. Offline awareness

This repo does not implement offline storage itself (that's the future
Windows desktop app's job, per the original three-system plan). But every
data model in `03_Data_Models.md` is designed so the desktop app's local
SQLite mirror and this web app's Postgres schema can stay compatible — see
the note at the top of that file.

## 10. Environments

Same Supabase project as ClinicOS Admin (per section 1). No new Supabase
project is created for this app.

## 11. PWA installability

Clinic staff should be able to "install" this web app — from a desktop
browser (Chrome/Edge show an install icon in the address bar) or a mobile
browser ("Add to Home Screen") — so it behaves like a native app icon
without going through an app store. This is a standard web capability, not
a separate build:

- A `manifest.json` (app name in Arabic/English matching the active
  locale, icons at the required sizes, `display: standalone`, theme
  color) makes the browser offer the install prompt.
- A minimal service worker (via `next-pwa` or hand-rolled) is required for
  installability on most platforms, but this phase does **not** implement
  offline functionality through it — that's the dedicated Windows desktop
  app's job (section 9). The service worker here exists only to satisfy
  PWA installability requirements (asset caching for faster loads is a
  reasonable side benefit, but not the goal).
- No native app store build (no Capacitor/React Native wrapper) — the
  installed PWA is the mobile "app" experience for this phase.
