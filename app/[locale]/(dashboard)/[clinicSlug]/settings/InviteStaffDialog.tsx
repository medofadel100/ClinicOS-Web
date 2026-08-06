'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { generateStaffInvite, addStaffMemberDirectly } from './actions'
import { Copy, CheckCircle2, Link, UserPlus } from 'lucide-react'

type Mode = 'invite' | 'direct' | null

export default function InviteStaffDialog({ clinicId, locale = 'en' }: { clinicId: string, locale?: string }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>(null)
  const [role, setRole] = useState('doctor')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState(false)
  const isAr = locale === 'ar'

  // Direct add form state
  const [directName, setDirectName] = useState('')
  const [directPhone, setDirectPhone] = useState('')

  const t = {
    inviteTeam: isAr ? 'إضافة عضو فريق' : 'Add Team Member',
    inviteDesc: isAr ? 'اختر طريقة الإضافة حسب نوع العضو.' : 'Choose how to add this team member.',
    selectMode: isAr ? 'اختر الطريقة' : 'Choose Method',
    modeInvite: isAr ? 'دعوة عبر رابط' : 'Invite via Link',
    modeInviteDesc: isAr ? 'يرسل له رابط يسجّل بنفسه ويدخل السيستم' : 'Send them a link to create their own account',
    modeDirect: isAr ? 'إضافة مباشرة' : 'Add Directly',
    modeDirectDesc: isAr ? 'إضافة عضو بدون حساب دخول (طبيب، استقبال، إلخ)' : 'Add staff without a login account (doctor, reception, etc.)',
    role: isAr ? 'الدور' : 'Role',
    doctor: isAr ? 'طبيب' : 'Doctor',
    nurse: isAr ? 'ممرض/ة' : 'Nurse',
    reception: isAr ? 'استقبال' : 'Reception',
    accountant: isAr ? 'محاسب' : 'Accountant',
    cleaner: isAr ? 'نضافه' : 'Cleaning',
    cafeteria: isAr ? 'بوفيه' : 'Cafeteria',
    other: isAr ? 'أخرى' : 'Other',
    fullName: isAr ? 'الاسم الكامل' : 'Full Name',
    phone: isAr ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)',
    generating: isAr ? 'جاري الإنشاء...' : 'Generating...',
    generateLink: isAr ? 'إنشاء رابط الدعوة' : 'Generate Invite Link',
    adding: isAr ? 'جاري الإضافة...' : 'Adding...',
    addDirect: isAr ? 'إضافة العضو' : 'Add Member',
    invitationLink: isAr ? 'رابط الدعوة' : 'Invitation Link',
    shareLink: isAr ? 'شارك هذا الرابط مع عضو الفريق. ينتهي صلاحيته بعد 7 أيام.' : 'Share this link with the staff member. It will expire in 7 days.',
    successMsg: isAr ? 'تمت الإضافة بنجاح!' : 'Member added successfully!',
    close: isAr ? 'إغلاق' : 'Close',
    back: isAr ? 'رجوع' : 'Back',
  }

  const handleGenerateLink = async () => {
    setLoading(true)
    try {
      const token = await generateStaffInvite(clinicId, role)
      const lang = window.location.pathname.split('/')[1] || 'en'
      const link = `${window.location.origin}/${lang}/invite/${token}`
      setInviteLink(link)
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'حدث خطأ أثناء إنشاء الرابط' : 'Failed to generate invite link'))
    } finally {
      setLoading(false)
    }
  }

  const handleDirectAdd = async () => {
    if (!directName.trim()) return
    setLoading(true)
    try {
      await addStaffMemberDirectly(clinicId, locale, directName.trim(), role, directPhone.trim() || undefined)
      setSuccess(true)
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل في الإضافة' : 'Failed to add member'))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setMode(null)
      setRole('doctor')
      setInviteLink(null)
      setCopied(false)
      setSuccess(false)
      setDirectName('')
      setDirectPhone('')
    }, 200)
  }

  const isPayrollRole = role === 'other'

  return (
    <Dialog open={open} onOpenChange={(val) => val ? setOpen(val) : handleClose()}>
      <DialogTrigger asChild>
        <Button>{t.inviteTeam}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t.inviteTeam}</DialogTitle>
          <DialogDescription>{t.inviteDesc}</DialogDescription>
        </DialogHeader>

        {/* Step 0: Choose mode */}
        {!mode && !success && (
          <div className="space-y-3 py-4">
            <button
              onClick={() => setMode('invite')}
              className="w-full text-left p-4 rounded-xl transition-all hover:bg-white/[0.05]"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
                  <Link className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{t.modeInvite}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.modeInviteDesc}</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setMode('direct')}
              className="w-full text-left p-4 rounded-xl transition-all hover:bg-white/[0.05]"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
                  <UserPlus className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{t.modeDirect}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.modeDirectDesc}</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 1a: Invite via link */}
        {mode === 'invite' && !inviteLink && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.role}</Label>
              <Select value={role} onValueChange={(val) => setRole(val || '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">{t.doctor}</SelectItem>
                  <SelectItem value="nurse">{t.nurse}</SelectItem>
                  <SelectItem value="reception">{t.reception}</SelectItem>
                  <SelectItem value="accountant">{t.accountant}</SelectItem>
                  <SelectItem value="other">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode(null)}>{t.back}</Button>
              <Button className="flex-1" onClick={handleGenerateLink} disabled={loading}>
                {loading ? t.generating : t.generateLink}
              </Button>
            </div>
          </div>
        )}

        {/* Step 1a result: Link generated */}
        {mode === 'invite' && inviteLink && (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <Label className="text-blue-300">{t.invitationLink}</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                <Button variant="secondary" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">{t.shareLink}</p>
            </div>
            <Button className="w-full" variant="outline" onClick={handleClose}>{t.close}</Button>
          </div>
        )}

        {/* Step 1b: Add directly (payroll only) */}
        {mode === 'direct' && !success && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.role}</Label>
              <Select value={role} onValueChange={(val) => setRole(val || '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">{t.doctor}</SelectItem>
                  <SelectItem value="nurse">{t.nurse}</SelectItem>
                  <SelectItem value="reception">{t.reception}</SelectItem>
                  <SelectItem value="accountant">{t.accountant}</SelectItem>
                  <SelectItem value="other">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.fullName}</Label>
              <Input
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input
                value={directPhone}
                onChange={(e) => setDirectPhone(e.target.value)}
                placeholder={isAr ? '01012345678' : '01012345678'}
              />
            </div>
            {isPayrollRole && (
              <p className="text-xs text-amber-400/80 bg-amber-400/5 rounded-lg px-3 py-2 border border-amber-400/10">
                {isAr
                  ? 'العضو هيتظهر في قائمة الموظفين والمرتبات بس، مش هيله السيستم.'
                  : 'This member will appear in staff/payroll lists only. They won\'t have system access.'}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode(null)}>{t.back}</Button>
              <Button className="flex-1" onClick={handleDirectAdd} disabled={loading || !directName.trim()}>
                {loading ? t.adding : t.addDirect}
              </Button>
            </div>
          </div>
        )}

        {/* Step 1b result: Success */}
        {mode === 'direct' && success && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">{t.successMsg}</p>
            </div>
            <Button className="w-full" variant="outline" onClick={handleClose}>{t.close}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
