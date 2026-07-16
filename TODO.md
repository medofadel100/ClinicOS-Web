# TODO — Specialty Coverage Audit + Default Service Templates (Phase 0–2)

## Plan steps
- [x] Phase 0: Fix `create_clinic_self_signup` owner lockout bug by patching the existing migration.
- [x] Phase 1: Write Phase 1 audit findings to `docs/reports/2026-07_specialty_audit.md`.
- [x] Phase 2: Create additive migration for `clinic_type_service_templates` with RLS.


- [x] Phase 2: Add seeding function + extend signup flow to snapshot templates into `service_categories` + `clinic_services` for each new clinic.

- [x] Phase 2: Add minimal admin management note (no UI unless trivial).

- [x] Phase 2: Seed placeholder (3–5) generic services per existing `clinic_type`.

- [x] Update report end with list of every migration file created in Phase 2.

- [ ] Run DB/migration checks (via repo scripts) and verify signup seeding path (manual/UNVERIFIED in this environment).


