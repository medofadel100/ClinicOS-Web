'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAppointment } from './actions'

type Doctor = { id: string; staff_members: { full_name: string } }
type Service = { id: string; name: string; duration_minutes: number }
type Patient = { id: string; full_name: string }

export default function BookAppointmentDialog({
  clinicId,
  locale,
  doctors,
  services,
  patients
}: {
  clinicId: string
  locale: string
  doctors: Doctor[]
  services: Service[]
  patients: Patient[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // Combine date and time to ISO string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    if (date && time) {
      const scheduledAt = new Date(`${date}T${time}`).toISOString()
      formData.set('scheduled_at', scheduledAt)
    }

    try {
      await createAppointment(clinicId, locale, formData)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="h-10 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-teal-500 text-white hover:bg-teal-600 shadow"
      >
        Book Appointment
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient</Label>
            <select id="patient_id" name="patient_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select Patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="membership_id">Doctor</Label>
            <select id="membership_id" name="membership_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select Doctor...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.staff_members.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_id">Service</Label>
            <select id="service_id" name="service_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select Service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" type="time" required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Booking...' : 'Book'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
