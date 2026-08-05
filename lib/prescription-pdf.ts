import jsPDF from 'jspdf'

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

export function generatePrescriptionPDF(params: {
  prescription: PrescriptionData
  patientName: string
  patientAge?: string | null
  doctorName?: string
  clinicName?: string
  isAr: boolean
}): jsPDF {
  const { prescription, patientName, patientAge, doctorName, clinicName, isAr } = params
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(88, 28, 135)
  doc.rect(0, 0, pageWidth, 32, 'F')

  // Rx symbol + clinic name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Rx', 15, 14)

  doc.setFontSize(12)
  doc.text(clinicName || 'Clinic', 15, 24)

  // Date + prescription ID
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date(prescription.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(dateStr, pageWidth - 15, 14, { align: 'right' })

  doc.setTextColor(200, 180, 240)
  doc.text(`#${prescription.id.slice(0, 8).toUpperCase()}`, pageWidth - 15, 22, { align: 'right' })

  let y = 42

  // Patient & Doctor info
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(isAr ? 'المريض' : 'PATIENT', 15, y)

  if (doctorName) {
    doc.text(isAr ? 'الطبيب' : 'DOCTOR', pageWidth - 15, y, { align: 'right' })
  }

  y += 6
  doc.setFontSize(10)
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.text(patientName, 15, y)
  if (patientAge) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 140)
    doc.text(`  (${isAr ? 'العمر' : 'Age'}: ${patientAge})`, 15 + doc.getTextWidth(patientName), y)
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'bold')
  }

  if (doctorName) {
    doc.setFont('helvetica', 'normal')
    doc.text(doctorName, pageWidth - 15, y, { align: 'right' })
  }

  y += 10

  // Divider
  doc.setDrawColor(168, 162, 220)
  doc.setLineWidth(0.5)
  doc.line(15, y, pageWidth - 15, y)
  y += 10

  // Rx header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(88, 28, 135)
  doc.text(isAr ? 'الروشتة' : 'Prescription', 15, y)
  y += 10

  // Medications
  prescription.patient_prescription_items.forEach((item, i) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }

    const med = item.clinic_medications
    const global = med?.medications_global
    const brandName = global?.brand_name_en || med?.custom_brand_name || 'Medication'
    const genericName = global?.generic_name || med?.custom_generic_name || ''

    // Medication number and name
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text(`${i + 1}. ${brandName}`, 15, y)

    if (genericName) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 140)
      const nameWidth = doc.getTextWidth(`${i + 1}. ${brandName}`)
      doc.text(` (${genericName})`, 15 + nameWidth, y)
    }
    y += 6

    // Details grid
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)

    const details: { label: string; value: string }[] = []
    if (item.dosage) details.push({ label: isAr ? 'الجرعة' : 'Dose', value: item.dosage })
    if (item.frequency) details.push({ label: isAr ? 'التكرار' : 'Frequency', value: item.frequency })
    if (item.timing) details.push({ label: isAr ? 'التوقيت' : 'Timing', value: item.timing })
    if (item.duration) details.push({ label: isAr ? 'المدة' : 'Duration', value: item.duration })

    let detailX = 20
    for (const detail of details) {
      doc.setFont('helvetica', 'bold')
      doc.text(`${detail.label}: `, detailX, y)
      const labelWidth = doc.getTextWidth(`${detail.label}: `)
      doc.setFont('helvetica', 'normal')
      doc.text(detail.value, detailX + labelWidth, y)
      detailX += labelWidth + doc.getTextWidth(detail.value) + 6
      if (detailX > pageWidth - 20) {
        detailX = 20
        y += 5
      }
    }
    y += 5

    if (item.instructions) {
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(180, 140, 40)
      doc.text(`${isAr ? 'ملاحظة' : 'Note'}: ${item.instructions}`, 20, y)
      y += 5
    }

    // Subtle separator between medications
    if (i < prescription.patient_prescription_items.length - 1) {
      doc.setDrawColor(230, 230, 240)
      doc.setLineWidth(0.2)
      doc.line(20, y, pageWidth - 20, y)
      y += 6
    }
  })

  // Notes
  if (prescription.notes) {
    y += 6
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    doc.setDrawColor(168, 162, 220)
    doc.setLineWidth(0.5)
    doc.line(15, y, pageWidth - 15, y)
    y += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(88, 28, 135)
    doc.text(isAr ? 'ملاحظات الطبيب' : 'Doctor\'s Notes', 15, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    const splitNotes = doc.splitTextToSize(prescription.notes, pageWidth - 30)
    doc.text(splitNotes, 15, y)
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 12
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 200)
  doc.text(isAr ? 'صُدرت بواسطة ClinicOS' : 'Generated by ClinicOS', pageWidth / 2, footerY, { align: 'center' })

  return doc
}
