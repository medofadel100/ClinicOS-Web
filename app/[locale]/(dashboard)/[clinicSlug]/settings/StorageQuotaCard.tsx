'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { HardDrive, TrendingUp, AlertTriangle } from 'lucide-react'

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
  const [saving, setSaving] = useState(false)
  const [newQuotaGB, setNewQuotaGB] = useState('')
  const isAr = locale === 'ar'

  useEffect(() => {
    fetch(`/api/drive/quota?clinicId=${clinicId}`)
      .then(r => r.json())
      .then(data => {
        setQuota(data)
        setNewQuotaGB(String(Math.round(data.quotaGB)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clinicId])

  const handleSave = async () => {
    const mb = parseInt(newQuotaGB, 10) * 1024
    if (!mb || mb < 100) {
      toast.error(isAr ? 'الحد الأدنى 100 MB' : 'Minimum is 100 MB')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/drive/quota', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId, quotaMB: mb }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isAr ? 'تم تحديث الحد' : 'Quota updated')
        setQuota(prev => prev ? { ...prev, quotaMB: mb, quotaGB: Math.round(mb / 1024 * 100) / 100 } : null)
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch {
      toast.error(isAr ? 'فشل التحديث' : 'Update failed')
    } finally {
      setSaving(false)
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
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{isAr ? 'مساحة التخزين' : 'Storage Quota'}</h3>
          <p className="text-xs text-slate-500">{isAr ? 'حد التخزين لهذه العيادة' : 'Storage limit for this clinic'}</p>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">
            {quota.usedGB >= 1 ? `${quota.usedGB} GB` : `${quota.usedMB} MB`}
            {' / '}
            {quota.quotaGB >= 1 ? `${quota.quotaGB} GB` : `${quota.quotaMB} MB`}
          </span>
          <span className={`text-xs font-medium ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-400'}`}>
            {quota.percentUsed}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, quota.percentUsed)}%`,
              background: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#00d4aa',
            }}
          />
        </div>
      </div>

      {/* Warning */}
      {isWarning && (
        <div className={`flex items-center gap-2 p-2.5 rounded-lg mb-4 text-xs ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {isCritical
            ? (isAr ? 'المساحة على وشك الامتلاء! تواصل مع الإدارة لزيادة الحد.' : 'Storage almost full! Contact admin to increase quota.')
            : (isAr ? 'المساحة وصلت لـ 80% — فكّر في زيادة الحد.' : 'Storage at 80% — consider increasing quota.')
          }
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
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

      {/* Quota Settings */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-slate-500 block mb-1">{isAr ? 'الحد الجديد (GB)' : 'New Quota (GB)'}</label>
          <input
            type="number"
            value={newQuotaGB}
            onChange={e => setNewQuotaGB(e.target.value)}
            min={1}
            className="w-full h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || newQuotaGB === String(Math.round(quota.quotaGB))}
          className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all disabled:opacity-50"
        >
          {saving ? '...' : (isAr ? 'حفظ' : 'Save')}
        </button>
      </div>
    </div>
  )
}
