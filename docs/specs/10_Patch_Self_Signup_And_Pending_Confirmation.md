# ClinicOS Admin — Patch: Public Catalog Access & Self-Signup Support

ClinicOS Web needs a public self-signup flow (a prospective clinic signs
up with no admin having pre-created their account). That requires two
things from this repo that weren't in scope before: letting the public
*read* pricing/plan data, and a safe, narrow way for a newly-signed-up
user to create their own `clinics` + `clinic_subscriptions` rows without
opening up broad write access to those sensitive tables.

## 1. Public read access to catalog tables (new RLS policies)

Add `SELECT` policies for the **anonymous/public** Supabase role on these
tables **only** — every other table stays fully locked down as before:

- `clinic_types`
- `plans`
- `plan_features`
- `plan_limits`
- `features`

Scope each policy to `is_active = true` rows only (a deactivated plan or
feature shouldn't be visible to a prospective signup, even though admins
still see it). This is the same pattern already used for
`marketing_leads`'/`clinic_types` public dropdown access on the
Marketing Site — now extended to the fuller catalog for ClinicOS Web's
plan-browsing screens.

**Nothing else becomes public.** `clinics`, `clinic_subscriptions`,
`payments`, `account_feature_overrides`, `clinic_licenses`, and every
other table keep their existing admin-only RLS, unchanged.

## 2. New subscription status: `pending_confirmation`

A clinic that self-signs-up and picks a paid plan (rather than just
starting a trial) isn't actually paying yet — no payment gateway exists
(per the original constraint C-1). This status represents "committed to a
plan, waiting on Ahmed's team to confirm payment method," distinct from
`trial`.

- Add `pending_confirmation` as a new value to the `subscription_status`
  enum (additive migration — `ALTER TYPE subscription_status ADD VALUE`).
- Add a new nullable column to `clinic_subscriptions`:
  `pending_confirmation_expires_at timestamptz` — set to 2 days from
  creation when a subscription is created with this status. This is a
  separate column from `trial_ends_at` (which stays reserved for actual
  trial subscriptions) — additive, doesn't touch existing rows.

## 3. Dashboard visibility for pending confirmations

Extend the "needs attention" home page view (built in Checkpoint 7) to
also list clinics with a `pending_confirmation` subscription whose
`pending_confirmation_expires_at` is approaching or has passed — these are
hot leads who already committed to paying, so they deserve at least as
much visibility as expiring trials, arguably more urgency.

## 4. Self-signup RPC function

Rather than opening direct `INSERT` policies on `clinics` and
`clinic_subscriptions` to any authenticated user (too broad — these are
sensitive, financially-relevant tables), create a single Postgres function
with `SECURITY DEFINER`, callable by any authenticated Supabase user via
`supabase.rpc(...)`:

```
create_clinic_self_signup(
  clinic_name text,
  clinic_type_id uuid,
  owner_full_name text,
  owner_phone text,
  chosen_plan_id uuid default null  -- null = start a trial; non-null = pending_confirmation
) returns uuid  -- the new clinic_id
```

Behavior:
- Always creates one `clinics` row, `status = 'trial'` initially regardless
  of `chosen_plan_id` (see note below on why the clinic status itself
  stays `trial` even when a paid plan is chosen).
- `owner_email` is taken from the calling user's authenticated session
  (`auth.email()`), never from a client-supplied parameter — this prevents
  someone signing up a clinic under an email address that isn't their own.
- If `chosen_plan_id` is null: creates a `clinic_subscriptions` row with
  `status = 'trial'`, `trial_ends_at = now() + interval '7 days'`,
  `price_locked_egp = 0`.
- If `chosen_plan_id` is provided: creates a `clinic_subscriptions` row
  with `status = 'pending_confirmation'`,
  `pending_confirmation_expires_at = now() + interval '2 days'`,
  `price_locked_egp` snapshotted from that plan's current `price_egp`
  (per the existing price-locking rule).
- Writes an `audit_log` row (`actor_admin_id = null`, since this is a
  self-service action, not an admin action) recording the signup.
- This function does **not** create anything in ClinicOS Web's own tables
  (`staff_members`, `clinic_staff_memberships`) — that happens in that
  repo, in the same signup flow, right after this function returns the new
  `clinic_id`.

**Why does the clinic's overall `status` stay `trial` even when a paid
plan is chosen?** Because nothing has actually been paid or confirmed yet
— `clinics.status` only moves to `active` once Ahmed's team confirms
payment (the same manual payment-recording flow from Checkpoint 6),
consistent with constraint C-1 (no payment gateway, everything manual).
The clinic can fully use the product during this window either way (trial
access), it's just that a `pending_confirmation` subscription additionally
shows up as a hot lead needing follow-up (section 3 above), while a plain
`trial` subscription is a normal 7-day exploration.

## Acceptance criteria for this patch

- [ ] An anonymous (logged-out) request can read active clinic types, plans, plan features, plan limits, and features — and cannot read any other table.
- [ ] Calling `create_clinic_self_signup` with `chosen_plan_id = null` creates a clinic + trial subscription exactly as an admin-created trial would.
- [ ] Calling it with a real `chosen_plan_id` creates a `pending_confirmation` subscription with the correct locked price and a 2-day deadline.
- [ ] The function rejects a `clinic_type_id` or `chosen_plan_id` that doesn't exist or isn't active.
- [ ] `owner_email` on the created clinic always matches the calling user's authenticated email — verified by attempting to pass a different email as a parameter and confirming it's ignored (the function signature above deliberately has no such parameter, so this should be structurally impossible, not just filtered).
- [ ] The dashboard home page lists clinics with a `pending_confirmation` subscription approaching or past its 2-day deadline.
