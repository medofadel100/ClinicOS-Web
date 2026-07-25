'use client'

import { useState } from 'react'
import { CheckCircle, Clock, User, Stethoscope, CreditCard, Banknote } from 'lucide-react'
import { confirmPayment } from './actions'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  status: string
  patients?: { full_name: string; phone?: string }
  clinic_staff_memberships?: { staff_members?: { full_name: string } }
  clinic_services?: { name?: string; price?: number }
}

export default function PaymentConfirmCard({
  appointment,
  clinicId,
  locale,
  isAr
}: {
  appointment: Appointment
  clinicId: string
  locale: string
  isAr: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [showOptions, setShowOptions] = useState(false)

  const time = new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const price = appointment.clinic_services?.price || 0

  const handleConfirm = async (method: string) => {
    setLoading(true)
    try {
      await confirmPayment(appointment.id, clinicId, appointment.patient_id, price, method)
      setConfirmed(true)
    } catch (err) {
      console.error(err)
      alert(isAr ? 'فشل في تأكيد الدفع' : 'Failed to confirm payment')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold text-green-400">{isAr ? 'تم تأكيد الدفع' : 'Payment Confirmed'}</p>
            <p className="text-xs text-slate-500">{appointment.patients?.full_name} — {price} EGP</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center min-w-[48px] py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <span className="text-xs font-bold text-slate-200">{time}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{appointment.patients?.full_name || '—'}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {appointment.clinic_services?.name || '—'} · {appointment.clinic_staff_memberships?.staff_members?.full_name || '—'}
            </p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-lg font-bold text-teal-400">{price.toLocaleString()} EGP</p>
        </div>
      </div>

      {!showOptions ? (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowOptions(true)}
            disabled={loading}
            className="flex-1 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <CheckCircle className="w-4 h-4" />
            {isAr ? 'تأكيد الدفع' : 'Confirm Payment'}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] text-slate-500 font-medium">{isAr ? 'طريقة الدفع' : 'Payment Method'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { value: 'cash', label: isAr ? 'نقداً' : 'Cash', icon: Banknote },
              { value: 'card', label: isAr ? 'بطاقة' : 'Card', icon: CreditCard },
              { value: 'bank_transfer', label: isAr ? 'تحويل بنكي' : 'Bank Transfer', icon: CreditCard },
              { value: 'other', label: isAr ? 'أخرى' : 'Other', icon: CreditCard },
            ].map(m => (
              <button
                key={m.value}
                onClick={() => handleConfirm(m.value)}
                disabled={loading}
                className={`flex items-center gap-2 h-9 rounded-lg text-xs font-medium transition-all ${
                  paymentMethod === m.value ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.06] border-white/[0.06]'
                } border`}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowOptions(false)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  )
}
