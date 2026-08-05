import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumTableWrapper, EmptyState } from '@/components/layout/PageComponents'
import { BarChart3, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Link2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { requireClinicId } from "@/lib/utils/clinic";

const FinancialChart = dynamic(() => import('./FinancialChart'), {
  ssr: false,
  loading: () => <div className="col-span-1 lg:col-span-2 h-[300px] animate-pulse bg-white/5 rounded-2xl" />
})
const AppointmentsChart = dynamic(() => import('./AppointmentsChart'), {
  ssr: false,
  loading: () => <div className="col-span-1 h-[300px] animate-pulse bg-white/5 rounded-2xl" />
})

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'vodafone_cash', 'instapay', 'other']
const EXPENSE_CATEGORIES = ['rent', 'salaries', 'installment', 'utilities', 'supplies', 'other']

export default async function ReportsPage({
  params: { locale, clinicSlug },
  searchParams
}: {
  params: { locale: string; clinicSlug: string },
  searchParams: { from_date?: string; to_date?: string; payment_method?: string; expense_category?: string }
}) {
  const clinicId = await requireClinicId(clinicSlug);
  const isAr = locale === 'ar'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) redirect(`/${locale}/clinic-switcher`)

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    redirect(`/${locale}/${clinicSlug}`)
  }

  const fromDate = searchParams.from_date || ''
  const toDate = searchParams.to_date || ''
  const paymentMethod = searchParams.payment_method || ''
  const expenseCategory = searchParams.expense_category || ''

  const defaultFrom = new Date(new Date().getFullYear(), 0, 1).toISOString()
  const actualFrom = fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : defaultFrom
  const actualTo = toDate ? new Date(`${toDate}T23:59:59`).toISOString() : new Date().toISOString()

  let payQuery = supabase
    .from('patient_payments')
    .select('*, patients(full_name), staff_members(full_name)')
    .eq('clinic_id', clinicId)
    .gte('paid_at', actualFrom)
    .lte('paid_at', actualTo)
  if (paymentMethod) payQuery = payQuery.eq('payment_method', paymentMethod)
  payQuery = payQuery.order('paid_at', { ascending: false })

  let expQuery = supabase
    .from('clinic_expenses')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte('created_at', actualFrom)
    .lte('created_at', actualTo)
  if (expenseCategory) expQuery = expQuery.eq('category', expenseCategory)
  expQuery = expQuery.order('created_at', { ascending: false })

  const [{ data: payments }, { data: expenses }] = await Promise.all([payQuery, expQuery])

  const paymentList = payments || []
  const expenseList = expenses || []

  const totalRevenue = paymentList.reduce((sum, p) => sum + Number(p.amount_egp || 0), 0)
  const totalExpenses = expenseList.reduce((sum, e) => sum + Number(e.amount_egp || 0), 0)
  const netIncome = totalRevenue - totalExpenses

  // Income by payment method
  const methodMap = new Map<string, number>()
  paymentList.forEach((p) => {
    const m = p.payment_method || 'other'
    methodMap.set(m, (methodMap.get(m) || 0) + Number(p.amount_egp || 0))
  })

  // Expenses by category
  const categoryMap = new Map<string, number>()
  expenseList.forEach((e) => {
    const c = e.category || 'other'
    categoryMap.set(c, (categoryMap.get(c) || 0) + Number(e.amount_egp || 0))
  })

  // Monthly chart data for the filtered range
  const monthlyMap = new Map<string, { Income: number, Expenses: number }>()
  const start = new Date(actualFrom)
  const end = new Date(actualTo)
  for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap.set(key, { Income: 0, Expenses: 0 })
  }
  paymentList.forEach((p) => {
    const key = (p.paid_at || '').substring(0, 7)
    const entry = monthlyMap.get(key)
    if (entry) entry.Income += Number(p.amount_egp || 0)
  })
  expenseList.forEach((e) => {
    const key = (e.created_at || '').substring(0, 7)
    const entry = monthlyMap.get(key)
    if (entry) entry.Expenses += Number(e.amount_egp || 0)
  })
  const chartData = Array.from(monthlyMap.entries()).map(([key, v]) => {
    const [y, m] = key.split('-')
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' })
    return { name: label, Income: v.Income, Expenses: v.Expenses }
  })

  // Appointments by status in the filtered range
  const { data: appointments } = await supabase
    .from('appointments')
    .select('status')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', actualFrom)
    .lte('scheduled_at', actualTo)

  const statusCounts = (appointments || []).reduce((acc: any, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})
  const appointmentData = Object.keys(statusCounts).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: statusCounts[status]
  }))

  // Outstanding debt (current, across all patients)
  const { data: activePlans } = await supabase
    .from('treatment_plans')
    .select('patient_id, total_price_egp')
    .eq('clinic_id', clinicId)
    .eq('status', 'active')

  const { data: allPayments } = await supabase
    .from('patient_payments')
    .select('patient_id, amount_egp')
    .eq('clinic_id', clinicId)

  const owedByPatient = new Map<string, number>()
  ;(activePlans || []).forEach((plan: any) => {
    owedByPatient.set(plan.patient_id, (owedByPatient.get(plan.patient_id) || 0) + Number(plan.total_price_egp || 0))
  })
  ;(allPayments || []).forEach((p: any) => {
    owedByPatient.set(p.patient_id, (owedByPatient.get(p.patient_id) || 0) - Number(p.amount_egp || 0))
  })
  const outstandingDebt = Array.from(owedByPatient.values()).reduce((sum, v) => sum + Math.max(0, v), 0)

  const t = {
    filters: isAr ? 'تصفية التقرير' : 'Filter report',
    from: isAr ? 'من تاريخ' : 'From',
    to: isAr ? 'إلى تاريخ' : 'To',
    method: isAr ? 'طريقة الدفع' : 'Payment Method',
    allMethods: isAr ? 'كل الطرق' : 'All methods',
    category: isAr ? 'فئة المصروف' : 'Expense Category',
    allCategories: isAr ? 'كل الفئات' : 'All categories',
    apply: isAr ? 'تطبيق' : 'Apply',
    reset: isAr ? 'إعادة تعيين' : 'Reset',
    revenue: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',
    expenses: isAr ? 'إجمالي المصروفات' : 'Total Expenses',
    net: isAr ? 'صافي الدخل' : 'Net Income',
    debt: isAr ? 'المديونية المستحقة' : 'Outstanding Debt',
    incomeByMethod: isAr ? 'الإيرادات حسب طريقة الدفع' : 'Income by Payment Method',
    expensesByCategory: isAr ? 'المصروفات حسب الفئة' : 'Expenses by Category',
    incomeDetails: isAr ? 'تفاصيل الإيرادات' : 'Income Details',
    expenseDetails: isAr ? 'تفاصيل المصروفات' : 'Expense Details',
    noIncome: isAr ? 'لا توجد إيرادات في هذا النطاق' : 'No income in this range',
    noExpenses: isAr ? 'لا توجد مصروفات في هذا النطاق' : 'No expenses in this range',
  }

  const methodLabels: Record<string, string> = {
    cash: isAr ? 'نقداً' : 'Cash',
    bank_transfer: isAr ? 'تحويل بنكي' : 'Bank Transfer',
    vodafone_cash: isAr ? 'فودافون كاش' : 'Vodafone Cash',
    instapay: isAr ? 'انستا باي' : 'InstaPay',
    other: isAr ? 'أخرى' : 'Other',
  }
  const categoryLabels: Record<string, string> = {
    rent: isAr ? 'إيجار' : 'Rent',
    salaries: isAr ? 'رواتب' : 'Salaries',
    installment: isAr ? 'أقساط' : 'Installment',
    utilities: isAr ? 'مرافق' : 'Utilities',
    supplies: isAr ? 'مستلزمات' : 'Supplies',
    other: isAr ? 'أخرى' : 'Other',
  }

  const hasActiveFilters = !!(fromDate || toDate || paymentMethod || expenseCategory)

  const metricCards = [
    {
      title: t.revenue,
      value: `${totalRevenue.toFixed(0)} EGP`,
      icon: ArrowUpRight,
      iconColor: 'text-green-400',
      iconBg: 'rgba(34,197,94,0.12)',
      borderColor: 'rgba(34,197,94,0.15)',
      glowColor: 'rgba(34,197,94,0.3)',
    },
    {
      title: t.expenses,
      value: `${totalExpenses.toFixed(0)} EGP`,
      icon: ArrowDownRight,
      iconColor: 'text-red-400',
      iconBg: 'rgba(239,68,68,0.12)',
      borderColor: 'rgba(239,68,68,0.15)',
      glowColor: 'rgba(239,68,68,0.3)',
    },
    {
      title: t.net,
      value: `${netIncome.toFixed(0)} EGP`,
      icon: TrendingUp,
      iconColor: netIncome >= 0 ? 'text-teal-400' : 'text-red-400',
      iconBg: netIncome >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(239,68,68,0.12)',
      borderColor: netIncome >= 0 ? 'rgba(0,212,170,0.15)' : 'rgba(239,68,68,0.15)',
      glowColor: netIncome >= 0 ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.3)',
    },
    {
      title: t.debt,
      value: `${outstandingDebt.toFixed(0)} EGP`,
      icon: Wallet,
      iconColor: 'text-amber-400',
      iconBg: 'rgba(245,158,11,0.12)',
      borderColor: 'rgba(245,158,11,0.15)',
      glowColor: 'rgba(245,158,11,0.3)',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title={isAr ? 'التقارير والتحليلات' : 'Analytics & Reports'}
        description={isAr ? 'تقرير مالي مفصل لأداء العيادة مع فلاتر.' : 'Detailed financial report for your clinic with filters.'}
        icon={BarChart3}
        iconColor="text-indigo-400"
        iconBg="rgba(99,102,241,0.12)"
      />

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3" action={`/${locale}/${clinicSlug}/reports`} method="GET">
        <label className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
          {t.from}
          <input
            name="from_date"
            type="date"
            defaultValue={fromDate}
            className="h-10 px-3 text-sm text-slate-200 bg-transparent rounded-xl outline-none transition-all duration-200 [color-scheme:dark]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
          {t.to}
          <input
            name="to_date"
            type="date"
            defaultValue={toDate}
            className="h-10 px-3 text-sm text-slate-200 bg-transparent rounded-xl outline-none transition-all duration-200 [color-scheme:dark]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </label>
        <select
          name="payment_method"
          defaultValue={paymentMethod}
          className="h-10 px-3 text-sm text-slate-200 rounded-xl outline-none transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="" className="text-slate-900">{t.method}: {t.allMethods}</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m} className="text-slate-900">{methodLabels[m]}</option>
          ))}
        </select>
        <select
          name="expense_category"
          defaultValue={expenseCategory}
          className="h-10 px-3 text-sm text-slate-200 rounded-xl outline-none transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="" className="text-slate-900">{t.category}: {t.allCategories}</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c} className="text-slate-900">{categoryLabels[c]}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-white/[0.06]"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {t.apply}
        </button>
        {hasActiveFilters && (
          <a
            href={`/${locale}/${clinicSlug}/reports`}
            className="h-10 px-3 rounded-xl text-sm font-medium text-slate-400 transition-all duration-200 hover:text-slate-200 flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" /> {t.reset}
          </a>
        )}
      </form>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, i) => (
          <div
            key={card.title}
            className="relative group rounded-2xl p-5 hover-lift animate-slide-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: `1px solid ${card.borderColor}`,
              animationDelay: `${i * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-[13px] font-medium text-slate-400">{card.title}</p>
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ background: card.iconBg, boxShadow: `0 0 12px ${card.glowColor.replace('0.3', '0.15')}` }}
              >
                <card.icon className={card.iconColor} style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FinancialChart data={chartData} locale={locale} />
        <AppointmentsChart data={appointmentData} locale={locale} />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-base font-semibold text-slate-200 mb-4">{t.incomeByMethod}</h3>
          {methodMap.size === 0 ? (
            <p className="text-sm text-slate-500">{isAr ? 'لا توجد بيانات.' : 'No data.'}</p>
          ) : (
            <div className="space-y-3">
              {Array.from(methodMap.entries()).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
                <div key={m}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-400">{methodLabels[m] || m}</span>
                    <span className="font-semibold text-slate-200">{v.toLocaleString()} EGP</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${totalRevenue > 0 ? Math.round((v / totalRevenue) * 100) : 0}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-base font-semibold text-slate-200 mb-4">{t.expensesByCategory}</h3>
          {categoryMap.size === 0 ? (
            <p className="text-sm text-slate-500">{isAr ? 'لا توجد بيانات.' : 'No data.'}</p>
          ) : (
            <div className="space-y-3">
              {Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).map(([c, v]) => (
                <div key={c}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-400">{categoryLabels[c] || c}</span>
                    <span className="font-semibold text-slate-200">{v.toLocaleString()} EGP</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${totalExpenses > 0 ? Math.round((v / totalExpenses) * 100) : 0}%`, background: 'linear-gradient(90deg,#ef4444,#f87171)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Income details */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200">{t.incomeDetails}</h2>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {(isAr ? ['التاريخ', 'المريض', 'النوع', 'الطريقة', 'المبلغ'] : ['Date', 'Patient', 'Type', 'Method', 'Amount']).map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!paymentList.length ? (
                <tr><td colSpan={5}><EmptyState icon={ArrowUpRight} title={t.noIncome} description={isAr ? 'غيّر نطاق التاريخ أو الفلاتر' : 'Try changing the date range or filters'} /></td></tr>
              ) : paymentList.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < paymentList.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200 max-w-[200px] truncate">{p.patients?.full_name || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">{p.payment_type?.replace('_', ' ') || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize whitespace-nowrap">{methodLabels[p.payment_method] || p.payment_method?.replace('_', ' ') || '—'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-green-400 whitespace-nowrap">{Number(p.amount_egp).toFixed(0)} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>

      {/* Expense details */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200">{t.expenseDetails}</h2>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {(isAr ? ['التاريخ', 'العنوان', 'الفئة', 'المبلغ'] : ['Date', 'Title', 'Category', 'Amount']).map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!expenseList.length ? (
                <tr><td colSpan={4}><EmptyState icon={ArrowDownRight} title={t.noExpenses} description={isAr ? 'غيّر نطاق التاريخ أو الفلاتر' : 'Try changing the date range or filters'} /></td></tr>
              ) : expenseList.map((e, i) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < expenseList.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{new Date(e.start_date || e.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200 max-w-[200px] truncate">{e.title}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">{categoryLabels[e.category] || e.category || '—'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-red-400 whitespace-nowrap">{Number(e.amount_egp).toFixed(0)} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>
    </div>
  )
}
