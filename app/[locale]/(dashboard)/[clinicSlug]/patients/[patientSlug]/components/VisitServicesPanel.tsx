'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, FileText, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getClinicServices, getCurrentVisitServices, saveVisitServices, type VisitServiceItem } from '../clinical/actions'
import { generateServicesInvoicePDF } from '@/lib/services-invoice-pdf'

type Service = {
  id: string
  name: string
  price: number
  description?: string | null
  category_id?: string | null
}

type Line = {
  key: string
  clinic_service_id: string | null
  name: string
  price: number
  qty: number
}

export default function VisitServicesPanel({
  clinicId,
  patientId,
  locale,
  isAr,
  patientName,
  patientPhone,
  patientDisplayId,
  clinicName,
  clinicAddress,
  clinicPhone,
  clinicEmail,
  clinicOwnerName,
}: {
  clinicId: string
  patientId: string
  locale: string
  isAr: boolean
  patientName: string
  patientPhone?: string | null
  patientDisplayId?: string | null
  clinicName: string
  clinicAddress?: string | null
  clinicPhone?: string | null
  clinicEmail?: string | null
  clinicOwnerName?: string | null
}) {
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [invoicing, setInvoicing] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [svcs, current] = await Promise.all([
          getClinicServices(clinicId),
          getCurrentVisitServices(clinicId, patientId),
        ])
        setServices(svcs)
        setLines(
          (current || []).map((p: any) => ({
            key: p.id,
            clinic_service_id: p.clinic_service_id || null,
            name: p.service_name || '—',
            price: Number(p.unit_price_egp || 0),
            qty: Number(p.quantity || 1),
          }))
        )
      } catch {
        toast.error(isAr ? 'تعذر تحميل الخدمات' : 'Failed to load services')
      } finally {
        setLoaded(true)
      }
    })()
  }, [clinicId, patientId, isAr])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return services
    return services.filter(s => s.name.toLowerCase().includes(q))
  }, [services, search])

  const total = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines])

  const addService = useCallback((s: Service) => {
    setLines(prev => {
      const existing = prev.find(l => l.clinic_service_id === s.id)
      if (existing) {
        return prev.map(l => (l.clinic_service_id === s.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [
        ...prev,
        { key: `${s.id}-${Date.now()}`, clinic_service_id: s.id, name: s.name, price: Number(s.price || 0), qty: 1 },
      ]
    })
    setSearch('')
  }, [])

  const addManual = useCallback(() => {
    const name = search.trim()
    if (!name) return
    setLines(prev => [...prev, { key: `m-${Date.now()}`, clinic_service_id: null, name, price: 0, qty: 1 }])
    setSearch('')
  }, [search])

  const updateQty = useCallback((key: string, delta: number) => {
    setLines(prev =>
      prev
        .map(l => (l.key === key ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
    )
  }, [])

  const updatePrice = useCallback((key: string, price: number) => {
    setLines(prev => prev.map(l => (l.key === key ? { ...l, price: Math.max(0, price) } : l)))
  }, [])

  const removeLine = useCallback((key: string) => {
    setLines(prev => prev.filter(l => l.key !== key))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const items: VisitServiceItem[] = lines.map(l => ({
        clinic_service_id: l.clinic_service_id,
        name: l.name,
        quantity: l.qty,
        unit_price_egp: l.price,
      }))
      await saveVisitServices(clinicId, locale, patientId, items)
      toast.success(isAr ? 'تم حفظ الخدمات المنجزة' : 'Services saved')
    } catch {
      toast.error(isAr ? 'فشل في حفظ الخدمات' : 'Failed to save services')
    } finally {
      setSaving(false)
    }
  }

  const handleInvoice = async () => {
    if (lines.length === 0) {
      toast.error(isAr ? 'لا توجد خدمات لحسابها' : 'No services to invoice')
      return
    }
    setInvoicing(true)
    try {
      await saveVisitServices(clinicId, locale, patientId, lines.map(l => ({
        clinic_service_id: l.clinic_service_id,
        name: l.name,
        quantity: l.qty,
        unit_price_egp: l.price,
      })))

      const invoiceNumber = `SV-${patientDisplayId || patientId.slice(0, 6)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
      const doc = generateServicesInvoicePDF({
        patient: { full_name: patientName, phone: patientPhone || null, display_id: patientDisplayId || null },
        clinic: {
          name: clinicName,
          address: clinicAddress || null,
          contact_phone: clinicPhone || null,
          contact_email: clinicEmail || null,
          owner_full_name: clinicOwnerName || null,
        },
        items: lines.map(l => ({ name: l.name, quantity: l.qty, unit_price_egp: l.price })),
        invoiceNumber,
        date: new Date().toISOString(),
        isAr,
      })
      doc.save(`${invoiceNumber}.pdf`)
      toast.success(isAr ? 'تم إنشاء الفاتورة النهائية' : 'Final invoice generated')
    } catch {
      toast.error(isAr ? 'فشل في إنشاء الفاتورة' : 'Failed to generate invoice')
    } finally {
      setInvoicing(false)
    }
  }

  return (
    <div className="p-5 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-base font-bold text-slate-200">
          {isAr ? 'الخدمات والإجراءات المنجزة' : 'Completed Services & Procedures'}
        </h3>
        <span className="text-xs text-slate-400">
          {isAr ? 'يتم تحويلها لفاتورة نهائية للمريض' : 'Converted to a final patient invoice'}
        </span>
      </div>

      {/* Search + add */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? 'ابحث عن خدمة من قائمة العيادة...' : 'Search clinic services...'}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-400/50"
        />
        {search.trim() && (
          <button
            onClick={addManual}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30"
          >
            <Plus className="w-3 h-3" />
            {isAr ? 'خدمة يدوية' : 'Custom'}
          </button>
        )}
      </div>

      {search.trim() && filtered.length > 0 && (
        <div className="border border-white/10 rounded-xl bg-white/[0.02] divide-y divide-white/5 max-h-56 overflow-y-auto">
          {filtered.slice(0, 8).map(s => (
            <button
              key={s.id}
              onClick={() => addService(s)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
            >
              <span className="text-slate-200">
                {s.name}
                {s.description ? <span className="block text-[11px] text-slate-500">{s.description}</span> : null}
              </span>
              <span className="text-xs font-semibold text-teal-400 whitespace-nowrap">
                {Number(s.price || 0).toLocaleString()} EGP
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lines */}
      {!loaded ? (
        <div className="h-24 animate-pulse bg-white/5 rounded-xl" />
      ) : lines.length === 0 ? (
        <div className="text-center py-10 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
          {isAr ? 'لم تتم إضافة خدمات بعد' : 'No services added yet'}
        </div>
      ) : (
        <div className="space-y-2">
          {lines.map(l => (
            <div key={l.key} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{l.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(l.key, -1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 text-slate-300 hover:bg-white/10">−</button>
                    <span className="w-7 text-center text-xs font-semibold text-slate-200">{l.qty}</span>
                    <button onClick={() => updateQty(l.key, 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 text-slate-300 hover:bg-white/10">+</button>
                  </div>
                  <span className="text-[11px] text-slate-500">×</span>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={l.price}
                    onChange={e => updatePrice(l.key, Number(e.target.value) || 0)}
                    className="w-20 bg-transparent border border-white/10 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-400/50"
                  />
                  <span className="text-[11px] text-slate-500">EGP</span>
                </div>
              </div>
              <div className="text-sm font-bold text-teal-300 whitespace-nowrap">
                {(l.price * l.qty).toLocaleString()} EGP
              </div>
              <button onClick={() => removeLine(l.key)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Total + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate-400">{isAr ? 'الإجمالي' : 'Total'}</span>
          <span className="text-xl font-extrabold text-teal-300">{total.toLocaleString()} EGP</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isAr ? 'حفظ' : 'Save'}
          </button>
          <button
            onClick={handleInvoice}
            disabled={invoicing || lines.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/25 disabled:opacity-50"
          >
            {invoicing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {isAr ? 'الفاتورة النهائية (PDF)' : 'Final Invoice (PDF)'}
          </button>
        </div>
      </div>
    </div>
  )
}
