# ClinicOS Admin Dashboard — Storage Management Prompt

## Context

ClinicOS has **two separate applications** sharing the same Supabase database:

| App | Folder | Domain | Purpose |
|-----|--------|--------|---------|
| **ClinicOS Web** | `ClinicOS Web/` | `clinicoseg.vercel.app` | Clinic-facing dashboard (doctors, staff, patients) |
| **ClinicOS Admin** | `ClinicOS Admin/` | (separate domain) | Platform admin dashboard (manage clinics, billing, features) |

Both connect to the **same Supabase project** (`mrkrnvukodhbnncegiua`). The database schema is shared.

---

## What Already Exists in the Database

### Tables Ready for Storage Management

```sql
-- Plans (what packages are available)
plans: id, code, name_ar, name_en, price_egp, billing_cycle, is_active

-- Features (what can be included in plans)  
features: id, code, name_ar, name_en, category, base_price_egp, is_active

-- Plan ↔ Feature mapping
plan_features: plan_id, feature_id

-- Plan numeric limits (seats, patients, staff)
plan_limits: id, plan_id, limit_type (enum), max_value

-- Per-clinic feature overrides (grant/revoke specific features)
account_feature_overrides: id, clinic_id, feature_id, override_type, price_addon_egp, note, granted_by

-- Clinic storage settings (KV)
clinic_settings: clinic_id, setting_key, setting_value
  -- Already used: 'storage_quota_mb', 'paper_format', 'clinic_logo'

-- Uploaded files with sizes
patient_uploaded_files: id, clinic_id, patient_id, file_name, file_size, category, storage_provider, ...

-- Upgrade requests (clinic → admin)
upgrade_requests: id, clinic_id, requested_feature, status, created_at

-- Admin notifications
notifications: id, title, body, notification_type, created_by
notification_recipients: notification_id, admin_id, read_at
```

### Enums That Exist

```sql
plan_limit_type: 'provider_seats' | 'patients' | 'staff_accounts'
-- NEEDS: 'storage_mb' (run ALTER TYPE plan_limit_type ADD VALUE 'storage_mb')
```

---

## What to Build in the Admin Dashboard

### Feature 1: Storage as a Plan Limit

Each subscription plan should have a storage quota. Add `storage_mb` to `plan_limits`.

**SQL Setup (run once):**
```sql
ALTER TYPE plan_limit_type ADD VALUE IF NOT EXISTS 'storage_mb';

-- Set storage limits per plan
INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'storage_mb', 5120 FROM plans WHERE code = 'starter'    -- 5 GB
ON CONFLICT DO NOTHING;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'storage_mb', 15360 FROM plans WHERE code = 'pro'       -- 15 GB
ON CONFLICT DO NOTHING;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'storage_mb', 51200 FROM plans WHERE code = 'enterprise' -- 50 GB
ON CONFLICT DO NOTHING;
```

**Admin UI: Plans Page**
- When creating/editing a plan, show a "Storage Limit (GB)" field
- Save to `plan_limits` where `limit_type = 'storage_mb'`
- When a clinic subscribes, auto-set their `clinic_settings.storage_quota_mb` from the plan's limit

---

### Feature 2: Storage Add-On Features (Paid Upgrades)

Create purchasable storage features that clinics can buy on top of their plan.

**SQL Setup:**
```sql
INSERT INTO features (code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active)
VALUES 
  ('extra_storage_5gb', 'مساحة إضافية 5 جيجا', 'Extra Storage 5GB', 
   'مساحة تخزين إضافية 5 جيجابايت', 'Additional 5GB cloud storage', 'storage', 50.00, true),
  ('extra_storage_10gb', 'مساحة إضافية 10 جيجا', 'Extra Storage 10GB', 
   'مساحة تخزين إضافية 10 جيجابايت', 'Additional 10GB cloud storage', 'storage', 90.00, true),
  ('extra_storage_50gb', 'مساحة إضافية 50 جيجا', 'Extra Storage 50GB', 
   'مساحة تخزين إضافية 50 جيجابايت', 'Additional 50GB cloud storage', 'storage', 400.00, true);
```

**Admin Flow:**
1. Clinic requests more storage → appears in `upgrade_requests`
2. Admin approves → grants `extra_storage_Xgb` feature via `account_feature_overrides`
3. System calculates new quota: plan_base + sum(granted_storage_features)
4. Updates `clinic_settings.storage_quota_mb`

