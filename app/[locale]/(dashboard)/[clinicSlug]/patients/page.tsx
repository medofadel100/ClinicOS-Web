import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddPatientDialog from './AddPatientDialog'
import { PageHeader, PremiumTableWrapper, EmptyState } from '@/components/layout/PageComponents'
import { Users, Search } from 'lucide-react'
import { requireClinicId } from "@/lib/utils/clinic";

export default async function PatientsPage({
      params: { locale, clinicSlug },
      searchParams
    }: {
              params: { locale: string; clinicSlug: string },
              searchParams: { q?: string }
            }) {
    const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const query = searchParams.q || ''

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
  }

  let dbQuery = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('registered_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
  }

  const { data: patients } = await dbQuery

  const { data: activeCampaignsData } = await supabase
    .from('marketing_campaigns')
    .select('id, name')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)

  const _activeCampaigns = activeCampaignsData || []

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t.title}
        description={t.description}
        icon={Users}
        iconColor="text-violet-400"
        iconBg="rgba(124,58,237,0.12)"
        badge={`${patients?.length ?? 0} ${t.records}`}
        actions={
          <AddPatientDialog clinicId={clinicId} clinicSlug={clinicSlug} locale={locale} />
        }
      />

      {/* Search */}
      <form
        className="flex items-center gap-3"
        action={`/${locale}/${clinicSlug}/patients`}
        method="GET"
      >
        <div className="relative flex-1 max-w-sm">
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
      </form>

      {/* Table */}
      <PremiumTableWrapper>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[t.name, t.phone, t.dob, t.registered, t.actions].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${i === 4 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!patients?.length ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Users}
                    title={t.noPatients}
                    description={query ? `${t.noResults} "${query}"` : t.addFirst}
                  />
                </td>
              </tr>
            ) : (
              patients.map((patient, i) => (
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
              ))
            )}
          </tbody>
        </table>
      </PremiumTableWrapper>
    </div>
  )
}
