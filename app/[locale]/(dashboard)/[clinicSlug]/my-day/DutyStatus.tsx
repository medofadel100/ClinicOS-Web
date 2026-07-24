'use client'

import { Clock, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react'

export default function DutyStatus({
  isAr,
  workingHours,
  currentTime,
  appointmentCount,
  specialty
}: {
  isAr: boolean
  workingHours: { start_time: string; end_time: string } | null
  currentTime: string
  appointmentCount: number
  specialty: string | null
}) {
  const isOnDuty = workingHours && currentTime >= workingHours.start_time.slice(0, 5) && currentTime <= workingHours.end_time.slice(0, 5)

  const stats = [
    {
      label: isAr ? 'الحالة' : 'Status',
      value: isOnDuty ? (isAr ? 'في الخدمة' : 'On Duty') : (isAr ? 'خارج الخدمة' : 'Off Duty'),
      icon: isOnDuty ? CheckCircle : AlertCircle,
      color: isOnDuty ? 'text-green-400' : 'text-slate-500',
      bg: isOnDuty ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)',
    },
    {
      label: isAr ? 'المواعيد' : 'Appointments',
      value: appointmentCount.toString(),
      icon: Clock,
      color: 'text-cyan-400',
      bg: 'rgba(34,211,238,0.12)',
    },
    {
      label: isAr ? 'الوقت الحالي' : 'Current Time',
      value: currentTime,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'rgba(59,130,246,0.12)',
    },
    {
      label: isAr ? 'التخصص' : 'Specialty',
      value: specialty || (isAr ? 'عام' : 'General'),
      icon: Stethoscope,
      color: 'text-violet-400',
      bg: 'rgba(139,92,246,0.12)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: stat.bg }}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
            <p className="text-sm font-bold text-slate-200">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
