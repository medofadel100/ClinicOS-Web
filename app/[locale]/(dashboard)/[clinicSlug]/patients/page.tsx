import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddPatientDialog from './AddPatientDialog'
import { PageHeader, PremiumTableWrapper, EmptyState } from '@/components/layout/PageComponents'
import { Users, Search } from 'lucide-react'
import { requireClinicId } from "@/lib/utils/clinic";

type SearchParams = {
  q?: string
  from_date?: string
  to_date?: string
  category_id?: string
  service_id?: string
  debt?: string
}

export default async function PatientsPage({
  params: { locale, clinicSlug },
  searchParams
}: {
  params: { locale: string; clinicSlug: string },
  searchParams: SearchParams
}) {
  const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const query = searchParams.q || ''
  const fromDate = searchParams.from_date || ''
  const toDate = searchParams.to_date || ''
  const categoryId = searchParams.category_id || ''
  const serviceId = searchParams.service_id || ''
  const debtFilter = searchParams.debt || ''

  const isAr = locale === 'ar'

  const t = {
    title: isAr ? 'المرضى' : 'Patients',
    description: isAr ? 'إدارة سجلات المرضى في عيادتك.' : "Manage your clinic's patient records and history.",
    search: isAr ? 'بحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...',
    addPatient: isAr ? 'إضافة مريض' : 'Add Patient',
    name: isAr ? 'الاسم' : 'Name',
    phone: isAr ? 'الهاتف' : 'Phone',
    dob: isAr ? 'تاريخ الميلاد' : 'Date of Birth',
    registered: isAr ? 'تاريخ التسجيل' : 'Registered',
    actions: isAr ? 'الإجراءات' : 'Actions',
    viewFile: isAr ? 'عرض الملف' : 'View File',
    noPatients: isAr ? 'لا يوجد مرضى' : 'No patients found',
    noResults: isAr ? 'لا توجد نتائج لـ' : 'No results for',
    addFirst: isAr ? 'أضف أول مريض للبدء' : 'Add your first patient to get started',
    records: isAr ? 'سجلات' : 'records',
    searchBtn: isAr ? 'بحث' : 'Search',
    from: isAr ? 'من تاريخ' : 'From',
    to: isAr ? 'إلى تاريخ' : 'To',
    examType: isAr ? 'نوع الفحص' : 'Exam Type',
    allTypes: isAr ? 'كل الأنواع' : 'All types',
    service: isAr ? 'الخدمة / الإجراء' : 'Service / Procedure',
    allServices: isAr ? 'كل الخدمات' : 'All services',
    debt: isAr ? 'المديونية' : 'Debt',
    allDebt: isAr ? 'الكل' : 'All',
    hasDebt: isAr ? 'عليه ديون' : 'Has debt',
    noDebt: isAr ? 'بدون ديون' : 'No debt',
    paid: isAr ? 'مدفوع' : 'Paid',
    debtBtn: isAr ? 'تصفية' : 'Filter',
    reset: isAr ? 'إعادة تعيين' : 'Reset',
  }

  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name')
    .eq('clinic_id', clinicId)
    .order('order_index')

  const { data: services } = await supabase
    .from('clinic_services')
    .select('id, name, category_id')
    .eq('clinic_id', clinicId)
    .order('name')

  const categoryList = categories || []
  const serviceList = (services || []).filter((s) => !categoryId || s.category_id === categoryId)

  let dbQuery = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('registered_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
  }
  if (fromDate) {
    dbQuery = dbQuery.gte('registered_at', new Date(`${fromDate}T00:00:00`).toISOString())
  }
  if (toDate) {
    dbQuery = dbQuery.lte('registered_at', new Date(`${toDate}T23:59:59`).toISOString())
  }

  const { data: patientsData } = await dbQuery

  // Resolve service/category/exam filters through appointments
  let appointmentPatientIds: string[] | null = null
  if (categoryId || serviceId) {
    let svcIds: string[] = []
    if (categoryId) {
      const { data: categoryServices } = await supabase
        .from('clinic_services')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('category_id', categoryId)
      svcIds = (categoryServices || []).map((s) => s.id)
    } else {
      svcIds = [serviceId]
    }
    if (svcIds.length > 0) {
      const { data: apptPatients } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('clinic_id', clinicId)
        .in('service_id', svcIds)
      appointmentPatientIds = Array.from(new Set((apptPatients || []).map((a) => a.patient_id)))
    } else {
      appointmentPatientIds = []
    }
  }

  let patients = (patientsData || [])
  if (appointmentPatientIds !== null) {
    patients = patients.filter((p) => appointmentPatientIds!.includes(p.id))
  }

  // Debt computation
  const patientIds = patients.map((p) => p.id)
  const debtById = new Map<string, number>()
  let totalPlansById = new Map<string, number>()
  let totalPaymentsById = new Map<string, number>()

  if (patientIds.length > 0) {
    const { data: plans } = await supabase
      .from('treatment_plans')
      .select('patient_id, total_price_egp')
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .in('patient_id', patientIds)

    const { data: payments } = await supabase
      .from('patient_payments')
      .select('patient_id, amount_egp')
      .eq('clinic_id', clinicId)
      .in('patient_id', patientIds)

    totalPlansById = new Map()
    for (const plan of plans || []) {
      totalPlansById.set(plan.patient_id, (totalPlansById.get(plan.patient_id) || 0) + Number(plan.total_price_egp || 0))
    }
    totalPaymentsById = new Map()
    for (const payment of payments || []) {
      totalPaymentsById.set(payment.patient_id, (totalPaymentsById.get(payment.patient_id) || 0) + Number(payment.amount_egp || 0))
    }
    for (const id of patientIds) {
      const debt = (totalPlansById.get(id) || 0) - (totalPaymentsById.get(id) || 0)
      debtById.set(id, debt)
    }
  }

  if (debtFilter === 'has_debt') {
    patients = patients.filter((p) => (debtById.get(p.id) || 0) > 0)
  } else if (debtFilter === 'no_debt') {
    patients = patients.filter((p) => (debtById.get(p.id) || 0) <= 0)
  }

  const { data: activeCampaignsData } = await supabase
    .from('marketing_campaigns')
    .select('id, name')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)

  const _activeCampaigns = activeCampaignsData || []

  const hasActiveFilters = !!(fromDate || toDate || categoryId || serviceId || debtFilter)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t.title}
        description={t.description}
        icon={Users}
        iconColor="text-violet-400"
        iconBg="rgba(124,58,237,0.12)"
        badge={`${patients.length} ${t.records}`}
        actions={
          <AddPatientDialog clinicId={clinicId} clinicSlug={clinicSlug} locale={locale} />
        }
      />

      {/* Filters */}
      <form
        className="flex flex-wrap items-center gap-3"
        action={`/${locale}/${clinicSlug}/patients`}
        method="GET"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            name="q"
            type="search"
            placeholder={t.search}
            defaultValue={query}
            className="w-full h-10 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 rounded-xl outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
          {t.from}
          <input
            name="from_date"
            type="date"
            defaultValue={fromDate}
            className="h-10 px-3 text-sm text-slate-200 bg-transparent rounded-xl outline-none transition-all duration-200 [color-scheme:dark]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
          {t.to}
          <input
            name="to_date"
            type="date"
            defaultValue={toDate}
            className="h-10 px-3 text-sm text-slate-200 bg-transparent rounded-xl outline-none transition-all duration-200 [color-scheme:dark]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </label>

        <select
          name="category_id"
          defaultValue={categoryId}
          className="h-10 px-3 text-sm text-slate-200 rounded-xl outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <option value="" className="text-slate-900">{t.examType}: {t.allTypes}</option>
          {categoryList.map((c) => (
            <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>
          ))}
        </select>

        <select
          name="service_id"
          defaultValue={serviceId}
          className="h-10 px-3 text-sm text-slate-200 rounded-xl outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <option value="" className="text-slate-900">{t.service}: {t.allServices}</option>
          {serviceList.map((s) => (
            <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
          ))}
        </select>

        <select
          name="debt"
          defaultValue={debtFilter}
          className="h-10 px-3 text-sm text-slate-200 rounded-xl outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <option value="" className="text-slate-900">{t.debt}: {t.allDebt}</option>
          <option value="has_debt" className="text-slate-900">{t.hasDebt}</option>
          <option value="no_debt" className="text-slate-900">{t.noDebt}</option>
        </select>

        <button
          type="submit"
          className="h-10 px-4 rounded-xl text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-white/[0.06]"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {t.searchBtn}
        </button>
        {hasActiveFilters && (
          <Link
            href={`/${locale}/${clinicSlug}/patients`}
            className="h-10 px-3 rounded-xl text-sm font-medium text-slate-400 transition-all duration-200 hover:text-slate-200"
          >
            {t.reset}
          </Link>
        )}
      </form>

      {/* Table */}
      <PremiumTableWrapper>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[t.name, t.phone, t.dob, t.registered, t.debt, t.actions].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${i === 5 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!patients.length ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Users}
                    title={t.noPatients}
                    description={query ? `${t.noResults} "${query}"` : t.addFirst}
                  />
                </td>
              </tr>
            ) : (
              patients.map((patient, i) => {
                const debt = debtById.get(patient.id) || 0
                return (
                  <tr
                    key={patient.id}
                    className="group transition-colors duration-150 hover:bg-white/[0.03]"
                    style={{ borderBottom: i < patients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-200 max-w-[200px] truncate">
                      {patient.full_name}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {patient.phone || <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {patient.date_of_birth || <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(patient.registered_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      {debt > 0 ? (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: 'hsl(0 84% 65%)',
                          }}
                        >
                          {debt.toLocaleString(undefined, { maximumFractionDigits: 0 })} EGP
                        </span>
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: 'hsl(168 100% 52%)' }}>
                          ✓ {t.paid}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/${locale}/${clinicSlug}/patients/${patient.display_id || patient.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{
                          background: 'rgba(0,212,170,0.08)',
                          border: '1px solid rgba(0,212,170,0.15)',
                          color: 'hsl(168 100% 52%)',
                        }}
                      >
                        {t.viewFile} →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </PremiumTableWrapper>
    </div>
  )
}
