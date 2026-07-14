'use client'

import { useState } from 'react'
import { updateAppointmentStatus } from './actions'

export default function AppointmentStatusSelect({
  appointmentId,
  clinicId,
  locale,
  initialStatus
}: {
  appointmentId: string
  clinicId: string
  locale: string
  initialStatus: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setLoading(true)
    try {
      await updateAppointmentStatus(appointmentId, clinicId, locale, newStatus)
    } catch (err) {
      console.error(err)
      alert('Failed to update status')
      setStatus(initialStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select 
      value={status} 
      onChange={handleChange}
      disabled={loading}
      className={`h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ${
        status === 'cancelled' || status === 'no_show' ? 'text-destructive' :
        status === 'completed' ? 'text-green-600' :
        'text-foreground'
      }`}
    >
      <option value="scheduled">Scheduled</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
      <option value="no_show">No Show</option>
    </select>
  )
}
