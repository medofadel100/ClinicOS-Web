'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createPatient } from './actions'

export default function AddPatientDialog({ clinicId, locale }: { clinicId: string, locale: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createPatient(clinicId, locale, formData)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to add patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: '#00d4aa', color: '#0a0f1e' }}
      >
        New Patient
      </DialogTrigger>
      <DialogContent className="bg-[#0a0f1e] border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="full_name">Full Name *</label>
            <input 
              id="full_name"
              name="full_name" 
              required
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="phone">Phone Number</label>
            <input 
              id="phone"
              name="phone" 
              type="tel"
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="gender">Gender</label>
              <select 
                id="gender"
                name="gender" 
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="date_of_birth">Date of Birth</label>
              <input 
                id="date_of_birth"
                name="date_of_birth" 
                type="date"
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="notes">Notes</label>
            <textarea 
              id="notes"
              name="notes" 
              className="w-full min-h-[80px] p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-y"
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#00d4aa', color: '#0a0f1e' }}
            >
              {loading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
