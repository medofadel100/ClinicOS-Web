'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAppointment, getAvailableSlots, bookWalkIn } from './actions'
import { Search, UserPlus, X } from 'lucide-react'

type Doctor = { id: string; staff_members: { full_name: string } }
type Service = { id: string; name: string; duration_minutes: number; price: number }
type Patient = { id: string; full_name: string; phone?: string; date_of_birth?: string; gender?: string }

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
  const isAr = locale === 'ar'

  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Patient search
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [creatingPatient, setCreatingPatient] = useState(false)
  const patientInputRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (patientInputRef.current && !patientInputRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredPatients = patients.filter(p => {
    if (!patientSearch.trim()) return true
    const q = patientSearch.toLowerCase()
    return p.full_name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))
  })

  const handleCreatePatient = async () => {
    if (!newPatientName.trim()) return
    setCreatingPatient(true)
    try {
      const res = await fetch('/api/quick-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          full_name: newPatientName.trim(),
          phone: newPatientPhone.trim() || null
        })
      })
      if (!res.ok) throw new Error('Failed')
      const newPatient = await res.json()
      setSelectedPatient({ id: newPatient.id, full_name: newPatientName.trim(), phone: newPatientPhone.trim() || undefined })
      setPatientSearch(newPatientName.trim())
      setShowNewPatient(false)
      setNewPatientName('')
      setNewPatientPhone('')
      setShowPatientDropdown(false)
    } catch (err) {
      alert(isAr ? 'فشل في إنشاء المريض' : 'Failed to create patient')
    } finally {
      setCreatingPatient(false)
    }
  }

  useEffect(() => {
    async function fetchSlots() {
      if (selectedDoctor && selectedDoctor !== 'any' && selectedService && selectedDate) {
        setIsLoadingSlots(true)
        try {
          const service = services.find(s => s.id === selectedService)
          if (service) {
            const slots = await getAvailableSlots(clinicId, selectedDoctor, selectedDate, service.duration_minutes)
            setAvailableSlots(slots)
          }
        } catch (err) {
          console.error('Failed to load slots', err)
        } finally {
          setIsLoadingSlots(false)
        }
      } else {
        setAvailableSlots([])
      }
    }
    fetchSlots()
  }, [selectedDoctor, selectedService, selectedDate, clinicId, services])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    if (date && time) {
      const scheduledAt = new Date(`${date}T${time}`).toISOString()
      formData.set('scheduled_at', scheduledAt)
    }

    // If "any" doctor selected, find first available
    if (selectedDoctor === 'any') {
      const service = services.find(s => s.id === selectedService)
      if (service && date) {
        for (const doc of doctors) {
          try {
            const slots = await getAvailableSlots(clinicId, doc.id, date, service.duration_minutes)
            if (slots.length > 0) {
              formData.set('membership_id', doc.id)
              formData.set('time', slots[0])
              const newScheduledAt = new Date(`${date}T${slots[0]}`).toISOString()
              formData.set('scheduled_at', newScheduledAt)
              break
            }
          } catch { continue }
        }
      }
    }

    try {
      await createAppointment(clinicId, locale, formData)
      setOpen(false)
      // Reset
      setSelectedPatient(null)
      setPatientSearch('')
      setSelectedDoctor('')
      setSelectedService('')
      setSelectedDate('')
      setAvailableSlots([])
    } catch (err) {
      console.error(err)
      alert(isAr ? 'فشل في حجز الموعد' : 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleWalkIn = async () => {
    if (!selectedPatient || !selectedService) return
    setLoading(true)
    try {
      await bookWalkIn(clinicId, locale, selectedPatient.id, selectedService)
      setOpen(false)
      setSelectedPatient(null)
      setPatientSearch('')
      setSelectedDoctor('')
      setSelectedService('')
      setSelectedDate('')
      setAvailableSlots([])
    } catch (err) {
      console.error(err)
      alert(isAr ? 'فشل في الحجز' : 'Failed to book walk-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        setSelectedPatient(null)
        setPatientSearch('')
        setSelectedDoctor('')
        setSelectedService('')
        setSelectedDate('')
        setAvailableSlots([])
        setShowNewPatient(false)
      }
    }}>
      <DialogTrigger
        className="h-10 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-teal-500 text-white hover:bg-teal-600 shadow"
      >
        {isAr ? 'موعد جديد' : 'New Appointment'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isAr ? 'موعد جديد' : 'New Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2" ref={patientInputRef}>
            <Label>{isAr ? 'المريض' : 'Patient'}</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value)
                    setSelectedPatient(null)
                    setShowPatientDropdown(true)
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  placeholder={isAr ? 'ابحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
                  className="pl-9"
                  required={!selectedPatient}
                />
                {selectedPatient && (
                  <button
                    type="button"
                    onClick={() => { setSelectedPatient(null); setPatientSearch(''); setShowPatientDropdown(false) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input type="hidden" name="patient_id" value={selectedPatient?.id || ''} required />

              {showPatientDropdown && !selectedPatient && (
                <div className="absolute z-50 w-full mt-1 rounded-xl max-h-48 overflow-y-auto" style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {filteredPatients.length === 0 && !showNewPatient && (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      {isAr ? 'لا يوجد نتائج' : 'No results'}
                    </div>
                  )}
                  {filteredPatients.slice(0, 8).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p)
                        setPatientSearch(p.full_name)
                        setShowPatientDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="text-slate-200 font-medium">{p.full_name}</span>
                      {p.phone && <span className="text-slate-500 mr-2 text-xs">{p.phone}</span>}
                    </button>
                  ))}
                  {!showNewPatient ? (
                    <button
                      type="button"
                      onClick={() => setShowNewPatient(true)}
                      className="w-full text-left px-3 py-2.5 text-sm text-teal-400 hover:bg-white/[0.06] transition-colors flex items-center gap-2"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <UserPlus className="w-4 h-4" />
                      {isAr ? 'تسجيل مريض جديد' : 'Register New Patient'}
                    </button>
                  ) : (
                    <div className="p-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Input
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder={isAr ? 'اسم المريض' : 'Patient name'}
                        className="h-8 text-xs"
                        autoFocus
                      />
                      <Input
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                        placeholder={isAr ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-1">
                        <Button type="button" size="sm" className="h-7 text-xs flex-1" onClick={handleCreatePatient} disabled={creatingPatient || !newPatientName.trim()}>
                          {creatingPatient ? '...' : (isAr ? 'إنشاء' : 'Create')}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowNewPatient(false)}>
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Doctor */}
          <div className="space-y-2">
            <Label>{isAr ? 'الطبيب' : 'Doctor'}</Label>
            <select
              name="membership_id"
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{isAr ? 'اختر الطبيب...' : 'Select Doctor...'}</option>
              <option value="any">{isAr ? 'أي طبيب متاح' : 'Any Available Doctor'}</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.staff_members.full_name}</option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label>{isAr ? 'الخدمة' : 'Service'}</Label>
            <select
              name="service_id"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{isAr ? 'اختر الخدمة...' : 'Select Service...'}</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.price?.toLocaleString()} EGP ({s.duration_minutes} min)</option>
              ))}
            </select>
            {selectedService && services.find(s => s.id === selectedService) && (
              <p className="text-xs text-teal-400 font-medium">
                {isAr ? 'السعر: ' : 'Price: '}{services.find(s => s.id === selectedService)?.price?.toLocaleString()} EGP
              </p>
            )}
            <input type="hidden" name="duration_minutes" value={services.find(s => s.id === selectedService)?.duration_minutes || 30} />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? 'التاريخ' : 'Date'}</Label>
              <Input name="date" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? 'الوقت' : 'Time'}</Label>
              <select
                name="time"
                required
                disabled={!selectedDoctor || selectedDoctor === 'any' || !selectedService || !selectedDate || isLoadingSlots}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">{isLoadingSlots ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر الوقت...' : 'Select Time...')}</option>
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {selectedDoctor === 'any' && (
                <p className="text-[11px] text-slate-500">{isAr ? 'سيتم اختيار أول طبيب متاح تلقائياً' : 'First available doctor will be auto-assigned'}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedPatient}>
            {loading ? (isAr ? 'جاري الحجز...' : 'Booking...') : (isAr ? 'حجز' : 'Book')}
          </Button>
          {selectedPatient && selectedService && (
            <button
              type="button"
              onClick={handleWalkIn}
              disabled={loading}
              className="w-full h-10 rounded-md text-sm font-medium transition-colors bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25"
            >
              {isAr ? 'دخول فوري — بدون موعد' : 'Walk-in — See Doctor Now'}
            </button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
