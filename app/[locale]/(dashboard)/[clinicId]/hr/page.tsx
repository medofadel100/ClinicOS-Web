import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumCard, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { Users, UserCheck, Clock, DollarSign } from 'lucide-react'

export default async function HRDashboard({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  let staffDirectory: any[] = []
  let attendanceRecords: any[] = []
  let payrollRuns: any[] = []

  try {
    const { data: directoryData } = await supabase
      .from('clinic_staff_memberships')
      .select(`id, role, is_active, staff_members ( id, full_name, auth_user_id )`)
      .eq('clinic_id', clinicId)

    if (directoryData) staffDirectory = directoryData

    const { data: attendanceData } = await supabase
      .from('staff_attendance')
      .select(`*, clinic_staff_memberships ( staff_members ( full_name ) )`)
      .eq('clinic_id', clinicId)
      .order('work_date', { ascending: false })
      .limit(30)

    if (attendanceData) attendanceRecords = attendanceData

    const membershipIds = directoryData?.map(d => d.id) || []
    if (membershipIds.length > 0) {
      const { data: payrollData } = await supabase
        .from('payroll_runs')
        .select(`*, clinic_staff_memberships ( staff_members ( full_name ) )`)
        .eq('clinic_id', clinicId)
        .order('period_month', { ascending: false })
        .limit(20)

      if (payrollData) payrollRuns = payrollData
    }
  } catch (error) {
    console.error('Error fetching HR data:', error)
  }

  const activeStaff = staffDirectory.filter(s => s.is_active).length
  const totalStaff = staffDirectory.length

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="HR Dashboard"
        description="Manage staff directory, attendance, and payroll."
        icon={Users}
        iconColor="text-violet-400"
        iconBg="rgba(124,58,237,0.12)"
        badge={`${activeStaff} active`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Staff', value: totalStaff, icon: Users, color: 'text-violet-400', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.15)' },
          { label: 'Active Members', value: activeStaff, icon: UserCheck, color: 'text-teal-400', bg: 'rgba(0,212,170,0.12)', border: 'rgba(0,212,170,0.15)' },
          { label: 'Payroll Runs', value: payrollRuns.length, icon: DollarSign, color: 'text-green-400', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.15)' },
        ].map((card, i) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 animate-slide-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: `1px solid ${card.border}`,
              animationDelay: `${i * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-medium text-slate-400">{card.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Staff Directory */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200">Staff Directory</h2>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Role', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!staffDirectory.length ? (
                <tr><td colSpan={3}><EmptyState icon={Users} title="No staff members found" /></td></tr>
              ) : staffDirectory.map((staff, i) => (
                <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < staffDirectory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200">{staff.staff_members?.full_name || 'Unknown'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">{staff.role}</td>
                  <td className="px-5 py-4"><StatusBadge status={staff.is_active ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>

      {/* Attendance */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200">Recent Attendance</h2>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Date', 'Staff Member', 'Check In', 'Check Out', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!attendanceRecords.length ? (
                <tr><td colSpan={5}><EmptyState icon={Clock} title="No attendance records" description="Records will appear as staff check in" /></td></tr>
              ) : attendanceRecords.map((record, i) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < attendanceRecords.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{record.work_date}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200">{record.clinic_staff_memberships?.staff_members?.full_name || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{record.check_in_at ? new Date(record.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{record.check_out_at ? new Date(record.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-5 py-4"><StatusBadge status={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>

      {/* Payroll */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200">Payroll Runs</h2>
        <PremiumTableWrapper>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Period', 'Staff Member', 'Base Salary', 'Net Pay', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!payrollRuns.length ? (
                <tr><td colSpan={5}><EmptyState icon={DollarSign} title="No payroll runs found" /></td></tr>
              ) : payrollRuns.map((run, i) => (
                <tr key={run.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < payrollRuns.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4 text-sm text-slate-400">{run.period_month}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200">{run.clinic_staff_memberships?.staff_members?.full_name || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{Number(run.base_salary_egp || 0).toFixed(2)} EGP</td>
                  <td className="px-5 py-4 text-sm font-bold text-teal-400">{Number(run.net_pay_egp || 0).toFixed(2)} EGP</td>
                  <td className="px-5 py-4"><StatusBadge status={run.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumTableWrapper>
      </div>
    </div>
  )
}
