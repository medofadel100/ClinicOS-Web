'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { rescheduleAppointment } from './actions'

export default function RescheduleAppointmentDialog({
  appointmentId,
  clinicId,
  locale,
  initialDate,
  initialTime
}: {
  appointmentId: string
  clinicId: string
  locale: string
  initialDate: string
  initialTime: string
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
      await rescheduleAppointment(appointmentId, clinicId, locale, formData)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to reschedule appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error shadcn primitive issue */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Reschedule</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">New Date</Label>
              <Input id="date" name="date" type="date" defaultValue={initialDate} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">New Time</Label>
              <Input id="time" name="time" type="time" defaultValue={initialTime} required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Rescheduling...' : 'Confirm'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
