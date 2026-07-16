import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumCard } from '@/components/layout/PageComponents'
import { Settings } from 'lucide-react'
import StaffSettingsTab from './StaffSettingsTab'
import ServicesTab from './ServicesTab'
import EditClinicDialog from './EditClinicDialog'

export default async function SettingsPage({
  params: { clinicId, locale }
}: {
  params: { clinicId: string; locale: string }
}) {
  const supabase = createClient()

  // Fetch real clinic data from DB
  const { data: clinic, error } = await supabase
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
    .from('clinic_invites')
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar nav */}
        <div
          className="lg:col-span-1 rounded-2xl p-3 h-fit sticky top-24"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: t.clinicName, value: clinic?.name || '—' },
                  { label: t.clinicType, value: isAr ? clinic?.clinic_types?.name_ar : clinic?.clinic_types?.name_en || '—' },
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
              </div>
            </PremiumCard>
          </div>

          {/* Staff Section */}
          <div id="staff">
            <PremiumCard>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold text-slate-200">Staff Members</h2>
                <p className="text-sm text-slate-500 mt-0.5">{typedStaff.length} member(s) in your clinic</p>
              </div>
              <StaffSettingsTab
                clinicId={clinicId}
                staffMemberships={typedStaff}
                staffInvites={typedInvites}
              />
            </PremiumCard>
          </div>

          {/* Services Section */}
          <div id="services">
            <PremiumCard>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold text-slate-200">Services & Pricing</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage the services offered at your clinic</p>
              </div>
              <ServicesTab clinicId={clinicId} initialData={typedCategories} />
            </PremiumCard>
          </div>

          {/* Billing Section */}
          <div id="billing">
            <PremiumCard>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold text-slate-200">Subscription & Billing</h2>
                <p className="text-sm text-slate-500 mt-0.5">Your current plan and billing details</p>
              </div>
              {subscription ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Plan', value: (subscription as any)?.plans?.name_en || '—' },
                    { label: 'Status', value: subscription?.status || '—' },
                    { label: 'Billing Cycle', value: (subscription as any)?.plans?.billing_cycle || '—' },
                    { label: 'Price', value: subscription?.price_locked_egp ? `${subscription.price_locked_egp} EGP` : '—' },
                    { label: 'Period Start', value: subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : '—' },
                    { label: 'Period End', value: subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—' },
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
                <p className="text-sm text-slate-600">No active subscription found. Contact your platform admin.</p>
              )}
            </PremiumCard>
          </div>
        </div>
      </div>
    </div>
  )
}
