import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumCard } from '@/components/layout/PageComponents'
import { Settings } from 'lucide-react'
import dynamic from 'next/dynamic'
import StaffSettingsTab from './StaffSettingsTab'
import ServicesTab from './ServicesTab'
import EditClinicDialog from './EditClinicDialog'
import UpdateEmailDialog from './UpdateEmailDialog'
import ChangeClinicTypeDialog from './ChangeClinicTypeDialog'
import RegisterAsDoctorButton from './RegisterAsDoctorButton'
import PaperFormatSettings from './PaperFormatSettings'
import { requireClinicId } from "@/lib/utils/clinic";

const LogoUpload = dynamic(() => import('./LogoUpload'), {
  ssr: false,
  loading: () => <div className="w-20 h-20 animate-pulse bg-white/5 rounded-xl" />
})

export default async function SettingsPage({
      params: { clinicSlug, locale }
    }: {
              params: { clinicSlug: string; locale: string }
            }) {
    const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentUserData = null;
  if (user) {
    const { data } = await supabase.from('staff_members').select('email_changed_at').eq('auth_user_id', user.id).single()
    currentUserData = {
      email: user.email || null,
      email_changed_at: data?.email_changed_at || null
    }
  }

  // Fetch real clinic data from DB
  const { data: clinic, error: _error } = await supabase
    .from('clinics')
    .select(`
      id, name, owner_full_name, owner_phone, status,
      clinic_type_id,
      clinic_types ( code, name_ar, name_en )
    `)
    .eq('id', clinicId)
    .single()

  // Fetch subscription info
  const { data: subscription } = await supabase
    .from('clinic_subscriptions')
    .select(`
      status, current_period_start, current_period_end, price_locked_egp,
      plans ( name_en, name_ar, billing_cycle )
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch staff memberships (with payroll config)
  const { data: staffMemberships } = await supabase
    .from('clinic_staff_memberships')
    .select(`
      id, role, is_active,
      staff_members ( id, full_name, auth_user_id ),
      staff_payroll_config ( salary_type, base_salary_egp, commission_percentage )
    `)
    .eq('clinic_id', clinicId)

  // Fetch staff invites
  const { data: staffInvites } = await supabase
    .from('staff_invites')
    .select('id, invited_role, status, expires_at, created_at')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  // Fetch service categories with services
  const { data: serviceCategories } = await supabase
    .from('service_categories')
    .select(`
      id, name,
      clinic_services ( id, name, price, duration_minutes )
    `)
    .eq('clinic_id', clinicId)

  const typedStaff = (staffMemberships || []) as any[]
  const typedInvites = (staffInvites || []) as any[]
  const typedCategories = (serviceCategories || []) as any[]

  // Fetch clinic logo
  const { data: logoSetting } = await supabase
    .from('clinic_settings')
    .select('setting_value')
    .eq('clinic_id', clinicId)
    .eq('setting_key', 'clinic_logo')
    .single()

  // Check if owner already has a doctor profile
  let ownerIsDoctor = false
  if (user) {
    const { data: ownerStaff } = await supabase
      .from('staff_members')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    if (ownerStaff) {
      const { data: docProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('staff_member_id', ownerStaff.id)
        .eq('clinic_id', clinicId)
        .single()
      ownerIsDoctor = !!docProfile
    }
  }

  const isAr = locale === 'ar'

  const t = {
    title: isAr ? 'إعدادات العيادة' : 'Clinic Settings',
    desc: isAr ? 'إدارة معلومات العيادة، الموظفين، الخدمات والفواتير.' : "Manage your clinic's information, staff, services, and billing.",
    general: isAr ? 'المعلومات العامة' : 'General',
    staff: isAr ? 'الموظفين' : 'Staff',
    services: isAr ? 'الخدمات' : 'Services',
    billing: isAr ? 'الفواتير' : 'Billing',
    generalInfo: isAr ? 'المعلومات الأساسية' : 'General Information',
    generalDesc: isAr ? 'التفاصيل الأساسية للعيادة وبيانات التواصل' : "Your clinic's basic details and contact info",
    clinicName: isAr ? 'اسم العيادة' : 'Clinic Name',
    clinicType: isAr ? 'نوع العيادة' : 'Clinic Type',
    ownerName: isAr ? 'اسم المالك' : 'Owner Name',
    ownerPhone: isAr ? 'رقم الهاتف' : 'Owner Phone',
    status: isAr ? 'الحالة' : 'Status',
    staffMembers: isAr ? 'أعضاء الفريق' : 'Staff Members',
    staffCount: (n: number) => isAr ? `${n} عضو في عيادتك` : `${n} member(s) in your clinic`,
    servicesPricing: isAr ? 'الخدمات والأسعار' : 'Services & Pricing',
    servicesDesc: isAr ? 'إدارة الخدمات المقدمة في عيادتك' : 'Manage the services offered at your clinic',
    subscriptionBilling: isAr ? 'الاشتراك والفوترة' : 'Subscription & Billing',
    subscriptionDesc: isAr ? 'خطتك الحالية وتفاصيل الفوترة' : 'Your current plan and billing details',
    plan: isAr ? 'الخطة' : 'Plan',
    planStatus: isAr ? 'الحالة' : 'Status',
    billingCycle: isAr ? 'دورة الفوترة' : 'Billing Cycle',
    price: isAr ? 'السعر' : 'Price',
    periodStart: isAr ? 'بداية الفترة' : 'Period Start',
    periodEnd: isAr ? 'نهاية الفترة' : 'Period End',
    noSubscription: isAr ? 'لا يوجد اشتراك نشط. تواصل مع مدير المنصة.' : 'No active subscription found. Contact your platform admin.',
    registerAsDoctor: isAr ? 'تسجيل كطبيب' : 'Register as Doctor',
    alreadyDoctor: isAr ? 'أنت مسجل كطبيب ✓' : 'Registered as Doctor ✓',
    registerDoctorDesc: isAr ? 'سجّل نفسك كطبيب لتظهر في قائمة الأطباء ويمكن تعيين مواعيد لك.' : 'Register yourself as a doctor to appear in the doctors list and receive appointments.',
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title={t.title}
        description={t.desc}
        icon={Settings}
        iconColor="text-slate-400"
        iconBg="rgba(148,163,184,0.12)"
      />

      {/* Mobile horizontal tabs */}
      <div className="flex lg:hidden overflow-x-auto gap-1 pb-2 -mx-1 px-1 scrollbar-hide">
        {[
          { id: 'general', label: t.general, dot: 'bg-teal-400' },
          { id: 'staff', label: t.staff, dot: 'bg-violet-400' },
          { id: 'services', label: t.services, dot: 'bg-blue-400' },
          { id: 'billing', label: t.billing, dot: 'bg-green-400' },
          { id: 'paper', label: isAr ? 'شكل الورقة' : 'Paper', dot: 'bg-indigo-400' },
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all whitespace-nowrap shrink-0"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
            {item.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop sidebar nav */}
        <div
          className="hidden lg:block lg:col-span-1 rounded-2xl p-3 h-fit sticky top-24"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            { id: 'general', label: t.general, dot: 'bg-teal-400' },
            { id: 'staff', label: t.staff, dot: 'bg-violet-400' },
            { id: 'services', label: t.services, dot: 'bg-blue-400' },
            { id: 'billing', label: t.billing, dot: 'bg-green-400' },
            { id: 'paper', label: isAr ? 'شكل الورقة' : 'Paper Format', dot: 'bg-indigo-400' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all duration-200 mb-0.5"
            >
              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
              {item.label}
            </a>
          ))}
        </div>

        {/* Content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Section */}
          <div id="general" className="scroll-mt-24">
            <PremiumCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h2 className="text-base font-semibold text-slate-200">{t.generalInfo}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{t.generalDesc}</p>
                </div>
                <EditClinicDialog 
                  clinicId={clinicId} 
                  locale={locale} 
                  initialData={{
                    name: clinic?.name || '',
                    owner_full_name: clinic?.owner_full_name || '',
                    owner_phone: clinic?.owner_phone || ''
                  }} 
                />
              </div>

              {/* Profile Email Settings */}
              {currentUserData && (
                <div className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <UpdateEmailDialog 
                    currentEmail={currentUserData.email} 
                    emailChangedAt={currentUserData.email_changed_at} 
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: t.clinicName, value: clinic?.name || '—' },
                  { label: t.ownerName, value: clinic?.owner_full_name || '—' },
                  { label: t.ownerPhone, value: clinic?.owner_phone || '—' },
                  { label: t.status, value: clinic?.status || '—' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {field.label}
                    </label>
                    <div
                      className="mt-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 font-medium capitalize"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      {field.value}
                    </div>
                  </div>
                ))}

                {/* Clinic Type with Change button */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {t.clinicType}
                  </label>
                  <div
                    className="mt-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 font-medium capitalize flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span>{isAr ? (clinic?.clinic_types as any)?.name_ar : (clinic?.clinic_types as any)?.name_en || '—'}</span>
                    <ChangeClinicTypeDialog
                      clinicId={clinicId}
                      locale={locale}
                      currentTypeId={clinic?.clinic_type_id || ''}
                      currentTypeName={isAr ? (clinic?.clinic_types as any)?.name_ar : (clinic?.clinic_types as any)?.name_en || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Owner as Doctor */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300">{t.registerAsDoctor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.registerDoctorDesc}</p>
                  </div>
                  <RegisterAsDoctorButton
                    clinicId={clinicId}
                    locale={locale}
                    isAlreadyDoctor={ownerIsDoctor}
                  />
                </div>
              </div>

              {/* Clinic Logo */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-300">{isAr ? 'شعار العيادة' : 'Clinic Logo'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'يظهر في الروشتات والفواتير المطبوعة' : 'Appears on printed prescriptions and receipts'}</p>
                </div>
                <LogoUpload
                  clinicId={clinicId}
                  locale={locale}
                  currentLogoUrl={logoSetting?.setting_value}
                />
              </div>
            </PremiumCard>
          </div>

          {/* Staff Section */}
          <div id="staff">
            <PremiumCard>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold text-slate-200">{t.staffMembers}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.staffCount(typedStaff.length)}</p>
              </div>
              <StaffSettingsTab
                clinicId={clinicId}
                staffMemberships={typedStaff}
                staffInvites={typedInvites}
                locale={locale}
              />
            </PremiumCard>
          </div>

          {/* Services Section */}
          <div id="services">
            <PremiumCard>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold text-slate-200">{t.servicesPricing}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.servicesDesc}</p>
              </div>
              <ServicesTab clinicId={clinicId} initialData={typedCategories} locale={locale} />
            </PremiumCard>
          </div>

          {/* Billing Section */}
          <div id="billing">
            <PremiumCard>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold text-slate-200">{t.subscriptionBilling}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.subscriptionDesc}</p>
              </div>
              {subscription ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: t.plan, value: isAr ? (subscription as any)?.plans?.name_ar : (subscription as any)?.plans?.name_en || '—' },
                    { label: t.planStatus, value: subscription?.status || '—' },
                    { label: t.billingCycle, value: (subscription as any)?.plans?.billing_cycle || '—' },
                    { label: t.price, value: subscription?.price_locked_egp ? `${subscription.price_locked_egp} EGP` : '—' },
                    { label: t.periodStart, value: subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : '—' },
                    { label: t.periodEnd, value: subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {field.label}
                      </label>
                      <div
                        className="mt-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 font-medium capitalize"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">{t.noSubscription}</p>
              )}
            </PremiumCard>
          </div>

          {/* Paper Format Section */}
          <div id="paper">
            <PremiumCard>
              <PaperFormatSettings clinicId={clinicId} locale={locale} />
            </PremiumCard>
          </div>
        </div>
      </div>
    </div>
  )
}
