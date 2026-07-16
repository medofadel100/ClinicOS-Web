'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { addToWaitlist } from './actions'

type WaitlistEntry = {
  id: string
  status: string
  desired_from: string
  desired_to: string
  patients?: { full_name: string }
  clinic_staff_memberships?: { staff_members?: { full_name: string } }
}

type Patient = { id: string; full_name: string }
type Doctor = { id: string; staff_members: { full_name: string } }

export default function WaitlistManagement({
  clinicId,
  locale,
  waitlist,
  patients,
  doctors
}: {
  clinicId: string
  locale: string
  waitlist: WaitlistEntry[]
  patients: Patient[]
  doctors: Doctor[]
}) {
  return (
    <PremiumCard>
      <div className="flex flex-row items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-200">Waitlist</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage patients waiting for cancellations.</p>
        </div>
        <AddWaitlistDialog 
          clinicId={clinicId} 
          locale={locale} 
          patients={patients} 
          doctors={doctors} 
        />
      </div>
      <div>
        {waitlist.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4 text-center">The waitlist is empty.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {waitlist.map(entry => (
              <div 
                key={entry.id} 
                className={`p-4 rounded-xl ${entry.status === 'notified' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-white/[0.02] border-white/[0.05] text-slate-300'}`}
                style={{ borderStyle: 'solid', borderWidth: '1px' }}
              >
                <div className="font-semibold flex justify-between">
                  <span className="text-slate-200">{entry.patients?.full_name}</span>
                  <span className={`capitalize text-xs px-2 py-1 rounded-full ${entry.status === 'notified' ? 'bg-teal-500/20' : 'bg-slate-500/20'}`}>
                    {entry.status}
                  </span>
                </div>
                <div className="text-slate-400 mt-2 text-sm">
                  Target: {entry.desired_from} to {entry.desired_to}
                </div>
                {entry.clinic_staff_memberships && (
                  <div className="text-xs text-slate-500 mt-1">
                    Doctor: {entry.clinic_staff_memberships.staff_members?.full_name}
                  </div>
                )}
                {entry.status === 'notified' && (
                  <div className="text-xs text-teal-400 mt-2">
                    A slot may have opened up matching this request!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}

function AddWaitlistDialog({ clinicId, locale, patients, doctors }: { clinicId: string, locale: string, patients: Patient[], doctors: Doctor[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await addToWaitlist(clinicId, locale, formData)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to add to waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        Add Entry
      </DialogTrigger>
      <DialogContent className="bg-[#0a0f1e] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Add to Waitlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="patient_id">Patient</label>
            <select id="patient_id" name="patient_id" required className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all">
              <option value="">Select Patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="membership_id">Preferred Doctor (Optional)</label>
            <select id="membership_id" name="membership_id" className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all">
              <option value="">Any Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.staff_members.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="desired_from">From Date</label>
              <input className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all" id="desired_from" name="desired_from" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="desired_to">To Date</label>
              <input className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all" id="desired_to" name="desired_to" type="date" required />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#00d4aa', color: '#0a0f1e' }}
            >
              {loading ? 'Adding...' : 'Add to Waitlist'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
