import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { requireClinicId } from '@/lib/utils/clinic'
import { ClientDate } from '@/components/layout/ClientDate'
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react'

export default async function ClinicDashboardPage({
  params,
}: {
  params: { clinicSlug: string; locale: string }
}) {
  const { clinicSlug, locale } = params
  const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient();
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  let clinicName = t('unknownClinic');
  try {
    await supabase.auth.getUser();
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single();
    if (clinic?.name) clinicName = clinic.name;
  } catch (error) {
    console.error('Error fetching clinic:', error);
  }

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString()

  const [currentMonthPayments, lastMonthPayments] = await Promise.all([
    supabase.from('patient_payments').select('amount_egp').eq('clinic_id', clinicId).gte('paid_at', currentMonthStart),
    supabase.from('patient_payments').select('amount_egp').eq('clinic_id', clinicId).gte('paid_at', lastMonthStart).lte('paid_at', lastMonthEnd),
  ])

  const currentRevenue = currentMonthPayments.data?.reduce((sum, p) => sum + Number(p.amount_egp || 0), 0) || 0
  const lastRevenue = lastMonthPayments.data?.reduce((sum, p) => sum + Number(p.amount_egp || 0), 0) || 0

  const [currentMonthApps, lastMonthApps] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('scheduled_at', currentMonthStart),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('scheduled_at', lastMonthStart).lte('scheduled_at', lastMonthEnd),
  ])

  const currentAppCount = currentMonthApps.count || 0
  const lastAppCount = lastMonthApps.count || 0

  const [activePatients, activeStaff] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
    supabase.from('clinic_staff_memberships').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_active', true),
  ])

  const patientCount = activePatients.count || 0
  const staffCount = activeStaff.count || 0

  const revenueDelta = lastRevenue > 0 ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100) : 0
  const appDelta = lastAppCount > 0 ? Math.round(((currentAppCount - lastAppCount) / lastAppCount) * 100) : 0

  const formatCurrency = (val: number) => `EGP ${val.toLocaleString()}`
  const formatDelta = (val: number) => val >= 0 ? `+${val}%` : `${val}%`

  const stats = [
    {
      title: t('totalRevenue'),
      value: formatCurrency(currentRevenue),
      delta: formatDelta(revenueDelta),
      deltaLabel: t('fromLastMonth', { value: '' }).trim(),
      icon: DollarSign,
      iconBg: 'icon-bg-green',
      iconColor: 'text-green-400',
      glowColor: 'rgba(34,197,94,0.35)',
      borderColor: 'rgba(34,197,94,0.15)',
      trend: revenueDelta >= 0 ? 'up' : 'down',
    },
    {
      title: t('appointments'),
      value: currentAppCount.toLocaleString(),
      delta: formatDelta(appDelta),
      deltaLabel: t('fromLastMonth', { value: '' }).trim(),
      icon: Calendar,
      iconBg: 'icon-bg-blue',
      iconColor: 'text-blue-400',
      glowColor: 'rgba(59,130,246,0.35)',
      borderColor: 'rgba(59,130,246,0.15)',
      trend: appDelta >= 0 ? 'up' : 'down',
    },
    {
      title: t('activePatients'),
      value: patientCount.toLocaleString(),
      delta: '',
      deltaLabel: '',
      icon: Users,
      iconBg: 'icon-bg-purple',
      iconColor: 'text-violet-400',
      glowColor: 'rgba(124,58,237,0.35)',
      borderColor: 'rgba(124,58,237,0.15)',
      trend: 'neutral',
    },
    {
      title: t('activeStaff'),
      value: staffCount.toLocaleString(),
      delta: '',
      deltaLabel: '',
      icon: Activity,
      iconBg: 'icon-bg-teal',
      iconColor: 'text-teal-400',
      glowColor: 'rgba(0,212,170,0.35)',
      borderColor: 'rgba(0,212,170,0.15)',
      trend: 'neutral',
    },
  ]

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString()

  const { data: todayApps } = await supabase
    .from('appointments')
    .select('*, patients(full_name), clinic_services(name), clinic_staff_memberships(staff_members(full_name))')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', todayStart)
    .lte('scheduled_at', todayEnd)
    .order('scheduled_at', { ascending: true })

  const recentPayments = await supabase
    .from('patient_payments')
    .select('id, amount_egp, paid_at, patients(full_name)')
    .eq('clinic_id', clinicId)
    .order('paid_at', { ascending: false })
    .limit(5)

  const quickActions = [
    { label: t('newAppointment'), icon: Calendar, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', href: `/${locale}/${clinicSlug}/appointments` },
    { label: t('addPatient'), icon: Users, color: 'text-violet-400', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)', href: `/${locale}/${clinicSlug}/patients` },
    { label: t('checkInventory'), icon: CheckCircle2, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', href: `/${locale}/${clinicSlug}/inventory` },
    { label: t('todaySchedule'), icon: Clock, color: 'text-teal-400', bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.2)', href: `/${locale}/${clinicSlug}/appointments` },
  ]

  return (
    <div className="flex-1 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'hsl(168 100% 42%)' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsl(168 100% 42%)' }}>
              {t('liveDashboard')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('welcome', { name: clinicName })}
          </h1>
          <p className="text-sm text-slate-500">{t('todaySummary')}</p>
        </div>
        <ClientDate />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.title} className="relative group rounded-2xl p-5 hover-lift animate-slide-in-up cursor-default overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: `1px solid ${stat.borderColor}`, animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at top right, ${stat.glowColor.replace('0.35', '0.08')} 0%, transparent 70%)` }} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[13px] font-medium text-slate-400 leading-tight">{stat.title}</p>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.iconBg} transition-all duration-300 group-hover:scale-110`}
                  style={{ boxShadow: `0 0 16px ${stat.glowColor.replace('0.35', '0.2')}` }}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} style={{ filter: `drop-shadow(0 0 4px ${stat.glowColor})` }} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {stat.value}
              </div>
              {stat.delta ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: stat.trend === 'up' ? 'rgba(34,197,94,0.12)' : stat.trend === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.1)',
                      color: stat.trend === 'up' ? '#4ade80' : stat.trend === 'down' ? '#f87171' : '#94a3b8',
                      border: `1px solid ${stat.trend === 'up' ? 'rgba(34,197,94,0.2)' : stat.trend === 'down' ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.1)'}`,
                    }}>
                    {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {stat.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {stat.delta}
                  </span>
                  <span className="text-xs text-slate-600 truncate">{stat.deltaLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'hsl(168 100% 42%)' }} />
            {t('quickActions')}
          </h2>
          <span className="text-xs text-slate-600">{t('frequentlyUsed')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link key={action.label} href={action.href}
              className="group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl text-center transition-all duration-200 cursor-pointer animate-slide-in-up"
              style={{ background: action.bg, border: `1px solid ${action.border}`, animationDelay: `${200 + i * 60}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ background: action.bg, border: `1px solid ${action.border}`, boxShadow: `0 0 16px ${action.bg.replace('0.1', '0.2')}` }}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-[13px] font-medium text-slate-300 leading-tight">{action.label}</span>
              <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-6 animate-slide-in-up"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-200">{t('recentActivity')}</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,212,170,0.1)', color: 'hsl(168 100% 52%)', border: '1px solid rgba(0,212,170,0.2)' }}>
              {t('today')}
            </span>
          </div>
          {!recentPayments.data?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Activity className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">{t('noRecentActivity')}</p>
              <p className="text-xs text-slate-700 mt-1">{t('activityPlaceholder')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.data.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{p.patients?.full_name || '—'}</p>
                      <p className="text-xs text-slate-500">{new Date(p.paid_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-400">+{Number(p.amount_egp).toLocaleString()} EGP</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6 animate-slide-in-up"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: '480ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-200">{t('upcomingToday')}</h3>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          {!todayApps?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Calendar className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">{t('noAppointments')}</p>
              <p className="text-xs text-slate-700 mt-1">{t('scheduleClear')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayApps.slice(0, 5).map((app: any) => (
                <Link key={app.id} href={`/${locale}/${clinicSlug}/patients/${app.patient_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{app.patients?.full_name || '—'}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(app.scheduled_at).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{app.clinic_services?.name || ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
