'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function verifyOwner(clinicId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!staffMember) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership || membership.role !== 'owner') {
    throw new Error('Forbidden')
  }

  return supabase
}

export async function updateClinicGeneralInfo(clinicId: string, locale: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)

  const name = formData.get('name') as string
  const owner_full_name = formData.get('owner_full_name') as string
  const owner_phone = formData.get('owner_phone') as string

  if (!name) throw new Error('Clinic name is required')

  const { error } = await supabase
    .from('clinics')
    .update({
      name,
      owner_full_name: owner_full_name || null,
      owner_phone: owner_phone || null
    })
    .eq('id', clinicId)

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function updateClinicSettings(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)

  const address = formData.get('address') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  const currency_code = formData.get('currency_code') as string || 'EGP'
  const timezone = formData.get('timezone') as string || 'UTC'

  const { error } = await supabase
    .from('clinic_settings')
    .upsert({
      clinic_id: clinicId,
      address,
      contact_email,
      contact_phone,
      currency_code,
      timezone
    }, { onConflict: 'clinic_id' })

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function upsertDoctorProfile(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)

  const id = formData.get('id') as string | null
  const staff_member_id = formData.get('staff_member_id') as string
  const bio = formData.get('bio') as string
  const specialty = formData.get('specialty') as string

  if (id) {
    const { error } = await supabase
      .from('doctor_profiles')
      .update({ bio, specialty })
      .eq('id', id)
      .eq('clinic_id', clinicId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('doctor_profiles')
      .insert({ clinic_id: clinicId, staff_member_id, bio, specialty })
    if (error) throw error
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function upsertPayrollConfig(
  clinicId: string, 
  membershipId: string, 
  salaryType: 'fixed' | 'commission' | 'fixed_plus_commission', 
  baseSalary: number | null, 
  commissionPercentage: number | null
) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('staff_payroll_config')
    .upsert({
      membership_id: membershipId,
      salary_type: salaryType,
      base_salary_egp: baseSalary,
      commission_percentage: commissionPercentage
    }, { onConflict: 'membership_id' })

  if (error) {
    console.error('Payroll Config Error:', error)
    throw new Error('Failed to save payroll config')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function upsertWorkingHours(clinicId: string, doctorProfileId: string, hours: { day_of_week: number, start_time: string, end_time: string, is_active: boolean }[]) {
  const supabase = await verifyOwner(clinicId)

  // Clear existing hours for this profile
  const { error: deleteError } = await supabase
    .from('doctor_working_hours')
    .delete()
    .eq('doctor_profile_id', doctorProfileId)
  
  if (deleteError) throw deleteError

  if (hours.length > 0) {
    const { error: insertError } = await supabase
      .from('doctor_working_hours')
      .insert(hours.map(h => ({
        doctor_profile_id: doctorProfileId,
        day_of_week: h.day_of_week,
        start_time: h.start_time,
        end_time: h.end_time,
        is_active: h.is_active
      })))
      
    if (insertError) throw insertError
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function createServiceCategory(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)
  const name = formData.get('name') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  const { error } = await supabase
    .from('service_categories')
    .insert({ clinic_id: clinicId, name, order_index })

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function createClinicService(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)
  
  const category_id = formData.get('category_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const duration_minutes = parseInt(formData.get('duration_minutes') as string) || 30

  const { error } = await supabase
    .from('clinic_services')
    .insert({
      clinic_id: clinicId,
      category_id,
      name,
      description,
      price,
      duration_minutes
    })

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function generateStaffInvite(clinicId: string, role: string) {
  const supabase = await verifyOwner(clinicId)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (!staffMember) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) throw new Error('Unauthorized')

  // Generate random URL-safe token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase
    .from('staff_invites')
    .insert({
      clinic_id: clinicId,
      invited_role: role,
      invite_token: token,
      created_by_membership_id: membership.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })

  if (error) {
    console.error('Invite generation error:', error)
    throw new Error('Failed to generate invite')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
  return token
}

export async function revokeStaffInvite(clinicId: string, inviteId: string) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('staff_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
    .eq('clinic_id', clinicId)
    .eq('status', 'pending')

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function changeClinicType(clinicId: string, locale: string, newClinicTypeId: string) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('clinics')
    .update({ clinic_type_id: newClinicTypeId })
    .eq('id', clinicId)

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function fetchClinicTypes(locale: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clinic_types')
    .select('id, code, name_en, name_ar')
    .eq('is_active', true)
    .order('name_en')

  if (error) throw error
  return data || []
}

export async function loadServicesFromTemplate(clinicId: string, locale: string) {
  const supabase = await verifyOwner(clinicId)

  const { data: clinic, error: clinicErr } = await supabase
    .from('clinics')
    .select('clinic_type_id, clinic_types(code)')
    .eq('id', clinicId)
    .single()

  if (clinicErr || !clinic) throw new Error('Clinic not found')

  const typeCode = (clinic.clinic_types as { code?: string } | null)?.code
  if (!typeCode) throw new Error('Clinic type not found')

  const { count } = await supabase
    .from('clinic_services')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)

  if (count && count > 0) {
    throw new Error(locale === 'ar' ? 'الخدمات موجودة بالفعل. احذفها أولاً لإعادة التحميل.' : 'Services already exist. Delete them first to reload.')
  }

  const templates = getServiceTemplates(typeCode)
  if (!templates || templates.length === 0) {
    throw new Error(locale === 'ar' ? 'لا توجد خدمات مقترحة لهذا النوع.' : 'No templates available for this clinic type.')
  }

  const categoryMap = new Map<string, typeof templates>()
  for (const tpl of templates) {
    const cat = tpl.c
    if (!categoryMap.has(cat)) categoryMap.set(cat, [])
    categoryMap.get(cat)!.push(tpl)
  }

  let orderIdx = 0
  for (const [catName, catTemplates] of Array.from(categoryMap.entries())) {
    const { data: newCat, error: catErr } = await supabase
      .from('service_categories')
      .insert({ clinic_id: clinicId, name: catName, order_index: orderIdx })
      .select('id')
      .single()

    if (catErr) { console.error(catErr); continue }

    const serviceRows = catTemplates.map((tpl: { c: string; n: string; d: string; p: number; m: number }) => ({
      clinic_id: clinicId,
      category_id: newCat.id,
      name: tpl.n,
      description: tpl.d,
      price: tpl.p,
      duration_minutes: tpl.m
    }))

    const { error: svcErr } = await supabase.from('clinic_services').insert(serviceRows)
    if (svcErr) console.error(svcErr)

    orderIdx++
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

function getServiceTemplates(code: string) {
  const T: Record<string, { c: string; n: string; d: string; p: number; m: number }[]> = {
    dental: [
      { c: 'كشف وفحص', n: 'كشف أسنان مبدئي', d: 'فحص شامل للأسنان واللثة', p: 200, m: 30 },
      { c: 'كشف وفحص', n: 'أشعة سينية للأسنان', d: 'أشعة لتقييم جذور الأسنان', p: 150, m: 15 },
      { c: 'كشف وفحص', n: 'استشارة علاج', d: 'تحديد خطة العلاج والمتابعة', p: 100, m: 20 },
      { c: 'علاجات', n: 'حشو أسنان عادي', d: 'حشو بالمرسب (كومبوزيت)', p: 300, m: 30 },
      { c: 'علاجات', n: 'حشو عصب', d: 'علاج لب الأسنان (Root Canal)', p: 1500, m: 60 },
      { c: 'علاجات', n: 'خلع سن عادي', d: 'خلع سن بسيط', p: 400, m: 20 },
      { c: 'علاجات', n: 'خلع سن جراحي', d: 'خلع سن زجاجي أو ضرس عقل', p: 800, m: 45 },
      { c: 'علاجات', n: 'تاج أسنان (طربوش)', d: 'تركيب تاج خزفي أو معدني', p: 2500, m: 45 },
      { c: 'علاجات', n: 'جسر أسنان', d: 'تركيب جسر لتعويض أسنان مفقودة', p: 5000, m: 60 },
      { c: 'علاجات', n: 'زراعة سن', d: 'زراعة سن بتيتانيوم', p: 8000, m: 90 },
      { c: 'علاجات', n: 'تبييض أسنان', d: 'تبييض بالليزر أو جل', p: 1500, m: 60 },
      { c: 'علاجات', n: 'تقويم أسنان', d: 'تقويم معدني أو شفاف', p: 15000, m: 30 },
      { c: 'علاجات', n: 'علاج اللثة', d: 'تنظيف عميق وعلاج التهاب اللثة', p: 500, m: 45 },
    ],
    cardiology: [
      { c: 'كشف وفحص', n: 'استشارة قلب', d: 'فحص سريري شامل للقلب والأوعية الدموية', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'تخطيط قلب (ECG)', d: 'تسجيل كهربائي للقلب', p: 200, m: 15 },
      { c: 'كشف وفحص', n: 'تصوير صدى القلب (Echo)', d: 'تصوير بالصدى لحجرات القلب', p: 800, m: 45 },
      { c: 'كشف وفحص', n: 'اختبار الجهد (Stress Test)', d: 'اختبار الجهد على جهاز المشي', p: 1200, m: 60 },
      { c: 'كشف وفحص', n: 'متابعة هولتر 24 ساعة', d: 'تسجيل نشاط القلب لمدة 24 ساعة', p: 1500, m: 1440 },
      { c: 'إجراءات', n: 'قسطرة قلب Diagnostic', d: 'قسطرة تشخيصية', p: 15000, m: 120 },
      { c: 'إجراءات', n: 'زراعة دسار قلب (Pacemaker)', d: 'زراعة جهاز تنظيم ضربات القلب', p: 50000, m: 180 },
    ],
    dermatology: [
      { c: 'كشف وفحص', n: 'استشارة جلدية', d: 'تشخيص وعلاج مشاكل الجلد', p: 400, m: 20 },
      { c: 'كشف وفحص', n: 'خزعة جلدية (Biopsy)', d: 'أخذ عينة من الجلد للتحليل', p: 600, m: 30 },
      { c: 'إجراءات', n: 'تجميد بالنيتروجين', d: 'علاج الثآليل والتصقات الجلدية', p: 300, m: 15 },
      { c: 'إجراءات', n: 'علاج بالليزر', d: 'ليزر لإزالة الشعر أو الندبات', p: 1000, m: 45 },
      { c: 'إجراءات', n: 'تقشير كيميائي', d: 'تقشير للبشرة وتجديد الخلايا', p: 800, m: 30 },
      { c: 'إجراءات', n: 'حقن بوتوكس', d: 'بوتوكس للتجاعيد', p: 3000, m: 30 },
      { c: 'إجراءات', n: 'حقن فيلر', d: 'فيلر للوجه والشفاه', p: 4000, m: 45 },
    ],
    ent: [
      { c: 'كشف وفحص', n: 'استشارة أنف وأذن وحنجرة', d: 'فحص شامل للأنف والأذن والحنجرة', p: 400, m: 20 },
      { c: 'كشف وفحص', n: 'قياس السمع (Audiometry)', d: 'اختبار حاسة السمع', p: 300, m: 30 },
      { c: 'كشف وفحص', n: 'منظار أنفي', d: 'فحص الأنف والجيوب الأنفية بالمنظار', p: 400, m: 20 },
      { c: 'إجراءات', n: 'إزالة لوزتين', d: 'استئصال اللوزتين جراحيًا', p: 8000, m: 60 },
      { c: 'إجراءات', n: 'تركيب أنبوب الأذن', d: 'تركيب أنبوب لتصريف السائل من الأذن الوسطى', p: 3000, m: 30 },
      { c: 'إجراءات', n: 'علاج الشخير', d: 'علاج اضطرابات الشخير والتنفس أثناء النوم', p: 500, m: 30 },
    ],
    endocrinology: [
      { c: 'كشف وفحص', n: 'استشارة غدد صماء', d: 'تشخيص وعلاج اضطرابات الغدد الصماء', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'تصوير غدة الدرقية بالصدى', d: 'تصوير لغدة الدرقية', p: 500, m: 20 },
      { c: 'كشف وفحص', n: 'قياس كثافة العظام (DEXA)', d: 'قياس كثافة العظام للتشخيص', p: 800, m: 30 },
      { c: 'إجراءات', n: 'حقن الكورتيزون الموضعي', d: 'حقن موضعي للالتهابات', p: 400, m: 15 },
      { c: 'متابعة', n: 'متابعة مرض السكر', d: 'متابعة شاملة لمرضى السكر', p: 300, m: 20 },
      { c: 'متابعة', n: 'متابعة الغدة الدرقية', d: 'متابعة وتعديل جرعات الدرقة', p: 300, m: 20 },
    ],
    family_medicine: [
      { c: 'كشف وفحص', n: 'كشف أولي عام', d: 'فحص شامل للصحة العامة', p: 300, m: 30 },
      { c: 'كشف وفحص', n: 'متابعة مزمنات', d: 'متابعة السكر والضغط والكوليسترول', p: 200, m: 20 },
      { c: 'خدمات', n: 'تطعيمات عامة', d: 'تطعيمات الأنفلونزا والذئبة وغيرها', p: 200, m: 15 },
      { c: 'خدمات', n: 'دم وتحاليل', d: 'سحب عينات دم للتحاليل المخبرية', p: 100, m: 10 },
      { c: 'خدمات', n: 'صفحة طبية شاملة', d: 'إعداد ملف طبي شامل للمريض', p: 150, m: 30 },
    ],
    gastroenterology: [
      { c: 'كشف وفحص', n: 'استشارة جهاز هضمي', d: 'تشخيص وعلاج أمراض الجهاز الهضمي', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'تنظار مريئي (EGD)', d: 'تنظار للجزء العلوي من الجهاز الهضمي', p: 3000, m: 30 },
      { c: 'كشف وفحص', n: 'تنظار قولون', d: 'تنظار للقولون والمستقيم', p: 5000, m: 45 },
      { c: 'كشف وفحص', n: 'اختبار جرثومة المعدة', d: 'تحليل تنفس لجرثومة المعدة', p: 400, m: 15 },
      { c: 'إجراءات', n: 'إزالة полيب قولوني', d: 'إزالة أورام حميدة أثناء التنظار', p: 6000, m: 60 },
      { c: 'متابعة', n: 'متابعة أمراض الكبد', d: 'متابعة التهاب الكبد والتشحن الكبدي', p: 400, m: 20 },
    ],
    general_practice: [
      { c: 'كشف وفحص', n: 'كشف عام', d: 'فحص سريري شامل', p: 250, m: 20 },
      { c: 'كشف وفحص', n: 'متابعة مزمنات', d: 'متابعة السكر والضغط والكوليسترول', p: 200, m: 15 },
      { c: 'خدمات', n: 'تحاليل مخبرية', d: 'تحليل دم شامل ووظائف الكلى والكبد', p: 150, m: 10 },
      { c: 'خدمات', n: 'تطعيمات', d: 'تطعيمات الأنفلونزا والالتهاب الكبدي', p: 150, m: 10 },
      { c: 'إجراءات', n: 'حقن أو منظار', d: 'إجراءات بسيطة في العيادة', p: 300, m: 20 },
    ],
    internal_medicine: [
      { c: 'كشف وفحص', n: 'كشف عام', d: 'فحص سريري شامل', p: 250, m: 20 },
      { c: 'كشف وفحص', n: 'متابعة مزمنات', d: 'متابعة السكر والضغط والكوليسترول', p: 200, m: 15 },
      { c: 'خدمات', n: 'تحاليل مخبرية', d: 'تحليل دم شامل ووظائف الكلى والكبد', p: 150, m: 10 },
      { c: 'خدمات', n: 'تطعيمات', d: 'تطعيمات الأنفلونزا', p: 150, m: 10 },
      { c: 'إجراءات', n: 'حقن أو منظار', d: 'إجراءات بسيطة في العيادة', p: 300, m: 20 },
    ],
    general_surgery: [
      { c: 'كشف وفحص', n: 'استشارة جراحة عامة', d: 'تقييم جراحي وتحديد خطة العلاج', p: 500, m: 30 },
      { c: 'إجراءات', n: 'استئصال كيس دهني', d: 'استئصال كيس دهني صغير', p: 2000, m: 30 },
      { c: 'إجراءات', n: 'خياطة جرح', d: 'خياطة وعلاج الجروح', p: 500, m: 20 },
      { c: 'إجراءات', n: 'استئصال الزائدة الدودية', d: 'جراحة استئصال الزائدة', p: 25000, m: 120 },
      { c: 'إجراءات', n: 'علاج الفتق (Hernia)', d: 'جراحة الفتق الإربي أو السري', p: 20000, m: 90 },
    ],
    hematology: [
      { c: 'كشف وفحص', n: 'استشارة أمراض الدم', d: 'تشخيص وعلاج اضطرابات الدم', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'دمعة دم محيطية', d: 'تحليل ميكروسكوبي لخلايا الدم', p: 300, m: 15 },
      { c: 'إجراءات', n: 'خزعة نخاع العظم', d: 'أخذ عينة من نخاع العظم', p: 3000, m: 45 },
      { c: 'متابعة', n: 'متابعة فقر الدم', d: 'متابعة وعلاج فقر الدم', p: 300, m: 20 },
    ],
    nephrology: [
      { c: 'كشف وفحص', n: 'استشارة كلى', d: 'تشخيص وعلاج أمراض الكلى', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'تصوير كلى بالصدى', d: 'تصوير بالصدى للكلى والمثانة', p: 400, m: 20 },
      { c: 'إجراءات', n: 'غسيل كلوي جلدي', d: 'جلسة غسيل كلوي واحدة', p: 2000, m: 240 },
      { c: 'متابعة', n: 'متابعة مرضى الكلى', d: 'متابعة وظائف الكلى', p: 400, m: 20 },
    ],
    neurology: [
      { c: 'كشف وفحص', n: 'استشارة أعصاب', d: 'تشخيص وعلاج أمراض الجهاز العصبي', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'تخطيط دماغ (EEG)', d: 'تسجيل نشاط الدماغ الكهربائي', p: 1000, m: 45 },
      { c: 'كشف وفحص', n: 'دراسة التوصيل العصبي (EMG)', d: 'اختبار التوصيل الكهربائي للعصب', p: 1500, m: 60 },
      { c: 'إجراءات', n: 'حقن بوتوكس للصداع', d: 'بوتوكس علاجي للصداع المزمن', p: 3000, m: 30 },
    ],
    neurosurgery: [
      { c: 'كشف وفحص', n: 'استشارة جراحة أعصاب', d: 'تقييم جراحي لأمراض الجهاز العصبي', p: 700, m: 30 },
      { c: 'كشف وفحص', n: 'مراجعة أشعة', d: 'مراجعة أشعة المقطعية والرنين المغناطيسي', p: 500, m: 20 },
      { c: 'إجراءات', n: 'استئصال ورم دماغي', d: 'جراحة إزالة أورام الدماغ', p: 80000, m: 240 },
      { c: 'إجراءات', n: 'علاج الانزلاق الغضروفي', d: 'جراحة العمود الفقري', p: 40000, m: 180 },
      { c: 'متابعة', n: 'متابعة ما بعد الجراحة', d: 'متابعة بعد جراحة الأعصاب', p: 500, m: 20 },
    ],
    obstetrics_gynecology: [
      { c: 'كشف وفحص', n: 'استشارة نساء', d: 'فحص نسائي شامل', p: 400, m: 20 },
      { c: 'كشف وفحص', n: 'متابعة الحمل', d: 'متابعة دورية أثناء الحمل', p: 300, m: 20 },
      { c: 'كشف وفحص', n: 'سونار الحمل', d: 'تصوير بالصدى لمتابعة الجنين', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'مسحة بابلاك', d: 'فحص يقظي لسرطان عنق الرحم', p: 300, m: 15 },
      { c: 'إجراءات', n: 'ولادة طبيعية', d: 'إدارة الولادة الطبيعية', p: 15000, m: 480 },
      { c: 'إجراءات', n: 'ولادة قيصرية', d: 'جراحة الولادة القيصرية', p: 25000, m: 120 },
      { c: 'إجراءات', n: 'تنظير رحمي', d: 'تنظير تشخيصي للرحم', p: 3000, m: 30 },
    ],
    oncology: [
      { c: 'كشف وفحص', n: 'استشارة أورام', d: 'تقييم وتشخيص الأورام', p: 800, m: 30 },
      { c: 'كشف وفحص', n: 'Tumor Markers', d: 'تحليل علامات الأورام في الدم', p: 500, m: 15 },
      { c: 'إجراءات', n: 'جلسة كيماوي', d: 'جلسة علاج كيميائي', p: 5000, m: 180 },
      { c: 'إجراءات', n: 'خزعة ورم', d: 'أخذ عينة من الورم للتحليل', p: 2000, m: 30 },
      { c: 'متابعة', n: 'متابعة ما بعد العلاج', d: 'متابعة دورية بعد انتهاء العلاج', p: 500, m: 20 },
    ],
    ophthalmology: [
      { c: 'كشف وفحص', n: 'فحص عيون شامل', d: 'فحص شامل لصحة العيون والبصريات', p: 400, m: 30 },
      { c: 'كشف وفحص', n: 'قياس النظر', d: 'قياس درجة النظارة والعدسة', p: 150, m: 15 },
      { c: 'كشف وفحص', n: 'قياس ضغط العين', d: 'قياس الضغط الداخلي للعين', p: 200, m: 10 },
      { c: 'كشف وفحص', n: 'فحص قاع العين', d: 'فحص شبكية العين بالمصباح الشق', p: 300, m: 20 },
      { c: 'إجراءات', n: 'علاج الساد', d: 'استئصال الساد وتركيب العدسة', p: 15000, m: 30 },
      { c: 'إجراءات', n: 'استشارة ليزك', d: 'تقييم الليزك لتصحيح النظر', p: 500, m: 30 },
      { c: 'إجراءات', n: 'حقن بالعين', d: 'حقن مضاد VEGF', p: 5000, m: 15 },
    ],
    orthopedics: [
      { c: 'كشف وفحص', n: 'استشارة عظام', d: 'تشخيص وعلاج أمراض العظام والمفاصل', p: 500, m: 20 },
      { c: 'كشف وفحص', n: 'مراجعة أشعة عظام', d: 'تقييم الأشعة السينية', p: 200, m: 15 },
      { c: 'إجراءات', n: 'حقن مفصل', d: 'حقن كورتيزون أو هايلورونيك في المفصل', p: 800, m: 20 },
      { c: 'إجراءات', n: 'تركيب جبيرة', d: 'علاج الكسور بالجبيرة', p: 500, m: 30 },
      { c: 'إجراءات', n: 'جراحة استبدال مفصل', d: 'استبدال مفصل الركبة أو الورك', p: 60000, m: 180 },
      { c: 'متابعة', n: 'متابعة كسور', d: 'متابعة التئام الكسور', p: 300, m: 15 },
    ],
    pediatrics: [
      { c: 'كشف وفحص', n: 'كشف أطفال عام', d: 'فحص شامل لصحة الطفل', p: 300, m: 20 },
      { c: 'كشف وفحص', n: 'متابعة النمو', d: 'تقييم النمو الجسدي والعقلي', p: 250, m: 20 },
      { c: 'خدمات', n: 'تطعيمات أطفال', d: 'الجدول الزمني للتطعيمات', p: 200, m: 15 },
      { c: 'خدمات', n: 'تحاليل أطفال', d: 'تحاليل دم بسيطة للأطفال', p: 150, m: 10 },
      { c: 'إجراءات', n: 'علاج حمى الأطفال', d: 'إدارة حمى الأطفال', p: 200, m: 15 },
    ],
    physical_therapy: [
      { c: 'كشف وفحص', n: 'تقييم أولي', d: 'تقييم شامل لحالة المريض', p: 400, m: 45 },
      { c: 'جلسات', n: 'جلسة علاج طبيعي', d: 'جلسة علاج بالأجهزة والتمارين', p: 300, m: 45 },
      { c: 'جلسات', n: 'علاج بالموجات فوق الصوتية', d: 'Ultrasonic therapy', p: 200, m: 30 },
      { c: 'جلسات', n: 'علاج بالتيار الكهربائي', d: 'Electrical stimulation', p: 200, m: 30 },
      { c: 'جلسات', n: 'علاج بالليزر الشعاعي', d: 'Low-level laser therapy', p: 300, m: 20 },
      { c: 'جلسات', n: 'علاج يدوي', d: 'Manual therapy', p: 350, m: 30 },
      { c: 'متابعة', n: 'متابعة التقدم', d: 'تقييم دوري للتحسن', p: 200, m: 20 },
    ],
    psychiatry: [
      { c: 'كشف وفحص', n: 'استشارة نفسية', d: 'تقييم نفسي وتشخيصي', p: 600, m: 45 },
      { c: 'متابعة', n: 'متابعة نفسية', d: 'متابعة وتعديل الأدوية', p: 400, m: 20 },
      { c: 'إجراءات', n: 'تقييم ما قبل الجراحة', d: 'تقييم نفسي قبل إجراء جراحي', p: 500, m: 30 },
    ],
    psychology: [
      { c: 'جلسات', n: 'جلسة علاج نفسي', d: 'علاج سلوكي معرفي (CBT)', p: 500, m: 50 },
      { c: 'جلسات', n: 'تقييم نفسي', d: 'تقييم شامل للحالة النفسية', p: 800, m: 60 },
      { c: 'جلسات', n: 'تقييم ذكاء', d: 'اختبار IQ', p: 1000, m: 90 },
      { c: 'جلسات', n: 'استشارة أسرية', d: 'استشارة زوجية أو أسرية', p: 600, m: 60 },
    ],
    pulmonology: [
      { c: 'كشف وفحص', n: 'استشارة صدرية', d: 'تشخيص وعلاج أمراض الرئة والتنفس', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'اختبار وظائف الرئة', d: 'قياس سعة الرئة وتدفق الهواء', p: 500, m: 30 },
      { c: 'كشف وفحص', n: 'تنظار قصبات', d: 'تنظار للقصبات الهوائية', p: 5000, m: 45 },
      { c: 'إجراءات', n: 'سحب سائل من الصدر', d: 'استخراج السائل من تجويف الصدر', p: 2000, m: 30 },
      { c: 'متابعة', n: 'متابعة الربو', d: 'متابعة وتعديل خطة علاج الربو', p: 300, m: 20 },
      { c: 'متابعة', n: 'متابعة COPD', d: 'متابعة انسداد الرئة المزمن', p: 300, m: 20 },
    ],
    urology: [
      { c: 'كشف وفحص', n: 'استشارة مسالك بولية', d: 'تشخيص وعلاج أمراض المسالك البولية', p: 500, m: 20 },
      { c: 'كشف وفحص', n: 'تصوير مثانة بالصدى', d: 'تصوير بالصدى للمسالك البولية', p: 400, m: 20 },
      { c: 'كشف وفحص', n: 'تنظار مثانة', d: 'تنظار تشخيصي للمثانة', p: 3000, m: 30 },
      { c: 'إجراءات', n: 'علاج حصوات الكلى', d: 'تفتيت أو استخراج حصوات الكلى', p: 10000, m: 60 },
      { c: 'إجراءات', n: 'استئصال البروستاتا', d: 'جراحة استئصال البروستاتا', p: 30000, m: 120 },
      { c: 'متابعة', n: 'متابعة البروستاتا', d: 'متابعة تضخم البروستاتا الحميد', p: 400, m: 20 },
    ],
    clinical_nutrition: [
      { c: 'كشف وفحص', n: 'استشارة تغذية', d: 'تقييم الحالة التغذوية ووضع خطة', p: 400, m: 30 },
      { c: 'كشف وفحص', n: 'تحليل تركيب الجسم', d: 'قياس الدهون والعضلات والماء', p: 200, m: 15 },
      { c: 'جلسات', n: 'متابعة تغذية', d: 'متابعة دورية وخطة غذائية', p: 300, m: 20 },
      { c: 'جلسات', n: 'خطة تغذية علاجية', d: 'خطة غذائية مخصصة للمرضى', p: 500, m: 45 },
    ],
    medical_center: [
      { c: 'كشف وفحص', n: 'كشف عام', d: 'فحص سريري شامل', p: 250, m: 20 },
      { c: 'خدمات', n: 'تحاليل مخبرية', d: 'تحليل دم شامل', p: 150, m: 10 },
      { c: 'خدمات', n: 'أشعة', d: 'أشعة سينية أو مقطعية', p: 300, m: 20 },
      { c: 'خدمات', n: 'تطعيمات', d: 'تطعيمات عامة', p: 150, m: 10 },
    ],
  }
  return T[code] || []
}

export async function registerOwnerAsDoctor(clinicId: string, locale: string, specialty?: string) {
  const supabase = await verifyOwner(clinicId)

  // Get owner's staff_member record
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) throw new Error('Staff record not found')

  // Check if doctor profile already exists
  const { data: existing } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .single()

  if (existing) {
    throw new Error(locale === 'ar' ? 'أنت مسجل كطبيب بالفعل.' : 'You are already registered as a doctor.')
  }

  const { error } = await supabase
    .from('doctor_profiles')
    .insert({
      staff_member_id: staffMember.id,
      clinic_id: clinicId,
      specialty: specialty || null,
      bio: null
    })

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function addStaffMemberDirectly(
  clinicId: string,
  locale: string,
  fullName: string,
  role: string,
  phone?: string
) {
  const supabase = await verifyOwner(clinicId)

  const { data: newStaff, error: staffErr } = await supabase
    .from('staff_members')
    .insert({
      full_name: fullName,
      phone: phone || null,
      staff_type: 'payroll_only'
    })
    .select('id')
    .single()

  if (staffErr) throw staffErr

  const { error: memErr } = await supabase
    .from('clinic_staff_memberships')
    .insert({
      staff_member_id: newStaff.id,
      clinic_id: clinicId,
      role: role,
      is_active: true
    })

  if (memErr) throw memErr

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function updateStaffEmail(newEmail: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id, email_changed_at')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) throw new Error('Staff record not found')

  if (staffMember.email_changed_at) {
    throw new Error('Email has already been changed once and is locked.')
  }

  // First, update Auth Email
  const { error: authError } = await supabase.auth.updateUser({ email: newEmail })
  if (authError) throw new Error(authError.message)

  // Then, update staff_members and lock it
  const { error: staffError } = await supabase
    .from('staff_members')
    .update({ 
      email_changed_at: new Date().toISOString()
    })
    .eq('id', staffMember.id)

  if (staffError) throw new Error(staffError.message)
    
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function savePaperFormat(clinicId: string, format: string) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('clinic_settings')
    .upsert({
      clinic_id: clinicId,
      setting_key: 'paper_format',
      setting_value: format
    }, { onConflict: 'clinic_id, setting_key' })

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}

export async function saveClinicLogo(clinicId: string, logoDataUrl: string) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('clinic_settings')
    .upsert({
      clinic_id: clinicId,
      setting_key: 'clinic_logo',
      setting_value: logoDataUrl
    }, { onConflict: 'clinic_id, setting_key' })

  if (error) throw error
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/settings', 'page')
}
