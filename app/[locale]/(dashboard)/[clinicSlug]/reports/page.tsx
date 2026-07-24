import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageComponents'
import { BarChart3 } from 'lucide-react'
import FinancialChart from './FinancialChart'
import AppointmentsChart from './AppointmentsChart'
import { requireClinicId } from "@/lib/utils/clinic";

export default async function ReportsPage({
      params: { locale, clinicSlug }
    }: {
              params: { locale: string; clinicSlug: string }
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

  const currentYear = new Date().getFullYear()
  const startDate = new Date(currentYear, 0, 1).toISOString()

  const { data: payments } = await supabase
    .from('patient_payments')
    .select('amount_egp, paid_at')
    .eq('clinic_id', clinicId)
    .gte('paid_at', startDate)

  const { data: expenses } = await supabase
    .from('clinic_expenses')
    .select('amount_egp, created_at')
    .eq('clinic_id', clinicId)
    .gte('created_at', startDate)

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(i)
    return {
      name: d.toLocaleString('en-US', { month: 'short' }),
      Income: 0,
      Expenses: 0
    }
  })

  payments?.forEach(p => {
    const m = new Date(p.paid_at).getMonth()
    monthlyData[m].Income += Number(p.amount_egp)
  })

  expenses?.forEach(e => {
    const m = new Date(e.created_at).getMonth()
    monthlyData[m].Expenses += Number(e.amount_egp)
  })

  const currentMonth = new Date().getMonth()
  const chartData = monthlyData.slice(0, currentMonth + 1)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('status')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startDate)

  const statusCounts = appointments?.reduce((acc: any, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  const appointmentData = Object.keys(statusCounts || {}).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: statusCounts[status]
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title={isAr ? 'التقارير والتحليلات' : 'Analytics & Reports'}
        description={isAr ? `نظرة عامة على أداء العيادة لسنة ${currentYear}.` : `Clinic performance overview for ${currentYear}.`}
        icon={BarChart3}
        iconColor="text-indigo-400"
        iconBg="rgba(99,102,241,0.12)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FinancialChart data={chartData} locale={locale} />
        <AppointmentsChart data={appointmentData} locale={locale} />
      </div>
    </div>
  )
}

