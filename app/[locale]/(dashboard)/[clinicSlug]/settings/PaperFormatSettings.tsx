'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { savePaperFormat } from './actions'

type PaperFormat = {
  paper_size: 'a4' | 'a5'
  header_text: string
  footer_text: string
  show_logo_in_header: boolean
  show_logo_in_footer: boolean
  watermark_text: string
}

export default function PaperFormatSettings({
  clinicId,
  locale,
  initialFormat
}: {
  clinicId: string
  locale: string
  initialFormat?: PaperFormat
}) {
  const isAr = locale === 'ar'
  const [format, setFormat] = useState<PaperFormat>(initialFormat || {
    paper_size: 'a4',
    header_text: '',
    footer_text: '',
    show_logo_in_header: true,
    show_logo_in_footer: false,
    watermark_text: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await savePaperFormat(clinicId, JSON.stringify(format))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toast.error(isAr ? 'فشل في الحفظ' : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)' }}>
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{isAr ? 'شكل الورقة' : 'Paper Format'}</h3>
          <p className="text-xs text-slate-500">{isAr ? 'تخصيص شكل الروشتة والفواتير' : 'Customize prescription & invoice appearance'}</p>
        </div>
      </div>

      {/* Paper Size */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'مقاس الورقة' : 'Paper Size'}</label>
        <div className="flex gap-3">
          {[
            { value: 'a4', label: 'A4', desc: isAr ? '210 × 297 مم' : '210 × 297 mm' },
            { value: 'a5', label: 'A5', desc: isAr ? '148 × 210 مم' : '148 × 210 mm' }
          ].map(size => (
            <button
              key={size.value}
              onClick={() => setFormat(f => ({ ...f, paper_size: size.value as 'a4' | 'a5' }))}
              className={`flex-1 p-3 rounded-xl text-center transition-all ${
                format.paper_size === size.value
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              <span className="text-lg font-bold">{size.label}</span>
              <p className="text-[10px] mt-0.5 opacity-70">{size.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الهيدر' : 'Header Text'}</label>
        <input
          value={format.header_text}
          onChange={e => setFormat(f => ({ ...f, header_text: e.target.value }))}
          placeholder={isAr ? 'اسم العيادة + العنوان + رقم التليفون' : 'Clinic name + address + phone'}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={format.show_logo_in_header}
            onChange={e => setFormat(f => ({ ...f, show_logo_in_header: e.target.checked }))}
            className="rounded"
          />
          {isAr ? 'إظهار اللوجو في الهيدر' : 'Show logo in header'}
        </label>
      </div>

      {/* Footer */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الفوتر' : 'Footer Text'}</label>
        <input
          value={format.footer_text}
          onChange={e => setFormat(f => ({ ...f, footer_text: e.target.value }))}
          placeholder={isAr ? 'رقم التأمين + ملاحظات' : 'Insurance info + notes'}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={format.show_logo_in_footer}
            onChange={e => setFormat(f => ({ ...f, show_logo_in_footer: e.target.checked }))}
            className="rounded"
          />
          {isAr ? 'إظهار اللوجو في الفوتر' : 'Show logo in footer'}
        </label>
      </div>

      {/* Watermark */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الواترمارك' : 'Watermark'}</label>
        <input
          value={format.watermark_text}
          onChange={e => setFormat(f => ({ ...f, watermark_text: e.target.value }))}
          placeholder={isAr ? 'مثال: نسخة المريض' : 'e.g. PATIENT COPY'}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Preview */}
      <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">{isAr ? 'معاينة' : 'Preview'}</p>
        <div
          className="bg-white rounded-lg p-4 mx-auto text-black"
          style={{
            maxWidth: format.paper_size === 'a4' ? '210px' : '148px',
            aspectRatio: format.paper_size === 'a4' ? '210/297' : '148/210',
            fontSize: format.paper_size === 'a4' ? '8px' : '6px'
          }}
        >
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-2 mb-2">
            {format.show_logo_in_header && (
              <div className="w-6 h-6 mx-auto mb-1 bg-gray-200 rounded flex items-center justify-center text-[6px] text-gray-400">LOGO</div>
            )}
            <div className="font-bold text-[9px]">{format.header_text || (isAr ? 'اسم العيادة' : 'Clinic Name')}</div>
          </div>
          {/* Body */}
          <div className="flex-1 text-[6px] text-gray-400 py-2">
            {isAr ? 'محتوى الروشتة...' : 'Prescription content...'}
          </div>
          {/* Footer */}
          <div className="text-center border-t border-gray-200 pt-2 mt-2">
            {format.show_logo_in_footer && (
              <div className="w-4 h-4 mx-auto mb-1 bg-gray-200 rounded flex items-center justify-center text-[5px] text-gray-400">LOGO</div>
            )}
            <div className="text-[7px] text-gray-400">{format.footer_text || ''}</div>
          </div>
          {/* Watermark */}
          {format.watermark_text && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 text-[10px] text-gray-400 rotate-[-30deg]">
              {format.watermark_text}
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-10 rounded-lg text-sm font-medium transition-all"
        style={{
          background: saved ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
          color: saved ? '#4ade80' : '#818cf8',
          border: `1px solid ${saved ? 'rgba(34,197,94,0.25)' : 'rgba(99,102,241,0.25)'}`
        }}
      >
        {saving ? '...' : saved ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
      </button>
    </div>
  )
}
