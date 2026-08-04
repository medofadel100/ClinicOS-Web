# ClinicOS — قائمة المهام (Tracked in this file)

> قائمة بكل المهام المعروفة. أي مهمة تتخلص → نتقلها لقسم `✅ تم` ونضع التاريخ.
> آخر تحديث: 2026-08-04

---

## 🔴 مهام يدوية على Vercel (Environment Variables)

| المتغير | القيمة | ملاحظات |
|---|---|---|
| `WHATSAPP_WEBHOOK_SECRET` | سري عشوائي طويل | يتطابق مع اللي بتبعته خدمة Baileys في هيدر `x-webhook-secret` |
| `CRON_SECRET` | سري عشوائي طويل | بيتبعت في `Authorization: Bearer` من Vercel Cron jobs |
| `SUPABASE_SERVICE_ROLE_KEY` | موجود؟ | مطلوب لكل cron + webhook |

- تأكد أن `SUPABASE_SERVICE_ROLE_KEY` موجود فعلًا في Vercel (متأكد مؤقتًا مش مضبوط).
- خطوات: Vercel → Project → Settings → Environment Variables → أضفهم → Redeploy.

---

## 🔴 مهام يدوية على Supabase Dashboard

- [ ] تعطيل **Confirm email**: Authentication → Providers → Email → إلغاء "Confirm email"
  (قرار المستخدم: المستخدم يتسجل مباشرة من غير تأكيد إيميل)
- [ ] الـ SQL بتاع `20260726000001_fix_rls_security.sql` نُفذ يدويًا ✅ (تأكد بالـ verify أدناه)

---

## ✅ تم إنجازه

| # | المهمة | الحالة |
|---|---|---|
| 1.1 | إنشاء `clinic_serials` + `verify_serial_code` RPC (`20260726000000_verify_serial_function.sql`) | ✅ |
| 1.2 | إزالة سياسة anon lookup على `staff_invites` + إنشاء `get_invite_by_token()` | ✅ |
| 1.3 | إزالة سياسة `platform_admins` "self-update" | ✅ |
| 2.1 | إصلاح سياسة `patient_clinical_notes` → `is_staff_member_of_clinic()` FOR ALL + إسقاط CHECK | ✅ |
| 2.2 | إضافة دور `admin` إلى enum `staff_role` | ✅ |
| — | ملف `supabase/migrations/20260726000001_fix_rls_security.sql` (باندل كل الإصلاحات) | ✅ |
| — | إعادة كتابة `register/serial/actions.ts` → دالة `claim_clinic_with_serial` | ✅ |
| — | `invite/[token]/page.tsx` → `get_invite_by_token` | ✅ |
| — | `InviteAcceptForm.tsx` → `invite.clinic_name` | ✅ |
| — | `middleware.ts` → إضافة `/terms` للمسارات العامة | ✅ |
| — | `tsc --noEmit` + `next lint` نظيفين | ✅ |
| 2.3 | تأمين `/api/whatsapp/inbound` (تحقق `WHATSAPP_WEBHOOK_SECRET` + service role) | ✅ |
| 2.4 | إلزام `CRON_SECRET` (fail-closed) + service role في cron routes | ✅ |
| — | إضافة السرين الجدد إلى `.env.example` | ✅ |
| — | حذف 15 ملف ميجرشن فاضي (0 bytes) من `supabase/migrations` | ✅ |
| — | إنشاء ملف `TODO.md` ده | ✅ |
| 2.5 | فحص pg_policies live: **مفيش INSERT بلا WITH CHECK** — الإصلاح الحقيقي: |
| | أ) UPDATE policies تنقصها WITH CHECK → هاردنينج عشان ما يتحركش `clinic_id` |
| | ب) `staff_attendance` INSERT لم يتطابق مع عيادة الـ membership |
| | → ميجرشن `20260804000001_harden_update_insert_rls.sql` — **نُفذ يدويًا** | ✅ |
| — | توليد + إضافة `WHATSAPP_WEBHOOK_SECRET` و`CRON_SECRET` إلى `.env.local` | ✅ |
| — | إضافة السرين لـ **Vercel Environment Variables** (المستخدم) | ✅ |
| — | **تعطيل Confirm email** في Supabase Dashboard (المستخدم) | ✅ |

---

## ⏳ بانتظار التنفيذ

- [x] **تحديث Baileys service** (repo منفصل): إرسال `x-webhook-secret: <WHATSAPP_WEBHOOK_SECRET>` على كل POST إلى `/api/whatsapp/inbound` — تم ✅ (انظر قسم WhatsApp Service أدناه)

