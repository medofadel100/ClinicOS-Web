'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Waitlist</CardTitle>
        <AddWaitlistDialog 
          clinicId={clinicId} 
          locale={locale} 
          patients={patients} 
          doctors={doctors} 
        />
      </CardHeader>
      <CardContent>
        {waitlist.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">The waitlist is empty.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {waitlist.map(entry => (
              <div 
                key={entry.id} 
                className={`p-3 border rounded-md text-sm ${entry.status === 'notified' ? 'bg-primary/10 border-primary/20' : ''}`}
              >
                <div className="font-semibold flex justify-between">
                  <span>{entry.patients?.full_name}</span>
                  <span className={`capitalize ${entry.status === 'notified' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {entry.status}
                  </span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Target: {entry.desired_from} to {entry.desired_to}
                </div>
                {entry.clinic_staff_memberships && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Doctor: {entry.clinic_staff_memberships.staff_members?.full_name}
                  </div>
                )}
                {entry.status === 'notified' && (
                  <div className="text-xs text-primary mt-2">
                    A slot may have opened up matching this request!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
      {/* @ts-expect-error shadcn primitive issue */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Waitlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient</Label>
            <select id="patient_id" name="patient_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select Patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="membership_id">Preferred Doctor (Optional)</Label>
            <select id="membership_id" name="membership_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Any Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.staff_members.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desired_from">From Date</Label>
              <Input id="desired_from" name="desired_from" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired_to">To Date</Label>
              <Input id="desired_to" name="desired_to" type="date" required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add to Waitlist'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
