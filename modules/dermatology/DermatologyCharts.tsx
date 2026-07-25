'use client'

import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Zap, Syringe, Stethoscope, Activity } from 'lucide-react'
import type { DermatologyAestheticsData } from './types'

const COLORS = ['#14b8a6', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#ec4899']

interface Props {
  data: DermatologyAestheticsData
  isAr: boolean
}

export default function DermatologyCharts({ data, isAr }: Props) {
  const t = {
    laserByType: isAr ? 'جلسات الليزر حسب النوع' : 'Laser Sessions by Type',
    injectablesByType: isAr ? 'الحقن حسب النوع' : 'Injectables by Type',
    treatmentSeverity: isAr ? 'توزيع الشدة' : 'Severity Distribution',
    monthlyActivity: isAr ? 'النشاط الشهري' : 'Monthly Activity',
    sessionsOverTime: isAr ? 'جلسات الليزر عبر الزمن' : 'Laser Sessions Over Time',
    noData: isAr ? 'لا توجد بيانات كافية للرسوم البيانية' : 'Not enough data for charts yet',
    totalSessions: isAr ? 'إجمالي الجلسات' : 'Total Sessions',
    completed: isAr ? 'منجز' : 'Completed',
    scheduled: isAr ? 'مجدول' : 'Scheduled',
    active: isAr ? 'نشط' : 'Active',
    resolved: isAr ? 'محلول' : 'Resolved',
    count: isAr ? 'العدد' : 'Count',
  }

  // ─── Laser by Type (Pie Chart) ───────────────────────────
  const laserByType = useMemo(() => {
    const map = new Map<string, number>()
    data.laser_sessions.forEach(s => {
      map.set(s.laser_type, (map.get(s.laser_type) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [data.laser_sessions])

  // ─── Laser Timeline (Bar Chart) ──────────────────────────
  const laserTimeline = useMemo(() => {
    return data.laser_sessions
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
      .map(s => ({
        date: new Date(s.session_date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
        session: s.session_number,
        area: s.treatment_area,
        status: s.status,
      }))
  }, [data.laser_sessions, isAr])

  // ─── Injectables by Type (Pie Chart) ─────────────────────
  const injectablesByType = useMemo(() => {
    const map = new Map<string, number>()
    data.injectables.forEach(r => {
      map.set(r.type, (map.get(r.type) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [data.injectables])

  // ─── Treatment Severity (Bar Chart) ──────────────────────
  const severityData = useMemo(() => {
    const counts = { mild: 0, moderate: 0, severe: 0 }
    data.treatments.forEach(r => {
      if (r.severity in counts) counts[r.severity as keyof typeof counts]++
    })
    return [
      { name: isAr ? 'خفيف' : 'Mild', count: counts.mild, fill: '#3b82f6' },
      { name: isAr ? 'متوسط' : 'Moderate', count: counts.moderate, fill: '#f59e0b' },
      { name: isAr ? 'شديد' : 'Severe', count: counts.severe, fill: '#ef4444' },
    ]
  }, [data.treatments, isAr])

  // ─── Monthly Activity (Line Chart) ───────────────────────
  const monthlyActivity = useMemo(() => {
    const monthMap = new Map<string, { laser: number; injectable: number; skincare: number; treatment: number }>()
    const allDates = [
      ...data.laser_sessions.map(s => s.session_date),
      ...data.injectables.map(r => r.session_date),
      ...data.skincare.map(r => r.session_date),
      ...data.treatments.map(r => r.start_date),
    ]
    allDates.forEach(d => {
      const key = d.substring(0, 7) // YYYY-MM
      if (!monthMap.has(key)) monthMap.set(key, { laser: 0, injectable: 0, skincare: 0, treatment: 0 })
    })
    data.laser_sessions.forEach(s => {
      const key = s.session_date.substring(0, 7)
      const entry = monthMap.get(key)
      if (entry) entry.laser++
    })
    data.injectables.forEach(r => {
      const key = r.session_date.substring(0, 7)
      const entry = monthMap.get(key)
      if (entry) entry.injectable++
    })
    data.skincare.forEach(r => {
      const key = r.session_date.substring(0, 7)
      const entry = monthMap.get(key)
      if (entry) entry.skincare++
    })
    data.treatments.forEach(r => {
      const key = r.start_date.substring(0, 7)
      const entry = monthMap.get(key)
      if (entry) entry.treatment++
    })
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, counts]) => ({
        month: new Date(month + '-01').toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', year: '2-digit' }),
        ...counts,
      }))
  }, [data, isAr])

  // ─── Treatment Status (Pie Chart) ────────────────────────
  const treatmentStatus = useMemo(() => {
    const map = new Map<string, number>()
    data.treatments.forEach(r => {
      map.set(r.status, (map.get(r.status) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [data.treatments])

  const totalRecords = data.laser_sessions.length + data.injectables.length + data.skincare.length + data.treatments.length

  if (totalRecords < 3) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Activity className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">{t.noData}</p>
        <p className="text-slate-600 text-xs mt-1">{isAr ? 'أضف جلسات وعلاجات لتظهر الرسوم البيانية' : 'Add sessions and treatments to see analytics'}</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) => {
    if (!active || !payload) return null
    return (
      <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isAr ? 'جلسات ليزر' : 'Laser Sessions', value: data.laser_sessions.length, icon: <Zap className="w-4 h-4" />, color: 'text-teal-400' },
          { label: isAr ? 'حقن' : 'Injectables', value: data.injectables.length, icon: <Syringe className="w-4 h-4" />, color: 'text-purple-400' },
          { label: isAr ? 'جلسات بشرة' : 'Skincare', value: data.skincare.length, icon: <TrendingUp className="w-4 h-4" />, color: 'text-amber-400' },
          { label: isAr ? 'علاجات' : 'Treatments', value: data.treatments.length, icon: <Stethoscope className="w-4 h-4" />, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-3">
            <div className={`${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-slate-100">{s.value}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Laser by Type - Pie */}
        {laserByType.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4">{t.laserByType}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={laserByType} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {laserByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Injectables by Type - Pie */}
        {injectablesByType.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4">{t.injectablesByType}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={injectablesByType} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {injectablesByType.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Laser Timeline - Bar */}
        {laserTimeline.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4">{t.sessionsOverTime}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={laserTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="session" name={isAr ? 'رقم الجلسة' : 'Session #'} fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Treatment Severity - Bar */}
        {data.treatments.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4">{t.treatmentSeverity}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name={t.count} radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Activity - Line */}
        {monthlyActivity.length > 1 && (
          <div className="bg-white/5 rounded-2xl border border-white/5 p-5 lg:col-span-2">
            <h4 className="text-sm font-semibold text-slate-200 mb-4">{t.monthlyActivity}</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="laser" name={isAr ? 'ليزر' : 'Laser'} stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="injectable" name={isAr ? 'حقن' : 'Injectable'} stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="skincare" name={isAr ? 'بشرة' : 'Skincare'} stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="treatment" name={isAr ? 'علاج' : 'Treatment'} stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Treatment Status - Pie */}
        {treatmentStatus.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4">{isAr ? 'حالة العلاجات' : 'Treatment Status'}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={treatmentStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {treatmentStatus.map((_, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
