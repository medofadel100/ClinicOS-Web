import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { ClientDate } from '@/components/layout/ClientDate'
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react'

export default async function ClinicDashboardPage({
  params,
}: {
  params: { clinicId: string; locale: string }
}) {
  const supabase = createClient()
  const t = await getTranslations({ locale: params.locale, namespace: 'Dashboard' })

  let clinicName = t('unknownClinic')
  try {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', params.clinicId)
      .single()

    if (clinic?.name) {
      clinicName = clinic.name
    }
  } catch (error) {
    console.error('Error fetching clinic:', error)
  }

  const stats = [
    {
      title: t('totalRevenue'),
      value: '$0.00',
      delta: '+0%',
      deltaLabel: t('fromLastMonth', { value: '' }).replace(' ', ''),
      icon: DollarSign,
      iconBg: 'icon-bg-green',
      iconColor: 'text-green-400',
      glowColor: 'rgba(34,197,94,0.35)',
      borderColor: 'rgba(34,197,94,0.15)',
      trend: 'up',
    },
    {
      title: t('appointments'),
      value: '+0',
      delta: '+0%',
      deltaLabel: t('fromLastMonth', { value: '' }).replace(' ', ''),
      icon: Calendar,
      iconBg: 'icon-bg-blue',
      iconColor: 'text-blue-400',
      glowColor: 'rgba(59,130,246,0.35)',
      borderColor: 'rgba(59,130,246,0.15)',
      trend: 'up',
    },
    {
      title: t('activePatients'),
      value: '+0',
      delta: '+0%',
      deltaLabel: t('sinceLastWeek', { value: '' }).replace(' ', ''),
      icon: Users,
      iconBg: 'icon-bg-purple',
      iconColor: 'text-violet-400',
      glowColor: 'rgba(124,58,237,0.35)',
      borderColor: 'rgba(124,58,237,0.15)',
      trend: 'up',
    },
    {
      title: t('activeStaff'),
      value: '0',
      delta: '+0',
      deltaLabel: t('sinceLastHour', { value: '' }).replace(' ', ''),
      icon: Activity,
      iconBg: 'icon-bg-teal',
      iconColor: 'text-teal-400',
      glowColor: 'rgba(0,212,170,0.35)',
      borderColor: 'rgba(0,212,170,0.15)',
      trend: 'neutral',
    },
  ]

  const quickActions = [
    {
      label: 'New Appointment',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.2)',
      hoverBorder: 'rgba(59,130,246,0.4)',
    },
    {
      label: 'Add Patient',
      icon: Users,
      color: 'text-violet-400',
      bg: 'rgba(124,58,237,0.1)',
      border: 'rgba(124,58,237,0.2)',
      hoverBorder: 'rgba(124,58,237,0.4)',
    },
    {
      label: 'Check Inventory',
      icon: CheckCircle2,
      color: 'text-amber-400',
      bg: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.2)',
      hoverBorder: 'rgba(245,158,11,0.4)',
    },
    {
      label: "Today's Schedule",
      icon: Clock,
      color: 'text-teal-400',
      bg: 'rgba(0,212,170,0.1)',
      border: 'rgba(0,212,170,0.2)',
      hoverBorder: 'rgba(0,212,170,0.4)',
    },
  ]

  return (
    <div className="flex-1 space-y-8 animate-fade-in">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Zap
              className="w-4 h-4"
              style={{ color: 'hsl(168 100% 42%)' }}
            />
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'hsl(168 100% 42%)' }}>
              Live Dashboard
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('welcome', { name: clinicName })}
          </h1>
          <p className="text-sm text-slate-500">
            Here's what's happening at your clinic today.
          </p>
        </div>

        {/* Date badge - rendered client-side to avoid hydration mismatch */}
        <ClientDate />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="relative group rounded-2xl p-5 hover-lift animate-slide-in-up cursor-default overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: `1px solid ${stat.borderColor}`,
              animationDelay: `${i * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            {/* Background glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(ellipse at top right, ${stat.glowColor.replace('0.35', '0.08')} 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10">
              {/* Top row: title + icon */}
              <div className="flex items-start justify-between mb-4">
                <p className="text-[13px] font-medium text-slate-400 leading-tight">
                  {stat.title}
                </p>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.iconBg} transition-all duration-300 group-hover:scale-110`}
                  style={{
                    boxShadow: `0 0 16px ${stat.glowColor.replace('0.35', '0.2')}`,
                  }}
                >
                  <stat.icon
                    className={`w-5 h-5 ${stat.iconColor}`}
                    style={{ filter: `drop-shadow(0 0 4px ${stat.glowColor})` }}
                  />
                </div>
              </div>

              {/* Metric value */}
              <div
                className="text-3xl font-bold tracking-tight text-white mb-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {stat.value}
              </div>

              {/* Delta badge */}
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: stat.trend === 'up'
                      ? 'rgba(34,197,94,0.12)'
                      : 'rgba(148,163,184,0.1)',
                    color: stat.trend === 'up' ? '#4ade80' : '#94a3b8',
                    border: `1px solid ${stat.trend === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.1)'}`,
                  }}
                >
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {stat.delta}
                </span>
                <span className="text-xs text-slate-600 truncate">
                  {stat.deltaLabel}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'hsl(168 100% 42%)' }} />
            Quick Actions
          </h2>
          <span className="text-xs text-slate-600">Frequently used</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.label}
              className="group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl text-center
                transition-all duration-200 cursor-pointer animate-slide-in-up"
              style={{
                background: action.bg,
                border: `1px solid ${action.border}`,
                animationDelay: `${200 + i * 60}ms`,
                animationFillMode: 'both',
              }}
            >
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                  boxShadow: `0 0 16px ${action.bg.replace('0.1', '0.2')}`,
                }}
              >
                <action.icon
                  className={`w-5 h-5 ${action.color}`}
                />
              </div>
              <span className="text-[13px] font-medium text-slate-300 leading-tight">
                {action.label}
              </span>
              <ArrowUpRight
                className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity Placeholder ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 animate-slide-in-up"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            animationDelay: '400ms',
            animationFillMode: 'both',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-200">Recent Activity</h3>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(0,212,170,0.1)',
                color: 'hsl(168 100% 52%)',
                border: '1px solid rgba(0,212,170,0.2)',
              }}
            >
              Today
            </span>
          </div>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <Activity className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-600 font-medium">No recent activity</p>
            <p className="text-xs text-slate-700 mt-1">Activity will appear here as your clinic operates</p>
          </div>
        </div>

        {/* Upcoming Today */}
        <div
          className="rounded-2xl p-6 animate-slide-in-up"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            animationDelay: '480ms',
            animationFillMode: 'both',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-200">Upcoming Today</h3>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <Calendar className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-600 font-medium">No appointments</p>
            <p className="text-xs text-slate-700 mt-1">Your schedule is clear</p>
          </div>
        </div>
      </div>
    </div>
  )
}
