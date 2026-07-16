import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumCard, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { DollarSign, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'

export default async function FinancePage({
  params: { clinicId, locale }
}: {
  params: { clinicId: string, locale: string }
}) {
  const supabase = createClient()

  let recentPayments: any[] = []
  let recentExpenses: any[] = []
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

    netIncome = totalRevenue - totalExpenses
  } catch (error) {
    console.error('Error fetching finance data:', error)
  }

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toFixed(2)} EGP`,
      icon: ArrowUpRight,
      iconColor: 'text-green-400',
      iconBg: 'rgba(34,197,94,0.12)',
      borderColor: 'rgba(34,197,94,0.15)',
      glowColor: 'rgba(34,197,94,0.3)',
      sub: 'From patient payments',
    },
    {
      title: 'Total Expenses',
      value: `${totalExpenses.toFixed(2)} EGP`,
      icon: ArrowDownRight,
      iconColor: 'text-red-400',
      iconBg: 'rgba(239,68,68,0.12)',
      borderColor: 'rgba(239,68,68,0.15)',
      glowColor: 'rgba(239,68,68,0.3)',
      sub: 'Operating costs',
    },
    {
      title: 'Net Income',
      value: `${netIncome.toFixed(2)} EGP`,
      icon: TrendingUp,
      iconColor: netIncome >= 0 ? 'text-teal-400' : 'text-red-400',
      iconBg: netIncome >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(239,68,68,0.12)',
      borderColor: netIncome >= 0 ? 'rgba(0,212,170,0.15)' : 'rgba(239,68,68,0.15)',
      glowColor: netIncome >= 0 ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.3)',
      sub: 'Revenue minus expenses',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Finance"
        description="Track revenue, expenses, and net income for your clinic."
        icon={DollarSign}
        iconColor="text-green-400"
        iconBg="rgba(34,197,94,0.12)"
      />

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
          <h2 className="text-base font-semibold text-slate-200">Recent Payments</h2>
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
                {['Date', 'Patient', 'Amount', 'Method', 'Recorded By'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!recentPayments.length ? (
                <tr><td colSpan={5}><EmptyState icon={DollarSign} title="No payments recorded yet" description="Payments will appear here once recorded" /></td></tr>
              ) : recentPayments.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < recentPayments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200">{p.patients?.full_name || '—'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-green-400">{Number(p.amount_egp).toFixed(2)} EGP</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">{p.payment_method?.replace('_', ' ') || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.staff_members?.full_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>

      {/* Expenses Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">Operating Expenses</h2>
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
                {['Date', 'Title', 'Category', 'Amount', 'Recurrence', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!recentExpenses.length ? (
                <tr><td colSpan={6}><EmptyState icon={ArrowDownRight} title="No expenses recorded yet" description="Track your clinic's operating costs here" /></td></tr>
              ) : recentExpenses.map((e, i) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < recentExpenses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{new Date(e.start_date || e.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200">{e.title}</td>
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