## ✅ تم إنجازه (أحدث الإضافات)

- [x] Commit + push → `main` (`738e100`) → Vercel build تلقائي
- [x] `tsc --noEmit` + `next lint` نظيفان (تحذيرات `any` مسبقة)
- [x] **جولة 2.6 — إصلاح طبقة الـ bot كلها**: `rule-based.ts`, `ai/engine.ts`, `ai/tools.ts`, `prompt-builder.ts`, `waitlist-autofill.ts` + `media-handler.ts` تحوّلوا من `createClient()` (anon) إلى **service role client** — كانت كلها بتتستدعى من الـ webhook من غير session وكانت هتتسكر مع RLS
- [x] `inbound/route.ts`: تعديل الـ admin client للـ media-handler + إصلاح تناقض `mimeType`/`_mimeType`
- [x] SQL: `claim_clinic_with_serial` يجيب الإيميل من `auth.users` بدل `auth.email()` (موثوق في SECURITY DEFINER)
- [x] SQL: `verify_serial_code` أضيف `SET search_path = public` + `STABLE`

## ⏳ بانتظار التنفيذ

- [x] **تحديث Baileys service** (repo منفصل): إرسال `x-webhook-secret: <WHATSAPP_WEBHOOK_SECRET>` على كل POST إلى `/api/whatsapp/inbound` — تم ✅ (الخدمة مبنية من الصفر في `ClinicOS WhatsApp Service`)
- [x] **إعادة تشغيل ملفين SQL** في SQL Editor (بعد تعديلات جولة 2.6) — تم ✅
- [x] **Commit + push جولة 2.6** → `03801f0` ✅

## 🚀 WhatsApp Service — اكتمل الربط (2026-08-04)

- [x] الخدمة المبنية في `ClinicOS WhatsApp Service` (Baileys، API key، rate limit، webhook relay، جلسات دائمة)
- [x] منشورة على السيرفر `DESKTOP-I8QM0ET` (Proxmox VM) كـ Scheduled Task + Cloudflare Tunnel
- [x] `https://whatsapp.smartx.business` يعمل (`/health` + auth 401) من الإنترنت
- [x] `lib/whatsapp-client.ts`: كل الـ requests بتبعث `x-api-key: WHATSAPP_API_KEY` + إصلاح `sendMessage` (يستخدم `recipient`/`message` بدل `to`/`text`)
- [x] `.env.example` + `.env.local`: أُضيف `WHATSAPP_API_KEY=wapp-svc-fadel-2026` و`NEXT_PUBLIC_WHATSAPP_SERVICE_URL=https://whatsapp.smartx.business`
- [x] حذف النسخة المناسخة `ClinicOS-WhatsApp-Service/` من Web repo (كانت بتكسر typecheck)
- [x] Vercel: أضيف `NEXT_PUBLIC_WHATSAPP_API_KEY=wapp-svc-fadel-2026` + `NEXT_PUBLIC_WHATSAPP_SERVICE_URL=https://whatsapp.smartx.business` + redeploy (عبر API) — ✅
- [x] **إصلاح CORS** على الخدمة: middleware في `src/index.ts` + `CORS_ORIGINS=https://clinicoseg.vercel.app` في `.env` بالسيرفر → مسح الـ QR اشتغل ✅

## 🐛 أخطاء اكتُشفت واتصلحت أثناء تشغيل QR

| الخطأ | السبب | الإصلاح |
|---|---|---|
| CORS: No 'Access-Control-Allow-Origin' | الخدمة من غير middleware CORS | middleware + `CORS_ORIGINS` |
| `//sessions` (double slash) في URL | trailing slash في الـ URL | `.replace(/\/+$/, '')` في `whatsapp-client.ts` |
| `401 Unauthorized` من المتصفح | `WHATSAPP_API_KEY` مش `NEXT_PUBLIC_` فمش بتتخبز في الـ client bundle | `NEXT_PUBLIC_WHATSAPP_API_KEY` (اسم env + كود fallback) |
| الـ Web بيشغل build قديم | PWA service worker cache | hard refresh / unregister SW |



---

## 🧪 التحقق من الـ SQL الحي (تم بالفعل — 2026-08-04)

- `clinic_serials` موجودة يدويًا (0 صفوف) — `verify_serial_code` يعمل ✅
- enum `staff_role`: `owner, doctor, reception, accountant, other, nurse, admin` (admin أُضيف) ✅
- `get_invite_by_token` موجودة ✅
- `claim_clinic_with_serial` موجودة ✅ (400 متوقع بدون session)
- كل جداول RLS مفعلة (`rls_on=true`) ✅
