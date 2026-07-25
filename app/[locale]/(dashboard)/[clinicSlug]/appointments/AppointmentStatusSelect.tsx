'use client'

import { useState } from 'react'
import { toast } from 'sonner'
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
  const isAr = locale === 'ar'

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setLoading(true)
    try {
      await updateAppointmentStatus(appointmentId, clinicId, locale, newStatus)
    } catch {
      toast.error(isAr ? 'فشل في تحديث الحالة' : 'Failed to update status')
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
      <option value="scheduled">{isAr ? 'مجدول' : 'Scheduled'}</option>
      <option value="confirmed">{isAr ? 'مؤكد' : 'Confirmed'}</option>
      <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
      <option value="needs_payment">{isAr ? 'بانتظار الدفع' : 'Needs Payment'}</option>
      <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
      <option value="no_show">{isAr ? 'لم يحضر' : 'No Show'}</option>
    </select>
  )
}
