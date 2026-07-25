'use client'

import React, { useMemo } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Clock } from 'lucide-react'

type Appointment = {
  id: string
  membership_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  patients?: { full_name: string }
  clinic_staff_memberships?: { staff_members?: { full_name: string } }
  clinic_services?: { name: string }
}

export default function CalendarView({
  targetDate,
  appointments,
  locale
}: {
  targetDate: string
  appointments: Appointment[]
  locale: string
}) {
  // Define working hours (e.g., 8 AM to 8 PM)
  const START_HOUR = 8
  const END_HOUR = 20
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
  const isAr = locale === 'ar'

  // Group appointments by doctor using membership_id (unique per doctor per clinic)
  const doctorsMap = new Map<string, { id: string, name: string, appointments: Appointment[] }>()
  
  appointments.forEach(app => {
    const docName = app.clinic_staff_memberships?.staff_members?.full_name || (isAr ? 'طبيب غير معروف' : 'Unknown Doctor')
    const docId = app.membership_id || 'unknown'
    if (!doctorsMap.has(docId)) {
      doctorsMap.set(docId, { id: docId, name: docName, appointments: [] })
    }
    doctorsMap.get(docId)?.appointments.push(app)
  })

  const doctors = Array.from(doctorsMap.values())

  if (doctors.length === 0) {
    return (
      <PremiumCard>
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Clock className="w-10 h-10 mb-4 opacity-20" />
          <p>{isAr ? 'لا توجد مواعيد مجدولة لهذا اليوم.' : 'No appointments booked for this day.'}</p>
        </div>
      </PremiumCard>
    )
  }

  // Calculate pixel positioning
  const HOUR_HEIGHT = 80 // pixels per hour
  
  const getTop = (dateString: string) => {
    const d = new Date(dateString)
    const h = d.getHours()
    const m = d.getMinutes()
    return ((h - START_HOUR) * HOUR_HEIGHT) + ((m / 60) * HOUR_HEIGHT)
  }

  const getHeight = (duration: number) => {
    return (duration / 60) * HOUR_HEIGHT
  }

  return (
    <PremiumCard className="overflow-x-auto relative shadow-2xl">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="flex border-b border-white/10 pb-4 mb-4">
          <div className="w-20 shrink-0 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAr ? 'الوقت' : 'Time'}
          </div>
          {doctors.map(doc => (
            <div key={doc.id} className="flex-1 text-center font-medium text-slate-200 truncate px-2">
              Dr. {doc.name.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex relative" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}>
          
          {/* Time Labels */}
          <div className="w-20 shrink-0 border-r border-white/5 relative h-full">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="absolute w-full text-right pr-4 text-[10px] font-medium text-slate-500 transform -translate-y-2"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className="flex-1 flex relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="w-full border-t border-white/5 absolute"
                  style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                />
              ))}
            </div>

            {/* Doctor Columns */}
            {doctors.map((doc, idx) => (
              <div 
                key={doc.id} 
                className={`flex-1 relative border-r border-white/[0.02] ${idx === doctors.length - 1 ? 'border-r-0' : ''}`}
              >
                {doc.appointments.map(app => {
                  const top = getTop(app.scheduled_at)
                  const height = getHeight(app.duration_minutes)
                  
                  // Avoid rendering before 8 AM or after 8 PM bounds
                  if (top < 0) return null
                  
                  return (
                    <div
                      key={app.id}
                      className="absolute inset-x-1.5 rounded-lg p-2 text-xs overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:z-10 cursor-pointer backdrop-blur-md"
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        backgroundColor: app.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 
                                       app.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : 
                                       'rgba(20, 184, 166, 0.15)',
                        borderLeft: `3px solid ${app.status === 'completed' ? '#10B981' : app.status === 'cancelled' ? '#EF4444' : '#14B8A6'}`,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <div className="font-semibold text-slate-100 truncate">
                        {app.patients?.full_name}
                      </div>
                      <div className="text-slate-400 truncate text-[9px] mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 inline" />
                        {app.clinic_services?.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}