**Calculation Logic (in Admin):**
```typescript
async function calculateClinicStorageQuota(clinicId: string): Promise<number> {
  // 1. Get plan base storage
  const planStorage = await getPlanLimit(clinicId, 'storage_mb') // e.g., 15360 MB
  
  // 2. Get granted storage features
  const overrides = await supabase
    .from('account_feature_overrides')
    .select('feature:features(code)')
    .eq('clinic_id', clinicId)
    .eq('override_type', 'grant')
  
  let extraStorage = 0
  for (const override of overrides) {
    const code = override.feature?.code
    if (code === 'extra_storage_5gb') extraStorage += 5120
    if (code === 'extra_storage_10gb') extraStorage += 10240
    if (code === 'extra_storage_50gb') extraStorage += 51200
  }
  
  // 3. Total = base + extras
  const totalMB = planStorage + extraStorage
  
  // 4. Update clinic_settings
  await supabase.from('clinic_settings').upsert(
    { clinic_id: clinicId, setting_key: 'storage_quota_mb', setting_value: String(totalMB) },
    { onConflict: 'clinic_id,setting_key' }
  )
  
  return totalMB
}
```

---

### Feature 3: Cross-Clinic Storage Dashboard

**Admin API Endpoint: `GET /admin/api/storage`**

```typescript
// Returns overview of ALL clinics' storage usage
async function getStorageOverview() {
  const clinics = await supabase
    .from('clinic_settings')
    .select('clinic_id, setting_value')
    .eq('setting_key', 'storage_quota_mb')

  const results = []
  for (const clinic of clinics) {
    const quotaMB = parseInt(clinic.setting_value)
    const { data: files } = await supabase
      .from('patient_uploaded_files')
      .select('file_size')
      .eq('clinic_id', clinic.clinic_id)

    const usedBytes = (files || []).reduce((sum, f) => sum + (f.file_size || 0), 0)
    const usedMB = usedBytes / (1024 * 1024)
    const percentUsed = Math.round((usedMB / quotaMB) * 100)

    // Get clinic name
    const { data: clinicInfo } = await supabase
      .from('clinics')
      .select('name, owner_full_name')
      .eq('id', clinic.clinic_id)
      .single()

    results.push({
      clinic_id: clinic.clinic_id,
      clinic_name: clinicInfo?.name || 'Unknown',
      owner_name: clinicInfo?.owner_full_name || '',
      used_mb: Math.round(usedMB * 100) / 100,
      quota_mb: quotaMB,
      used_gb: Math.round(usedMB / 1024 * 100) / 100,
      quota_gb: Math.round(quotaMB / 1024 * 100) / 100,
      percent_used: percentUsed,
      file_count: (files || []).length,
      status: percentUsed >= 100 ? 'full' : percentUsed >= 95 ? 'critical' : percentUsed >= 80 ? 'warning' : 'normal',
    })
  }

  return {
    clinics: results.sort((a, b) => b.percent_used - a.percent_used),
    totals: {
      total_clinics: results.length,
      total_used_gb: results.reduce((s, c) => s + c.used_gb, 0),
      total_quota_gb: results.reduce((s, c) => s + c.quota_gb, 0),
      clinics_warning: results.filter(c => c.status === 'warning').length,
      clinics_critical: results.filter(c => c.status === 'critical').length,
      clinics_full: results.filter(c => c.status === 'full').length,
    }
  }
}
```

**Admin UI Page: Storage Dashboard**
```
┌──────────────────────────────────────────────────────┐
│  📊 Storage Dashboard                                 │
│                                                       │
│  Total: 156 GB / 500 GB (31%)                         │
│  ⚠️ 3 warning  🔴 1 critical  🔒 0 full               │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │ Clinic Name    │ Used   │ Quota  │ Status │ % │   │
│  ├───────────────────────────────────────────────┤   │
│  │ د. أحمد عيادة  │ 14.2GB │ 15 GB  │ ⚠️     │95%│   │
│  │                │        │        │ [Increase]│   │
│  │ عيادة الشفاء    │ 8.1GB  │ 15 GB  │ ✅     │54%│   │
│  │ مركز الحياة     │ 50 GB  │ 50 GB  │ 🔒     │100%│  │
│  │                │        │        │ [Increase]│   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  [Filter: All | ⚠️ Warning | 🔴 Critical | 🔒 Full]  │
└──────────────────────────────────────────────────────┘
```

