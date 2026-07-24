'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { updateStaffEmail } from './actions'
import { Mail, ShieldCheck } from 'lucide-react'

export default function UpdateEmailDialog({ 
  currentEmail,
  emailChangedAt,
  locale = 'en'
}: { 
  currentEmail: string | null;
  emailChangedAt: string | null;
  locale?: string;
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isLocked = !!emailChangedAt
  const isAr = locale === 'ar'

  const t = {
    primaryEmail: isAr ? 'البريد الإلكتروني الأساسي' : 'Primary Email Address',
    noEmail: isAr ? 'لا يوجد بريد مُرفق.' : 'No email attached.',
    verifiedLocked: isAr ? 'تم التأكيد والقفل. لا يمكن تغيير البريد مرة أخرى.' : 'Verified & Locked. Your email cannot be changed again.',
    changeEmail: isAr ? 'تغيير البريد' : 'Change Email',
    updateTitle: isAr ? 'تحديث البريد الإلكتروني' : 'Update Email Address',
    checkInbox: isAr ? 'تحقق من بريدك' : 'Check Your Inbox',
    checkInboxDesc: isAr ? 'أرسلنا رابط تأكيد إلى بريدك الجديد. سيصبح التغيير دائمًا بعد التأكيد.' : "We've sent a confirmation link to your new email. Once verified, this change will be permanent.",
    important: isAr ? 'مهم:' : 'Important:',
    importantDesc: isAr ? 'يمكنك تغيير بريدك الإلكتروني الأساسي مرة واحدة فقط. تأكد من وصولك للصندوق الجديد.' : 'You can only change your primary email address <b>once</b>. Make sure you have access to the new inbox.',
    newEmail: isAr ? 'البريد الإلكتروني الجديد' : 'New Email Address',
    updating: isAr ? 'جاري التحديث...' : 'Updating...',
    updateLock: isAr ? 'تحديث وقفل البريد' : 'Update & Lock Email',
    differentEmail: isAr ? 'يجب أن يكون البريد الجديد مختلفًا عن الحالي.' : 'New email must be different from current email.',
    failedUpdate: isAr ? 'فشل في تحديث البريد. تأكد من عدم استخدامه مسبقًا.' : 'Failed to update email. Ensure it is not already in use.',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const newEmail = formData.get('email') as string

    if (newEmail === currentEmail) {
      setError(t.differentEmail)
      setLoading(false)
      return
    }

    try {
      await updateStaffEmail(newEmail)
      setSuccess(true)
      setTimeout(() => setOpen(false), 3000)
    } catch (err: any) {
      setError(err.message || t.failedUpdate)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-200">{t.primaryEmail}</h3>
          {isLocked && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
        </div>
        <p className="text-slate-400 text-sm">
          {currentEmail || t.noEmail}
        </p>
        {isLocked && (
          <p className="text-emerald-400/80 text-xs mt-1 font-medium">
            {t.verifiedLocked}
          </p>
        )}
      </div>

      {!isLocked && (
        <Dialog open={open} onOpenChange={(val) => { if (!success) setOpen(val) }}>
          <DialogTrigger
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-all text-white h-fit"
          >
            {t.changeEmail}
          </DialogTrigger>
          <DialogContent className="bg-[#0a0f1e] border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t.updateTitle}</DialogTitle>
            </DialogHeader>
            
            {success ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-emerald-400 font-semibold mb-2">{t.checkInbox}</h3>
                <p className="text-slate-400 text-sm">
                  {t.checkInboxDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200/90 mb-4">
                  <strong>{t.important}</strong> {t.importantDesc}
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.newEmail}</label>
                  <input 
                    name="email"
                    type="email"
                    required
                    className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? t.updating : t.updateLock}
                </button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
