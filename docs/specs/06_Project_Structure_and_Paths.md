# ClinicOS Web — Project Structure & File Placement Rules

Same purpose as the equivalent file in ClinicOS Admin: remove guesswork
about where new code goes.

## 1. Folder structure

```
ClinicOS Web/
├── docs/
│   └── specs/                    # this app's 7 spec files — read-only reference
├── app/
│   ├── [locale]/                 # next-intl locale segment: /ar/..., /en/...
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── patients/
│   │   │   │   └── [patientId]/
│   │   │   │       ├── overview/
│   │   │   │       ├── dental-chart/       # dental specialty module route
│   │   │   │       ├── billing/
│   │   │   │       ├── files/
│   │   │   │       └── treatment-plan/
│   │   │   ├── appointments/
│   │   │   ├── waitlist/
│   │   │   ├── services/
│   │   │   ├── inventory/
│   │   │   ├── finance/
│   │   │   │   ├── expenses/
│   │   │   │   └── payroll/
│   │   │   ├── staff/
│   │   │   ├── whatsapp/                    # bot config, menu options, automations
│   │   │   ├── marketing/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── clinic-switcher/                 # shown when a user has >1 clinic
│   └── api/
│       ├── whatsapp/inbound/                # webhook FROM the Baileys service
│       └── entitlements/                    # thin wrapper calling ClinicOS Admin's check endpoint
├── lib/
│   ├── supabase/
│   ├── entitlements.ts           # calls ClinicOS Admin's API, caches briefly
│   ├── audit.ts
│   ├── whatsapp-client.ts        # calls the separate Baileys service's /send etc.
│   ├── bot/
│   │   ├── rule-based.ts
│   │   └── ai/
│   │       ├── prompt-builder.ts # personality + custom instructions + system facts
│   │       └── tools.ts          # function-calling: book/reschedule/cancel/lookup
│   ├── payroll.ts                # the one payroll computation function
│   └── i18n/                     # next-intl config (different from Admin's simpler approach)
├── modules/
│   └── dental/                   # the dental specialty module — self-contained
│       ├── components/
│       └── lib/
├── components/
│   ├── ui/
│   └── [feature]/
├── types/
│   └── database.ts
├── supabase/
│   └── migrations/
├── public/
│   └── manifest.json             # PWA manifest, per Architecture.md section 11
└── CHECKPOINT_STATUS.md
```

The Baileys service (`07_Baileys_Service_Spec.md`) lives in its own
separate repo/folder (`ClinicOS WhatsApp Service`, sibling to this one) —
nothing about it belongs inside this tree.

## 2. Specialty modules live under `modules/`, never inline in Core

A specialty module (e.g. `modules/dental/`) exports the routes/components
it needs; Core registers them conditionally based on `clinic_type_id`
rather than Core code branching internally. When a second specialty module
is added later (a future checkpoint), it follows the exact same pattern —
`modules/pediatrics/`, `modules/orthopedics/`, etc.

## 3. Naming conventions

Same as ClinicOS Admin's `06_Project_Structure_and_Paths.md` section 2
(kebab-case routes, PascalCase components, camelCase lib files, snake_case
DB, timestamped migrations) — not repeated here, that file is the
reference for both repos.

## 4. What the agent must never touch

Same categories as ClinicOS Admin: `docs/specs/*` (read-only unless Ahmed
asks for a spec change), `types/database.ts` (regenerate via Supabase CLI,
never hand-edit), `components/ui/*` (shadcn primitives).

Additionally in this repo: never add business logic (booking rules, AI
reasoning) to the separate WhatsApp service repo — see
`02_Rules_and_Constraints.md` section D. If a task seems to require that,
stop and flag it rather than doing it.
