# PROJECT_MAP — ClinicOS Web

## Architecture
- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + RLS)
- **i18n**: `next-intl` (Dashboard/Sidebar) + inline bilingual `isAr` ternary (Landing/Download)
- **PWA**: `@ducanh2912/next-pwa`

## Directory Structure
```
app/
  [locale]/
    page.tsx                    — Landing page (server component)
    download/page.tsx           — Download page
    login/                      — Login page
    register/                   — Registration (serial + trial)
    (auth)/register/serial/     — Serial-based registration
    (dashboard)/[clinicSlug]/   — Dashboard (patient mgmt, appointments, billing, etc.)
components/                     — Shared UI components
lib/                            — Supabase client, entitlements, drive, whatsapp
modules/                        — Specialty modules (dermatology, dental, etc.)
supabase/migrations/            — 80+ SQL migrations
public/                         — Static assets, SW, manifest
```

## Key Database Tables (Public-facing)
| Table | Access | Purpose |
|-------|--------|---------|
| `plans` | anon + authenticated | Pricing plans (9 plans) |
| `features` | anon + authenticated | Plan features |
| `plan_features` | anon + authenticated | Plan↔Feature junction |
| `plan_limits` | anon + authenticated | Plan limits (seats/patients/storage) |
| `clinic_types` | anon + authenticated | 21 medical specialties |

## Landing Page Data Flow
1. Server component fetches `plans` + `clinic_types` from Supabase (anon key)
2. Plans auto-split: cloud plans vs self-hosted (`offline-*` prefix)
3. Clinic types rendered in expandable grid (8 shown + details/summary toggle)

## Completed Work
- [x] Full codebase overhaul (PWA, error handling, offline page, SW fix)
- [x] Google Drive integration
- [x] Dermatology & Aesthetics module (7 files, 1,786 lines)
- [x] Code review + bug fixes (security, array mutation, i18n, UX)
- [x] Dynamic pricing from Supabase
- [x] Specialties section from DB
- [x] Hero improvements (contrast, spacing)
- [x] Download page fixes (Linux icon, macOS split, Google Play)
- [x] Fix all TypeScript errors (0 errors)
- [x] Anon RLS policies for public pricing data

## Remaining
- [ ] Set `GOOGLE_DRIVE_ROOT_FOLDER_ID` in Vercel (user action)
- [ ] Replace mock OpenAI key in .env.local with real key
- [ ] ClinicOS Admin dashboard (separate repo, already built)
