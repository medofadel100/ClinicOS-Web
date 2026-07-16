'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { updateToothCondition } from './actions'

type ToothCondition = 'normal' | 'cavity' | 'extracted' | 'root_canal' | 'crown' | 'implant'

type DentalChartEntry = {
  tooth_number: number
  condition: ToothCondition
}

export default function DentalChart({
  clinicId,
  locale,
  patientId,
  initialEntries
}: {
  clinicId: string
  locale: string
  patientId: string
  initialEntries: DentalChartEntry[]
}) {
  const [entries, setEntries] = useState<Record<number, ToothCondition>>(() => {
    const map: Record<number, ToothCondition> = {}
    initialEntries.forEach(e => {
      map[e.tooth_number] = e.condition
    })
    return map
  })
  const [loading, setLoading] = useState(false)

  const quadrants = {
    topRight: [18, 17, 16, 15, 14, 13, 12, 11],
    topLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    bottomRight: [48, 47, 46, 45, 44, 43, 42, 41],
    bottomLeft: [31, 32, 33, 34, 35, 36, 37, 38]
  }

  const handleConditionChange = async (toothNumber: number, newCondition: ToothCondition) => {
    setEntries(prev => ({ ...prev, [toothNumber]: newCondition }))
    setLoading(true)

    try {
      await updateToothCondition(clinicId, locale, patientId, toothNumber, newCondition)
    } catch (err) {
      console.error(err)
      alert('Failed to update tooth condition')
    } finally {
      setLoading(false)
    }
  }

  const getConditionColor = (condition?: ToothCondition) => {
    switch(condition) {
      case 'cavity': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'extracted': return 'bg-slate-800/50 text-slate-500 border-slate-700 line-through'
      case 'root_canal': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'crown': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'implant': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default: return 'bg-white/5 text-slate-300 border-white/10'
    }
  }

  const renderTooth = (toothNumber: number) => {
    const condition = entries[toothNumber] || 'normal'
    const colorClass = getConditionColor(condition)

    return (
      <div key={toothNumber} className="flex flex-col items-center gap-2">
        <div className={`w-10 h-12 flex items-center justify-center font-bold rounded-t-xl border-2 transition-colors ${colorClass}`}>
          {toothNumber}
        </div>
        <select 
          value={condition} 
          onChange={(e) => handleConditionChange(toothNumber, e.target.value as ToothCondition)}
          disabled={loading}
          className="text-[10px] sm:text-xs max-w-full w-[60px] sm:w-20 border rounded p-1 bg-black/40 text-slate-300 border-white/10 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 appearance-none text-center cursor-pointer"
        >
          <option value="normal">Normal</option>
          <option value="cavity">Cavity</option>
          <option value="extracted">Extract</option>
          <option value="root_canal">Root C.</option>
          <option value="crown">Crown</option>
          <option value="implant">Implant</option>
        </select>
      </div>
    )
  }

  return (
    <PremiumCard>
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">Dental Chart</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track patient's dental health and treatments.</p>
      </div>
      
      <div className="flex flex-col gap-10 items-center bg-black/20 p-4 sm:p-8 rounded-xl border border-white/5 overflow-x-auto min-w-full">
        
        {/* Upper Jaw */}
        <div className="flex flex-col items-center gap-4 min-w-max">
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">Upper Jaw</div>
          <div className="flex gap-2 sm:gap-4 border-b-4 border-slate-700 pb-6">
            <div className="flex gap-1 sm:gap-2 border-r-4 border-slate-700 pr-2 sm:pr-4">
              {quadrants.topRight.map(renderTooth)}
            </div>
            <div className="flex gap-1 sm:gap-2 pl-2 sm:pl-4">
              {quadrants.topLeft.map(renderTooth)}
            </div>
          </div>
        </div>

        {/* Lower Jaw */}
        <div className="flex flex-col items-center gap-4 min-w-max">
          <div className="flex gap-2 sm:gap-4 pt-6">
            <div className="flex gap-1 sm:gap-2 border-r-4 border-slate-700 pr-2 sm:pr-4">
              {quadrants.bottomRight.map(renderTooth)}
            </div>
            <div className="flex gap-1 sm:gap-2 pl-2 sm:pl-4">
              {quadrants.bottomLeft.map(renderTooth)}
            </div>
          </div>
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mt-2">Lower Jaw</div>
        </div>

      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/5 text-sm">
        <div className="flex items-center gap-2 text-slate-300"><div className="w-4 h-4 bg-white/5 border border-white/10 rounded"></div> Normal</div>
        <div className="flex items-center gap-2 text-red-400"><div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div> Cavity</div>
        <div className="flex items-center gap-2 text-slate-500"><div className="w-4 h-4 bg-slate-800/50 border border-slate-700 rounded"></div> Extracted</div>
        <div className="flex items-center gap-2 text-purple-400"><div className="w-4 h-4 bg-purple-500/20 border border-purple-500/50 rounded"></div> Root Canal</div>
        <div className="flex items-center gap-2 text-yellow-400"><div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded"></div> Crown</div>
        <div className="flex items-center gap-2 text-blue-400"><div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div> Implant</div>
      </div>
    </PremiumCard>
  )
}
