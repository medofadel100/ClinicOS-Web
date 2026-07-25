'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { recordVitals } from '../../actions'

export default function RecordVitalsDialog({
  clinicId,
  locale,
  patientId
}: {
  clinicId: string
  locale: string
  patientId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAr, setIsAr] = useState(false)

  useEffect(() => {
    setIsAr(document.documentElement.lang === 'ar')
  }, [])

  const [bp, setBp] = useState('')
  const [hr, setHr] = useState('')
  const [temp, setTemp] = useState('')
  const [weight, setWeight] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await recordVitals(clinicId, locale, patientId, {
        bp, hr, temp, weight
      })
      setOpen(false)
      setBp('')
      setHr('')
      setTemp('')
      setWeight('')
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل في تسجيل العلامات الحيوية' : 'Error recording vitals'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30">
          <Plus className="w-4 h-4 mr-2" />
          Record Vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0B1120] border-white/10 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Record Vitals</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter the latest vital signs for this patient.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Blood Pressure</label>
              <input
                type="text"
                placeholder="120/80"
                value={bp}
                onChange={e => setBp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="72"
                value={hr}
                onChange={e => setHr(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="37.0"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-rose-500 hover:bg-rose-600 text-white">
              {loading ? 'Saving...' : 'Save Vitals'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
