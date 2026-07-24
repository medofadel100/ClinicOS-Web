'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Button } from '@/components/ui/button'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { recordAttendance } from './actions'

export default function AttendanceTracker({
  clinicId,
  locale,
  todayRecord
}: {
  clinicId: string
  locale: string
  todayRecord?: {
    id: string
    check_in_at: string | null
    check_out_at: string | null
  }
}) {
  const [loading, setLoading] = useState(false)
  const isAr = locale === 'ar'

  const handleAction = async (action: 'check_in' | 'check_out') => {
    setLoading(true)
    try {
      await recordAttendance(clinicId, locale, action)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to record attendance')
    } finally {
      setLoading(false)
    }
  }

  const isCheckedIn = !!todayRecord?.check_in_at
  const isCheckedOut = !!todayRecord?.check_out_at

  return (
    <PremiumCard>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">{isAr ? 'حضور اليوم' : "Today's Attendance"}</h3>
            <p className="text-sm text-slate-400">
              {isCheckedOut ? (isAr ? 'تم إنهاء الوردية' : 'Shift completed') : isCheckedIn ? (isAr ? 'في الوردية حالياً' : 'Currently on shift') : (isAr ? 'لم يسجل دخول بعد' : 'Not checked in yet')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isCheckedIn ? (
            <Button 
              onClick={() => handleAction('check_in')} 
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isAr ? 'تسجيل دخول الآن' : 'Check In Now'}
            </Button>
          ) : !isCheckedOut ? (
            <Button 
              onClick={() => handleAction('check_out')} 
              disabled={loading}
              variant="outline"
              className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isAr ? 'تسجيل خروج' : 'Check Out'}
            </Button>
          ) : (
            <div className="text-sm font-medium text-slate-400 px-4 py-2 bg-white/5 rounded-md">
              {isAr ? 'تم' : 'Completed'}
            </div>
          )}
        </div>
      </div>
    </PremiumCard>
  )
}
