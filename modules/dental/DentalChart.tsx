'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    // Optimistic UI update
    setEntries(prev => ({ ...prev, [toothNumber]: newCondition }))
    setLoading(true)

    try {
      await updateToothCondition(clinicId, locale, patientId, toothNumber, newCondition)
    } catch (err) {
      console.error(err)
      alert('Failed to update tooth condition')
      // Rollback would be implemented here ideally by re-fetching or tracking previous state
    } finally {
      setLoading(false)
    }
  }

  const getConditionColor = (condition?: ToothCondition) => {
    switch(condition) {
      case 'cavity': return 'bg-red-500 text-white'
      case 'extracted': return 'bg-gray-800 text-white line-through'
      case 'root_canal': return 'bg-purple-500 text-white'
      case 'crown': return 'bg-yellow-500 text-white'
      case 'implant': return 'bg-blue-500 text-white'
      default: return 'bg-white text-slate-900 border-slate-200'
    }
  }

  const renderTooth = (toothNumber: number) => {
    const condition = entries[toothNumber] || 'normal'
    const colorClass = getConditionColor(condition)

    return (
      <div key={toothNumber} className="flex flex-col items-center gap-2">
        <div className={`w-10 h-12 flex items-center justify-center font-bold rounded-t-lg border-2 ${colorClass}`}>
          {toothNumber}
        </div>
        <select 
          value={condition} 
          onChange={(e) => handleConditionChange(toothNumber, e.target.value as ToothCondition)}
          disabled={loading}
          className="text-xs max-w-full w-20 border rounded p-1 bg-background text-foreground"
        >
          <option value="normal">Normal</option>
          <option value="cavity">Cavity</option>
          <option value="extracted">Extracted</option>
          <option value="root_canal">Root Canal</option>
          <option value="crown">Crown</option>
          <option value="implant">Implant</option>
        </select>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dental Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 items-center bg-slate-50 p-6 rounded-lg overflow-x-auto">
          
          {/* Upper Jaw */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-slate-500 uppercase">Upper Jaw</div>
            <div className="flex gap-4 border-b-4 border-slate-300 pb-4">
              <div className="flex gap-1 border-r-4 border-slate-300 pr-4">
                {quadrants.topRight.map(renderTooth)}
              </div>
              <div className="flex gap-1 pl-4">
                {quadrants.topLeft.map(renderTooth)}
              </div>
            </div>
          </div>

          {/* Lower Jaw */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-4 pt-4">
              <div className="flex gap-1 border-r-4 border-slate-300 pr-4">
                {quadrants.bottomRight.map(renderTooth)}
              </div>
              <div className="flex gap-1 pl-4">
                {quadrants.bottomLeft.map(renderTooth)}
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase mt-2">Lower Jaw</div>
          </div>

        </div>
        <div className="flex flex-wrap gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-slate-200"></div> Normal</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500"></div> Cavity</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800"></div> Extracted</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-500"></div> Root Canal</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500"></div> Crown</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500"></div> Implant</div>
        </div>
      </CardContent>
    </Card>
  )
}
