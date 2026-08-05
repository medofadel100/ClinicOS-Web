import { jsPDF } from 'jspdf'

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

type PrescriptionData = {
  id: string
  created_at: string
  notes?: string
  staff_members?: { full_name: string }
  patient_prescription_items: PrescriptionItem[]
}

export type PrescriptionPrintParams = {
  prescription: PrescriptionData
  patientName: string
  patientAge?: string | null
  doctorName?: string
  clinicName?: string
  clinicLogo?: string | null
  isAr: boolean
}

/**
 * Builds the inner HTML (inline styles only) of the printable prescription.
 * Renders Arabic correctly (RTL + system Arabic fonts). Used by both the
 * browser print window and the jsPDF .html() exporter.
 */
export function buildPrescriptionHtml(params: PrescriptionPrintParams): string {
  const { prescription, patientName, patientAge, doctorName, clinicName, clinicLogo, isAr } = params
  const dir = isAr ? 'rtl' : 'ltr'

  const itemName = (item: PrescriptionItem): string => {
    const med = item.clinic_medications
    const global = med?.medications_global
    const brand = isAr ? global?.brand_name_ar || global?.brand_name_en : global?.brand_name_en || global?.brand_name_ar
    return brand || med?.custom_brand_name || (isAr ? 'دواء' : 'Medication')
  }
  const genericName = (item: PrescriptionItem): string => {
    const med = item.clinic_medications
    const global = med?.medications_global
    return global?.generic_name || med?.custom_generic_name || ''
  }

  const rows = prescription.patient_prescription_items.map((item, i) => {
    const generic = genericName(item)
    return `
      <tr>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:13px;">${i + 1}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:13px;">
          <strong>${itemName(item)}</strong>${generic ? `<br/><span style="font-size:11px;color:#64748b;">${generic}</span>` : ''}
        </td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:13px;">${item.dosage || '—'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:13px;">${item.frequency || '—'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:13px;">${item.timing || '—'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:13px;">${item.duration || '—'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-size:12px;">${item.instructions || ''}</td>
      </tr>`
  }).join('')

  const dateStr = new Date(prescription.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return `
    <div dir="${dir}" style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#0f172a;background:#ffffff;padding:28px;max-width:820px;margin:0 auto;line-height:1.6;">
      ${clinicLogo ? `<div style="text-align:center;margin-bottom:12px;"><img src="${clinicLogo}" style="max-height:80px;max-width:200px;object-fit:contain;" /></div>` : ''}
      <div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:12px;margin-bottom:20px;">
        <div style="font-size:20px;font-weight:bold;">${clinicName || 'Clinic'}</div>
        <div style="font-size:13px;color:#475569;margin-top:4px;">${isAr ? 'روشتة طبية' : 'Medical Prescription'} · #${prescription.id.slice(0, 8).toUpperCase()}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr>
          <td style="padding:4px 0;">
            <span style="color:#475569;">${isAr ? 'المريض' : 'Patient'}:</span>
            <strong>${patientName}</strong>${patientAge ? ` <span style="color:#64748b;">(${isAr ? 'العمر' : 'Age'}: ${patientAge})</span>` : ''}
          </td>
          <td style="padding:4px 0;text-align:${dir === 'rtl' ? 'left' : 'right'};">
            <span style="color:#475569;">${isAr ? 'التاريخ' : 'Date'}:</span> <strong>${dateStr}</strong>
          </td>
        </tr>
        ${doctorName ? `
        <tr>
          <td style="padding:4px 0;">
            <span style="color:#475569;">${isAr ? 'الطبيب' : 'Doctor'}:</span> <strong>${doctorName}</strong>
          </td>
        </tr>` : ''}
      </table>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;text-align:center;">#</th>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;">${isAr ? 'الدواء' : 'Medication'}</th>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;">${isAr ? 'الجرعة' : 'Dose'}</th>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;">${isAr ? 'التكرار' : 'Frequency'}</th>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;">${isAr ? 'التوقيت' : 'Timing'}</th>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;">${isAr ? 'المدة' : 'Duration'}</th>
            <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:8px;font-size:12px;">${isAr ? 'تعليمات' : 'Instructions'}</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="7" style="border:1px solid #cbd5e1;padding:12px;text-align:center;color:#94a3b8;">${isAr ? 'لا توجد أدوية' : 'No medications'}</td></tr>`}
        </tbody>
      </table>

      ${prescription.notes ? `
      <div style="margin-top:20px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
        <strong style="font-size:13px;">${isAr ? 'ملاحظات الطبيب' : 'Doctor\'s Notes'}:</strong>
        <div style="font-size:13px;color:#334155;margin-top:4px;">${prescription.notes}</div>
      </div>` : ''}

      <div style="margin-top:32px;text-align:center;font-size:11px;color:#94a3b8;">
        ${isAr ? 'صُدرت بواسطة ClinicOS' : 'Generated by ClinicOS'}
      </div>
    </div>`
}

/** Full standalone HTML document for the browser print window. */
export function buildPrescriptionDocumentHtml(params: PrescriptionPrintParams): string {
  const dir = params.isAr ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${params.isAr ? 'ar' : 'en'}" dir="${dir}">
  <head>
    <meta charset="UTF-8" />
    <title>${params.isAr ? 'روشتة' : 'Prescription'} - ${params.patientName}</title>
    <style>
      body { margin: 0; background: #f1f5f9; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @media print { body { background: #fff; } }
    </style>
  </head>
  <body>${buildPrescriptionHtml(params)}</body>
</html>`
}

/**
 * Downloads a real PDF rendered from the styled HTML (so Arabic prints
 * correctly). Falls back to jsPDF text mode if the DOM renderer is unavailable.
 */
export function generatePrescriptionPDF(params: PrescriptionPrintParams): Promise<jsPDF> {
  return new Promise((resolve) => {
    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.top = '-10000px'
    el.style.left = '-10000px'
    el.style.zIndex = '-1'
    el.innerHTML = buildPrescriptionHtml(params)
    document.body.appendChild(el)

    const doc = new jsPDF({ unit: 'px', format: 'a4', hotfixes: ['px_scaling'] })
    const cleanUp = () => {
      if (el.parentNode) el.parentNode.removeChild(el)
    }

    doc.html(el, {
      margin: [0, 0, 0, 0],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: 794,
      windowWidth: 900,
      html2canvas: { scale: 1, backgroundColor: '#ffffff', useCORS: true },
      callback: () => {
        cleanUp()
        resolve(doc)
      },
    })
  })
}
