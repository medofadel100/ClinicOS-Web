import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { DollarSign, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import { requireClinicId } from "@/lib/utils/clinic"
import dynamic from 'next/dynamic'
import LogExpenseDialog from './LogExpenseDialog'
import type { ChartDataPoint } from './FinancialChart'
import PendingExpenses from './PendingExpenses'

const FinancialChart = dynamic(() => import('./FinancialChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-white/5 rounded-2xl" />
})

export default async function FinancePage({
      params: { clinicSlug, locale }
    }: {
              params: { clinicSlug: string, locale: string }
            }) {
    const isAr = locale === 'ar'
    const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()

  let recentPayments: any[] = []
  let recentExpenses: any[] = []
  let pendingOccurrences: any[] = []
  let chartData: ChartDataPoint[] = []
  let totalRevenue = 0
  let totalExpenses = 0
  let netIncome = 0

  try {
    const { data: paymentsData } = await supabase
      .from('patient_payments')
      .select(`*, patients(full_name), staff_members(full_name)`)
      .eq('clinic_id', clinicId)
      .order('paid_at', { ascending: false })
      .limit(50)

    if (paymentsData) {
      recentPayments = paymentsData
      totalRevenue = paymentsData.reduce((sum, p) => sum + Number(p.amount_egp || 0), 0)
    }

    const { data: expensesData } = await supabase
      .from('clinic_expenses')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (expensesData) {
      recentExpenses = expensesData
      totalExpenses = expensesData.reduce((sum, e) => sum + Number(e.amount_egp || 0), 0)
    }

    const { data: pendingData } = await supabase
      .from('expense_occurrences')
      .select(`*, clinic_expenses!inner(clinic_id, title, category)`)
      .eq('clinic_expenses.clinic_id', clinicId)
      .eq('status', 'pending')
      .order('period_date', { ascending: true })
      
    if (pendingData) {
      pendingOccurrences = pendingData
    }

    netIncome = totalRevenue - totalExpenses

    // Aggregate Chart Data for the last 6 months
    const monthlyMap: Record<string, { revenue: number, expenses: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().substring(0, 7) // YYYY-MM
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      monthlyMap[key] = { revenue: 0, expenses: 0 }
      chartData.push({ month: label, revenue: 0, expenses: 0 })
    }

    // Assign revenue
    paymentsData?.forEach(p => {
      if (!p.paid_at) return
      const key = p.paid_at.substring(0, 7)
      if (monthlyMap[key]) monthlyMap[key].revenue += Number(p.amount_egp || 0)
    })

    // Assign expenses (using start_date or created_at for simplicity here)
    expensesData?.forEach(e => {
      const dateStr = e.start_date || e.created_at
      if (!dateStr) return
      const key = dateStr.substring(0, 7)
      if (monthlyMap[key]) monthlyMap[key].expenses += Number(e.amount_egp || 0)
    })

    // Map back to chartData
    chartData = chartData.map(d => {
      // Find the key from the label is hard, let's just re-iterate by the same logic
      const d2 = new Date(d.month)
      const key = d2.toISOString().substring(0, 7)
      return {
        ...d,
        revenue: monthlyMap[key]?.revenue || 0,
        expenses: monthlyMap[key]?.expenses || 0
      }
    })

  } catch (error) {
    console.error('Error fetching finance data:', error)
  }

  const metricCards = [
    {
      title: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `${totalRevenue.toFixed(2)} EGP`,
      icon: ArrowUpRight,
      iconColor: 'text-green-400',
      iconBg: 'rgba(34,197,94,0.12)',
      borderColor: 'rgba(34,197,94,0.15)',
      glowColor: 'rgba(34,197,94,0.3)',
      sub: isAr ? 'من مدفوعات المرضى' : 'From patient payments',
    },
    {
      title: isAr ? 'إجمالي المصروفات' : 'Total Expenses',
      value: `${totalExpenses.toFixed(2)} EGP`,
      icon: ArrowDownRight,
      iconColor: 'text-red-400',
      iconBg: 'rgba(239,68,68,0.12)',
      borderColor: 'rgba(239,68,68,0.15)',
      glowColor: 'rgba(239,68,68,0.3)',
      sub: isAr ? 'تكاليف التشغيل' : 'Operating costs',
    },
    {
      title: isAr ? 'صافي الدخل' : 'Net Income',
      value: `${netIncome.toFixed(2)} EGP`,
      icon: TrendingUp,
      iconColor: netIncome >= 0 ? 'text-teal-400' : 'text-red-400',
      iconBg: netIncome >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(239,68,68,0.12)',
      borderColor: netIncome >= 0 ? 'rgba(0,212,170,0.15)' : 'rgba(239,68,68,0.15)',
      glowColor: netIncome >= 0 ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.3)',
      sub: isAr ? 'الإيرادات ناقص المصروفات' : 'Revenue minus expenses',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={isAr ? 'المالية' : 'Finance'}
        description={isAr ? 'تتبع الإيرادات والمصروفات وصافي الدخل لعيادتك.' : 'Track revenue, expenses, and net income for your clinic.'}
        icon={DollarSign}
        iconColor="text-green-400"
        iconBg="rgba(34,197,94,0.12)"
        actions={<LogExpenseDialog clinicId={clinicId} locale={locale} />}
      />

      <FinancialChart data={chartData} />

      <PendingExpenses clinicId={clinicId} locale={locale} pendingOccurrences={pendingOccurrences} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {card.value}
            </div>
            <p className="text-xs text-slate-600">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Income Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">{isAr ? 'المدفوعات الأخيرة' : 'Recent Payments'}</h2>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            Income
          </span>
        </div>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {(isAr ? ['التاريخ', 'المريض', 'المبلغ', 'الطريقة', 'سجّل بواسطة'] : ['Date', 'Patient', 'Amount', 'Method', 'Recorded By']).map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!recentPayments.length ? (
                <tr><td colSpan={5}><EmptyState icon={DollarSign} title={isAr ? 'لا توجد مدفوعات مسجلة بعد.' : 'No payments recorded yet.'} description={isAr ? 'ستظهر المدفوعات هنا بعد تسجيلها' : 'Payments will appear here once recorded'} /></td></tr>
              ) : recentPayments.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < recentPayments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200 max-w-[200px] truncate">{p.patients?.full_name || '—'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-green-400 whitespace-nowrap">{Number(p.amount_egp).toFixed(2)} EGP</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize whitespace-nowrap">{p.payment_method?.replace('_', ' ') || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 max-w-[150px] truncate">{p.staff_members?.full_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>

      {/* Expenses Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">{isAr ? 'المصروفات الأخيرة' : 'Recent Expenses'}</h2>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Expenses
          </span>
        </div>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {(isAr ? ['التاريخ', 'العنوان', 'الفئة', 'المبلغ', 'التكرار', 'الحالة'] : ['Date', 'Title', 'Category', 'Amount', 'Recurrence', 'Status']).map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!recentExpenses.length ? (
                <tr><td colSpan={6}><EmptyState icon={ArrowDownRight} title={isAr ? 'لم يتم تسجيل أي مصروفات بعد.' : 'No expenses logged yet.'} description={isAr ? 'تتبع تكاليف تشغيل عيادتك هنا' : "Track your clinic's operating costs here"} /></td></tr>
              ) : recentExpenses.map((e, i) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < recentExpenses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{new Date(e.start_date || e.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200 max-w-[200px] truncate">{e.title}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">{e.category || '—'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-red-400">{Number(e.amount_egp).toFixed(2)} EGP</td>
                  <td className="px-5 py-4 text-sm text-slate-500 capitalize">{e.recurrence?.replace('_', ' ') || '—'}</td>
                  <td className="px-5 py-4"><StatusBadge status={e.is_active ? 'active' : 'ended'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>
    </div>
  )
}
