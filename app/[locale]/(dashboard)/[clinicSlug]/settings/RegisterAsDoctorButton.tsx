'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { registerOwnerAsDoctor } from './actions'
import { UserCog } from 'lucide-react'

export default function RegisterAsDoctorButton({
  clinicId,
  locale,
  isAlreadyDoctor
}: {
  clinicId: string
  locale: string
  isAlreadyDoctor: boolean
}) {
  const [loading, setLoading] = useState(false)
  const isAr = locale === 'ar'

  const handleRegister = async () => {
    const msg = isAr
      ? 'هل تريد تسجيل نفسك كطبيب في العيادة؟'
      : 'Register yourself as a doctor in this clinic?'
    if (!confirm(msg)) return

    setLoading(true)
    try {
      await registerOwnerAsDoctor(clinicId, locale)
      window.location.reload()
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل في التسجيل' : 'Failed to register'))
    } finally {
      setLoading(false)
    }
  }

  if (isAlreadyDoctor) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
        <UserCog className="w-3 h-3" />
        {isAr ? 'أنت مسجل كطبيب ✓' : 'Registered as Doctor ✓'}
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegister}
      disabled={loading}
      className="text-xs h-7"
    >
      <UserCog className="w-3 h-3 mr-1" />
      {loading
        ? (isAr ? 'جاري التسجيل...' : 'Registering...')
        : (isAr ? 'تسجيل كطبيب' : 'Register as Doctor')}
    </Button>
  )
}
