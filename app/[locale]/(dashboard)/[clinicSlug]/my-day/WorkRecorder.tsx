'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList, Plus, CheckCircle } from 'lucide-react'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  status: string
  patients?: { full_name: string }
  clinic_services?: { name?: string; price?: number }
}

export default function WorkRecorder({
  clinicId,
  clinicSlug: _clinicSlug,
  locale: _locale,
  isAr,
  staffMemberId: _staffMemberId,
  doctorProfileId: _doctorProfileId,
  appointments
}: {
  clinicId: string
  clinicSlug: string
  locale: string
  isAr: boolean
  staffMemberId: string
  doctorProfileId: string | null
  appointments: Appointment[]
}) {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const activeAppointments = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status))
  const selectedAppointment = activeAppointments.find(a => a.patient_id === selectedPatientId)

  const handleSaveNote = async () => {
    if (!selectedPatientId || !noteText.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/clinical/free-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          clinic_id: clinicId,
          title: isAr ? 'ملاحظة من الطبيب' : 'Doctor Note',
          content: noteText.trim()
        })
      })

      if (!res.ok) throw new Error('Failed')

      setSaved(true)
      setNoteText('')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error(isAr ? 'فشل في الحفظ' : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-cyan-400" />
        {isAr ? 'تسجيل العمل' : 'Work Recorder'}
      </h3>

      <div className="space-y-2 mb-3">
        <label className="text-[11px] text-slate-500 font-medium">{isAr ? 'المريض' : 'Patient'}</label>
        <select
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200"
        >
          <option value="">{isAr ? 'اختر مريض...' : 'Select patient...'}</option>
          {activeAppointments.map(app => (
            <option key={app.patient_id} value={app.patient_id}>
              {app.patients?.full_name || '—'}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 mb-3">
        <label className="text-[11px] text-slate-500 font-medium">{isAr ? 'الملاحظة' : 'Note'}</label>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder={isAr ? 'اكتب ملاحظات العلاج...' : 'Write treatment notes...'}
          rows={3}
          className="flex w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 resize-none"
        />
      </div>

      {selectedAppointment && (
        <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)' }}>
          <div className="space-y-1">
            <p className="text-xs text-slate-400">{isAr ? 'الخدمة' : 'Service'}: <span className="text-slate-200 font-medium">{selectedAppointment.clinic_services?.name || '—'}</span></p>
            <p className="text-xs text-slate-400">{isAr ? 'التكلفة' : 'Cost'}: <span className="text-teal-400 font-bold">{selectedAppointment.clinic_services?.price ? `${selectedAppointment.clinic_services.price} EGP` : '—'}</span></p>
          </div>
        </div>
      )}

      <button
        onClick={handleSaveNote}
        disabled={saving || !selectedPatientId || !noteText.trim()}
        className="w-full h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: saved ? 'rgba(34,197,94,0.2)' : 'rgba(34,211,238,0.15)',
          color: saved ? '#4ade80' : '#22d3ee',
          border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : 'rgba(34,211,238,0.25)'}`
        }}
      >
        {saved ? (
          <>
            <CheckCircle className="w-4 h-4" />
            {isAr ? 'تم الحفظ' : 'Saved!'}
          </>
        ) : saving ? (
          '...'
        ) : (
          <>
            <Plus className="w-4 h-4" />
            {isAr ? 'حفظ ملاحظة' : 'Save Note'}
          </>
        )}
      </button>
    </div>
  )
}
