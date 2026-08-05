'use client'

import { useState } from 'react'
import { Printer, MessageCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import { generatePrescriptionPDF } from '@/lib/prescription-pdf'

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
  prescription,
  patientName,
  patientPhone,
  patientAge,
  doctorName,
  clinicName,
  clinicLogo,
  isAr
}: {
  prescription: Prescription
  patientName: string
  patientPhone?: string
  patientAge?: string | null
  doctorName?: string
  clinicName?: string
  clinicLogo?: string | null
  isAr: boolean
}) {
  const [downloading, setDownloading] = useState(false)

  const formatPrescriptionText = () => {
    const lines: string[] = []
    lines.push(`═══════════════════════════════`)
    lines.push(`${clinicName || 'Clinic'}`)
    lines.push(`═══════════════════════════════`)
    lines.push(``)
    lines.push(`${isAr ? 'المريض' : 'Patient'}: ${patientName}${patientAge ? ` (${isAr ? 'العمر' : 'Age'}: ${patientAge})` : ''}`)
    lines.push(`${isAr ? 'التاريخ' : 'Date'}: ${new Date(prescription.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}`)
    if (doctorName) lines.push(`${isAr ? 'الطبيب' : 'Doctor'}: ${doctorName}`)
    lines.push(``)
    lines.push(`───────────────────────────────`)
    lines.push(`${isAr ? 'الروشتة' : 'Prescription (Rx)'}`)
    lines.push(`───────────────────────────────`)
    lines.push(``)

    prescription.patient_prescription_items.forEach((item, i) => {
      const med = item.clinic_medications
      const global = med?.medications_global
      const name = global?.brand_name_en || med?.custom_brand_name || 'Medication'
      const generic = global?.generic_name || med?.custom_generic_name || ''
      lines.push(`${i + 1}. ${name}${generic ? ` (${generic})` : ''}`)
      if (item.dosage) lines.push(`   ${isAr ? 'الجرعة' : 'Dose'}: ${item.dosage}`)
      if (item.frequency) lines.push(`   ${isAr ? 'التكرار' : 'Freq'}: ${item.frequency}`)
      if (item.timing) lines.push(`   ${isAr ? 'التوقيت' : 'Timing'}: ${item.timing}`)
      if (item.duration) lines.push(`   ${isAr ? 'المدة' : 'Duration'}: ${item.duration}`)
      if (item.instructions) lines.push(`   ${isAr ? 'ملاحظة' : 'Note'}: ${item.instructions}`)
      lines.push(``)
    })

    if (prescription.notes) {
      lines.push(`───────────────────────────────`)
      lines.push(`${isAr ? 'ملاحظات' : 'Notes'}: ${prescription.notes}`)
    }

    lines.push(``)
    lines.push(`═══════════════════════════════`)
    return lines.join('\n')
  }

  const handlePrint = () => {
    const text = formatPrescriptionText()
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
      <head>
        <title>${isAr ? 'روشتة' : 'Prescription'} - ${patientName}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 40px; font-size: 14px; line-height: 1.6; color: #000; }
          pre { white-space: pre-wrap; margin: 0; }
          .logo { text-align: center; margin-bottom: 16px; }
          .logo img { max-height: 80px; max-width: 200px; object-fit: contain; }
        </style>
      </head>
      <body>
        ${clinicLogo ? `<div class="logo"><img src="${clinicLogo}" alt="Logo" /></div>` : ''}
        <pre>${text}</pre>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const doc = generatePrescriptionPDF({
        prescription,
        patientName,
        patientAge,
        doctorName,
        clinicName,
        isAr,
      })
      const rxId = prescription.id.slice(0, 8).toUpperCase()
      doc.save(`Rx-${rxId}.pdf`)
      toast.success(isAr ? 'تم تحميل الروشتة' : 'Prescription downloaded')
    } catch {
      toast.error(isAr ? 'فشل في إنشاء الروشتة' : 'Failed to generate prescription')
    } finally {
      setDownloading(false)
    }
  }

  const handleWhatsApp = () => {
    const text = formatPrescriptionText()
    const encoded = encodeURIComponent(text)
    let phone = patientPhone?.replace(/[^0-9+]/g, '') || ''
    if (phone && !phone.startsWith('+')) {
      phone = `+20${phone}`
    }
    const url = phone
      ? `https://wa.me/${phone.replace('+', '')}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
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
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/25 disabled:opacity-50"
        title={isAr ? 'تحميل PDF' : 'Download PDF'}
      >
        <Download className="w-3.5 h-3.5" />
        {downloading ? (isAr ? 'جاري...' : '...') : 'PDF'}
      </button>
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25"
        title={isAr ? 'إرسال واتساب' : 'Send via WhatsApp'}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </button>
    </div>
  )
}
