'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { HardDrive, AlertTriangle, Send, CheckCircle } from 'lucide-react'
import { requestUpgrade } from '@/lib/actions/entitlements'

interface StorageQuota {
  quotaMB: number
  quotaGB: number
  usedMB: number
  usedGB: number
  percentUsed: number
  byCategory: { xray: number; lab: number; prescription: number }
  totalFiles: number
}

export default function StorageQuotaCard({ clinicId, locale }: { clinicId: string; locale: string }) {
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [hasPendingRequest, setHasPendingRequest] = useState(false)
  const isAr = locale === 'ar'

  useEffect(() => {
    fetch(`/api/drive/quota?clinicId=${clinicId}`)
      .then(r => r.json())
      .then(data => {
        setQuota(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clinicId])

  const handleRequest = async () => {
    setRequesting(true)
    try {
      await requestUpgrade(clinicId, 'storage_increase')
      setHasPendingRequest(true)
      toast.success(isAr ? 'تم إرسال الطلب — سيتم التواصل معك من الإدارة' : 'Request sent — admin will contact you')
    } catch {
      toast.error(isAr ? 'فشل إرسال الطلب' : 'Failed to send request')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
        <div className="h-2 bg-white/5 rounded w-full" />
      </div>
    )
  }

  if (!quota) return null

  const isWarning = quota.percentUsed > 80
  const isCritical = quota.percentUsed > 95

  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: 'rgba(0,212,170,0.1)' }}>
          <HardDrive className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-200">{isAr ? 'مساحة التخزين' : 'Storage Quota'}</h3>
          <p className="text-xs text-slate-500">{isAr ? 'حد التخزين المعين لعيادتك' : 'Your clinic storage limit'}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-200">{quota.quotaGB >= 1 ? `${quota.quotaGB} GB` : `${quota.quotaMB} MB`}</p>
          <p className="text-[10px] text-slate-500 uppercase">{isAr ? 'الحد الأقصى' : 'Max Limit'}</p>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">
            {isAr ? 'المستخدم' : 'Used'}: {quota.usedGB >= 1 ? `${quota.usedGB} GB` : `${quota.usedMB} MB`}
          </span>
          <span className={`text-xs font-medium ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-400'}`}>
            {quota.percentUsed}%
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, quota.percentUsed)}%`,
              background: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#00d4aa',
            }}
          />
        </div>
      </div>

      {/* Warning + Request Button */}
      {(isWarning || isCritical) && (
        <div className={`flex flex-col gap-3 p-3 rounded-lg mb-4 ${isCritical ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
            <div>
              <p className={`font-medium ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {isCritical
                  ? (isAr ? 'المساحة على وشك الامتلاء!' : 'Storage almost full!')
                  : (isAr ? 'المساحة وصلت لـ 80%' : 'Storage at 80%')
                }
              </p>
              <p className="text-slate-500 mt-0.5">
                {isAr
                  ? 'تواصل مع إدارة المنصة لزيادة مساحة التخزين.'
                  : 'Contact platform admin to increase your storage.'
                }
              </p>
            </div>
          </div>

          {/* Request More Storage Button */}
          {!hasPendingRequest ? (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                color: isCritical ? '#fca5a5' : '#fcd34d',
                border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              }}
            >
              {requesting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isAr ? 'جاري الإرسال...' : 'Sending...'}
                </span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {isAr ? 'طلب زيادة مساحة' : 'Request More Storage'}
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
              {isAr ? 'تم إرسال الطلب — في انتظار مراجعة الإدارة' : 'Request sent — awaiting admin review'}
            </div>
          )}
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { key: 'xray', label: isAr ? 'أشعة' : 'X-Rays', mb: quota.byCategory.xray },
          { key: 'lab', label: isAr ? 'تحاليل' : 'Labs', mb: quota.byCategory.lab },
          { key: 'prescription', label: isAr ? 'روشتات' : 'Rx', mb: quota.byCategory.prescription },
        ].map(cat => (
          <div key={cat.key} className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-xs text-slate-500">{cat.label}</p>
            <p className="text-sm font-semibold text-slate-300">{cat.mb >= 1024 ? `${(cat.mb / 1024).toFixed(1)} GB` : `${cat.mb} MB`}</p>
          </div>
        ))}
      </div>

      {/* Contact Info */}
      {isWarning && !hasPendingRequest && (
        <p className="text-[11px] text-slate-600 text-center mt-2">
          {isAr
            ? 'أو تواصل معنا مباشرة على WhatsApp أو البريد الإلكتروني'
            : 'Or contact us directly via WhatsApp or email'
          }
        </p>
      )}
    </div>
  )
}