**Admin Actions from Dashboard:**
- Click "Increase" on a clinic → opens modal
- Choose storage add-on (5GB / 10GB / 50GB)
- Confirm → grants feature + updates quota + notifies clinic

---

### Feature 4: Automated Storage Alerts (Cron)

**New API Route: `/admin/api/cron/storage-alerts`**

Run daily. Checks all clinics and creates notifications when:
- Clinic exceeds 80% → warning notification
- Clinic exceeds 95% → critical notification  
- Clinic at 100% → blocks uploads + urgent notification
- Clinic has pending `upgrade_requests` → remind admin

```typescript
// Pseudocode
async function checkStorageAlerts() {
  const overview = await getStorageOverview()
  
  for (const clinic of overview.clinics) {
    if (clinic.percent_used >= 80) {
      // Create notification for all super_admins
      await supabase.from('notifications').insert({
        title: clinic.status === 'critical' 
          ? `🔴 Storage Critical: ${clinic.clinic_name}`
          : `⚠️ Storage Warning: ${clinic.clinic_name}`,
        body: `"${clinic.clinic_name}" used ${clinic.percent_used}% (${clinic.used_gb}GB / ${clinic.quota_gb}GB)`,
        notification_type: 'system_event',
        link_url: `/storage?clinic=${clinic.clinic_id}`,
      })
    }

    // Check pending requests
    const { data: requests } = await supabase
      .from('upgrade_requests')
      .select('*')
      .eq('clinic_id', clinic.clinic_id)
      .eq('requested_feature', 'storage_increase')
      .eq('status', 'pending')

    if (requests?.length) {
      await supabase.from('notifications').insert({
        title: `📩 Storage Request: ${clinic.clinic_name}`,
        body: `"${clinic.clinic_name}" is requesting more storage. Current: ${clinic.used_gb}GB / ${clinic.quota_gb}GB`,
        notification_type: 'system_event',
        link_url: `/upgrade-requests`,
      })
    }
  }
}
```

**Vercel Cron (`vercel.json` in admin project):**
```json
{
  "crons": [{ "path": "/api/cron/storage-alerts", "schedule": "0 9 * * *" }]
}
```

---

### Feature 5: Clinic-Side Request Flow (ClinicOS Web)

**Already Built:**
- `StorageQuotaCard` shows usage + warning + "Request More Storage" button
- Button calls `requestUpgrade(clinicId, 'storage_increase')` → creates `upgrade_requests` row
- Toast notification confirms request sent

**What Happens Next:**
1. Admin gets notification in bell icon
2. Admin reviews request in admin dashboard
3. Admin approves → grants storage feature → quota increases
4. Clinic sees updated quota on next page load

---

### Feature 6: Wire NotificationBell into Header

The `NotificationBell` component exists in `components/layout/NotificationBell.tsx` but is NOT rendered in the dashboard header.

**Fix in ClinicOS Web:**
```typescript
// In components/layout/HeaderActions.tsx:
import NotificationBell from '@/components/layout/NotificationBell'

// Add to header:
<NotificationBell />
```

The component already:
- Checks if user is in `platform_admins` table
- Shows/hides based on admin status
- Displays unread count badge
- Supports mark-as-read

---

## Environment Variables (Admin Project)

```bash
# Supabase (same as ClinicOS Web)
NEXT_PUBLIC_SUPABASE_URL=https://mrkrnvukodhbnncegiua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Admin auth
ADMIN_JWT_SECRET=...

# Cron security
CRON_SECRET=your-secret-key

# Links
NEXT_PUBLIC_CLINICOS_URL=https://clinicoseg.vercel.app
```

---

## Summary: Complete Flow

```
1. Admin creates plan with storage limit (e.g., Pro = 15GB)
                    ↓
2. Clinic subscribes to plan → quota auto-set to 15GB
                    ↓
3. Clinic uploads files → usage tracked in patient_uploaded_files
                    ↓
4. Usage hits 80% → warning shown in clinic settings
                    ↓
5. Clinic clicks "Request More Storage" → creates upgrade_request
                    ↓
6. Admin gets notification → reviews request
                    ↓
7. Admin approves → grants extra_storage_10gb feature (+10GB)
                    ↓
8. System recalculates: 15GB base + 10GB extra = 25GB total
                    ↓
9. Updates clinic_settings.storage_quota_mb = 25600
                    ↓
10. Clinic sees new quota on next page load
```
