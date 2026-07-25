'use client'

import { PremiumCard } from '@/components/layout/PageComponents'
import { Calendar, Stethoscope, Wallet, Clock, CheckCircle } from 'lucide-react'

export interface TimelineEvent {
  id: string
  type: 'appointment' | 'clinical_note' | 'payment'
  date: string
  title: string
  subtitle?: string
  status?: string
}

export default function PatientTimeline({ events }: { events: TimelineEvent[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4 text-blue-400" />
      case 'clinical_note': return <Stethoscope className="w-4 h-4 text-orange-400" />
      case 'payment': return <Wallet className="w-4 h-4 text-green-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500/20 border-blue-500/30'
      case 'clinical_note': return 'bg-orange-500/20 border-orange-500/30'
      case 'payment': return 'bg-green-500/20 border-green-500/30'
      default: return 'bg-slate-500/20 border-slate-500/30'
    }
  }

  return (
    <PremiumCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" />
        Patient Timeline
      </h3>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm text-slate-500">No events recorded yet</p>
        </div>
      ) : (
        <div className="relative border-l border-white/10 ml-4 space-y-6">
          {events.map((evt, _idx) => (
            <div key={evt.id} className="relative pl-6">
              <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border flex items-center justify-center ${getIconBg(evt.type)}`}>
                {getIcon(evt.type)}
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-200">{evt.title}</h4>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(evt.date).toLocaleDateString()}
                  </span>
                </div>
                {evt.subtitle && <p className="text-sm text-slate-400">{evt.subtitle}</p>}
                {evt.status && (
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                    {evt.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  )
}
