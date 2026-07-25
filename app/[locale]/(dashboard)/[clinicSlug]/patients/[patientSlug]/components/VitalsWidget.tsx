'use client'

import { PremiumCard } from '@/components/layout/PageComponents'
import { Activity, Heart, Thermometer, Weight } from 'lucide-react'
import RecordVitalsDialog from './RecordVitalsDialog'

export default function VitalsWidget({ 
  latestVitals,
  clinicId,
  locale,
  patientId
}: { 
  latestVitals: any
  clinicId: string
  locale: string
  patientId: string
}) {
  const content = latestVitals?.content || {}

  const renderVital = (icon: any, label: string, value: string, color: string) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${color}`}>
        {icon}
      </div>
      <div className="text-sm font-semibold text-slate-200">{value || '--'}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  )

  return (
    <PremiumCard className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-400" />
          Latest Vitals
        </h3>
        <RecordVitalsDialog clinicId={clinicId} locale={locale} patientId={patientId} />
      </div>

      {!latestVitals ? (
        <div className="flex items-center justify-center h-32 border border-dashed border-white/10 rounded-xl">
          <p className="text-sm text-slate-500">No vitals recorded recently</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {renderVital(<Heart className="w-4 h-4 text-rose-400" />, 'Blood Pressure', content.bp ? `${content.bp} mmHg` : '', 'bg-rose-500/10')}
          {renderVital(<Activity className="w-4 h-4 text-blue-400" />, 'Heart Rate', content.hr ? `${content.hr} bpm` : '', 'bg-blue-500/10')}
          {renderVital(<Thermometer className="w-4 h-4 text-amber-400" />, 'Temperature', content.temp ? `${content.temp} °C` : '', 'bg-amber-500/10')}
          {renderVital(<Weight className="w-4 h-4 text-emerald-400" />, 'Weight', content.weight ? `${content.weight} kg` : '', 'bg-emerald-500/10')}
        </div>
      )}
    </PremiumCard>
  )
}
