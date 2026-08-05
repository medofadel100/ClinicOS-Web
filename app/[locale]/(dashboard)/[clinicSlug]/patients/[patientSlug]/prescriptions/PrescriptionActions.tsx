'use client'

import { useState } from 'react'
import { Printer, MessageCircle, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { buildPrescriptionDocumentHtml, generatePrescriptionPDF } from '@/lib/prescription-pdf'
import { sendPrescriptionWhatsApp } from './actions'

type PrescriptionItem = {
  id: string
  dosage: string
  frequency: string
  timing?: string
  duration?: string
  instructions?: string
  clinic_medications?: {
    custom_brand_name?: string
    custom_generic_name?: string
    medications_global?: {
      brand_name_en?: string
      brand_name_ar?: string
      generic_name?: string
    }
  }
}

type Prescription = {
  id: string
  created_at: string
  notes?: string
  staff_members?: { full_name: string }
  patient_prescription_items: PrescriptionItem[]
}

export default function PrescriptionActions({
  clinicId,
  prescription,
  patientName,
  patientPhone,
  patientAge,
  doctorName,
  clinicName,
  clinicLogo,
  isAr
}: {
  clinicId: string
  prescription: Prescription
  patientName: string
  patientPhone?: string
  patientAge?: string | null
  doctorName?: string
  clinicName?: string
  clinicLogo?: string | null
  isAr: boolean
}) {
  const [busy, setBusy] = useState<'pdf' | 'whatsapp' | null>(null)

  const printParams = {
    prescription,
    patientName,
    patientAge,
    doctorName,
    clinicName,
    clinicLogo,
    isAr,
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(buildPrescriptionDocumentHtml(printParams))
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleDownloadPDF = async () => {
    setBusy('pdf')
    try {
      const doc = await generatePrescriptionPDF(printParams)
      const rxId = prescription.id.slice(0, 8).toUpperCase()
      doc.save(`Rx-${rxId}.pdf`)
      toast.success(isAr ? 'تم تحميل الروشتة' : 'Prescription downloaded')
    } catch {
      toast.error(isAr ? 'فشل في إنشاء الروشتة' : 'Failed to generate prescription')
    } finally {
      setBusy(null)
    }
  }

  const handleWhatsApp = async () => {
    if (!patientPhone) {
      toast.error(isAr ? 'لا يوجد رقم هاتف مسجل لهذا المريض' : 'No phone number on file for this patient')
      return
    }
    setBusy('whatsapp')
    try {
      await sendPrescriptionWhatsApp(
        clinicId,
        isAr ? 'ar' : 'en',
        prescription.id
      )
      toast.success(isAr ? 'تم إرسال الروشتة عبر واتساب' : 'Prescription sent via WhatsApp')
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل في إرسال الروشتة' : 'Failed to send prescription'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
        title={isAr ? 'طباعة' : 'Print'}
      >
        <Printer className="w-3.5 h-3.5" />
        {isAr ? 'طباعة' : 'Print'}
      </button>
      <button
        onClick={handleDownloadPDF}
        disabled={busy === 'pdf'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/25 disabled:opacity-50"
        title={isAr ? 'تحميل PDF' : 'Download PDF'}
      >
        {busy === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {busy === 'pdf' ? (isAr ? 'جاري...' : '...') : 'PDF'}
      </button>
      <button
        onClick={handleWhatsApp}
        disabled={busy === 'whatsapp'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25 disabled:opacity-50"
        title={isAr ? 'إرسال عبر الواتساب' : 'Send via WhatsApp'}
      >
        {busy === 'whatsapp' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
        WhatsApp
      </button>
    </div>
  )
}
