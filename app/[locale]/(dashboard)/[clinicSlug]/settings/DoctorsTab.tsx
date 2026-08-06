'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { upsertDoctorProfile, upsertWorkingHours, getDoctorWorkingHours } from './actions'

interface StaffMember {
  id: string;
  full_name: string;
}

interface DoctorProfile {
  id: string;
  specialty: string;
  bio: string;
  staff_members?: StaffMember | null;
}

const DAYS = [
  { value: 0, ar: 'الأحد', en: 'Sunday' },
  { value: 1, ar: 'الاثنين', en: 'Monday' },
  { value: 2, ar: 'الثلاثاء', en: 'Tuesday' },
  { value: 3, ar: 'الأربعاء', en: 'Wednesday' },
  { value: 4, ar: 'الخميس', en: 'Thursday' },
  { value: 5, ar: 'الجمعة', en: 'Friday' },
  { value: 6, ar: 'السبت', en: 'Saturday' },
]

type WorkingHourRow = {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export default function DoctorsTab({ clinicId, initialData, availableStaff }: { clinicId: string, initialData: DoctorProfile[], availableStaff: StaffMember[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAr, setIsAr] = useState(false)

  // Working hours editor state
  const [hoursDoctor, setHoursDoctor] = useState<DoctorProfile | null>(null)
  const [hoursOpen, setHoursOpen] = useState(false)
  const [hoursLoading, setHoursLoading] = useState(false)
  const [hours, setHours] = useState<WorkingHourRow[]>(DAYS.map(d => ({
    day_of_week: d.value,
    start_time: '09:00',
    end_time: '17:00',
    is_active: false,
  })))

  // Edit doctor profile state
  const [editDoctor, setEditDoctor] = useState<DoctorProfile | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    setIsAr(document.documentElement.lang === 'ar')
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await upsertDoctorProfile(clinicId, formData)
      setOpen(false)
      toast.success(isAr ? 'تم حفظ بيانات الطبيب' : 'Doctor profile saved.')
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل حفظ بيانات الطبيب' : 'Failed to save doctor profile'))
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEditLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await upsertDoctorProfile(clinicId, formData)
      setEditOpen(false)
      toast.success(isAr ? 'تم تحديث بيانات الطبيب' : 'Doctor profile updated.')
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل تحديث بيانات الطبيب' : 'Failed to update doctor profile'))
    } finally {
      setEditLoading(false)
    }
  }

  const openHours = async (doc: DoctorProfile) => {
    setHoursDoctor(doc)
    setHoursOpen(true)
    setHoursLoading(true)
    try {
      const existing = await getDoctorWorkingHours(clinicId, doc.id)
      setHours(DAYS.map(d => {
        const found = existing.find(h => h.day_of_week === d.value)
        return found
          ? { day_of_week: d.value, start_time: String(found.start_time).slice(0, 5), end_time: String(found.end_time).slice(0, 5), is_active: found.is_active }
          : { day_of_week: d.value, start_time: '09:00', end_time: '17:00', is_active: false }
      }))
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل تحميل ساعات العمل' : 'Failed to load working hours.'))
    } finally {
      setHoursLoading(false)
    }
  }

  const updateHour = (day: number, patch: Partial<WorkingHourRow>) => {
    setHours(prev => prev.map(h => h.day_of_week === day ? { ...h, ...patch } : h))
  }

  const saveHours = async () => {
    if (!hoursDoctor) return
    setHoursLoading(true)
    try {
      await upsertWorkingHours(clinicId, hoursDoctor.id, hours)
      toast.success(isAr ? 'تم حفظ ساعات العمل — يستخدمها بوت واتساب لحجز المواعيد.' : 'Working hours saved — the WhatsApp bot uses these for bookings.')
      setHoursOpen(false)
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل حفظ ساعات العمل' : 'Failed to save working hours.'))
    } finally {
      setHoursLoading(false)
    }
  }

  const activeDayCount = hours.filter(h => h.is_active).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{isAr ? 'الأطباء' : 'Doctors'}</CardTitle>
          <CardDescription>{isAr ? 'إدارة الأطباء وساعات عملهم في العيادة. تُستخدم الساعات في حجز المواعيد وبوت واتساب.' : 'Manage doctors and their working hours. Hours are used for appointment booking and the WhatsApp bot.'}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>{isAr ? 'إضافة طبيب' : 'Add Doctor'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isAr ? 'إضافة بروفايل طبيب' : 'Add Doctor Profile'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff_member_id">{isAr ? 'الموظف' : 'Staff Member'}</Label>
                <select id="staff_member_id" name="staff_member_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                  <option value="">{isAr ? 'اختر موظفاً' : 'Select a staff member'}</option>
                  {availableStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">{isAr ? 'التخصص' : 'Specialty'}</Label>
                <Input id="specialty" name="specialty" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">{isAr ? 'نبذة' : 'Bio'}</Label>
                <Input id="bio" name="bio" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                {loading ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save Profile')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {initialData.length === 0 ? (
          <p className="text-sm text-muted-foreground">{isAr ? 'لم تُضف أي أطباء بعد.' : 'No doctors added yet.'}</p>
        ) : (
          <div className="space-y-4">
            {initialData.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{doc.staff_members?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditDoctor(doc); setEditOpen(true) }}>
                    {isAr ? 'تعديل' : 'Edit'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openHours(doc)}>
                    {isAr ? 'ساعات العمل' : 'Working Hours'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit doctor profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'تعديل بيانات الطبيب' : 'Edit Doctor Profile'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <input type="hidden" name="id" value={editDoctor?.id || ''} />
            <div className="space-y-2">
              <Label htmlFor="edit-specialty">{isAr ? 'التخصص' : 'Specialty'}</Label>
              <Input id="edit-specialty" name="specialty" defaultValue={editDoctor?.specialty || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">{isAr ? 'نبذة' : 'Bio'}</Label>
              <Input id="edit-bio" name="bio" defaultValue={editDoctor?.bio || ''} />
            </div>
            <Button type="submit" className="w-full" disabled={editLoading}>
              {editLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              {editLoading ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Working hours dialog */}
      <Dialog open={hoursOpen} onOpenChange={setHoursOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {isAr ? 'ساعات العمل' : 'Working Hours'} — {hoursDoctor?.staff_members?.full_name || ''}
            </DialogTitle>
          </DialogHeader>
          {hoursLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS.map(d => {
                const row = hours.find(h => h.day_of_week === d.value)!
                return (
                  <div key={d.value} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={row.is_active}
                      onChange={(e) => updateHour(d.value, { is_active: e.target.checked })}
                      className="w-4 h-4 accent-teal-500"
                    />
                    <span className="text-sm text-muted-foreground w-24">{isAr ? d.ar : d.en}</span>
                    <Input
                      type="time"
                      value={row.start_time}
                      disabled={!row.is_active}
                      onChange={(e) => updateHour(d.value, { start_time: e.target.value })}
                      className="h-9"
                    />
                    <span className="text-slate-500">–</span>
                    <Input
                      type="time"
                      value={row.end_time}
                      disabled={!row.is_active}
                      onChange={(e) => updateHour(d.value, { end_time: e.target.value })}
                      className="h-9"
                    />
                  </div>
                )
              })}
              <p className="text-xs text-muted-foreground pt-2">
                {isAr
                  ? `${activeDayCount} يوم نشط. البوت يستخدم هذه الساعات لعرض المواعيد المتاحة.`
                  : `${activeDayCount} active day(s). The bot uses these hours to show available slots.`}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setHoursOpen(false)} disabled={hoursLoading}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={saveHours} disabled={hoursLoading}>
                  {hoursLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                  {isAr ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
