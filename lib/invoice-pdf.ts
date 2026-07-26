import jsPDF from 'jspdf'

type InvoicePlan = {
  id: string
  title: string
  total_price_egp: number
  status: string
  created_at: string
  treatment_plan_sessions: {
    id: string
    sequence_number: number
    session_price_egp: number
    status: 'pending' | 'completed'
  }[]
  patient_payments: {
    id: string
    amount_egp: number
    payment_type: string
    paid_at: string
  }[]
}

type InvoicePatient = {
  id: string
  full_name: string
  phone: string | null
  display_id: string | null
}

type InvoiceClinic = {
  name: string
  address: string | null
  contact_phone: string | null
  contact_email: string | null
  owner_full_name: string | null
}

export function generateInvoicePDF(params: {
  patient: InvoicePatient
  clinic: InvoiceClinic
  plan: InvoicePlan
  invoiceNumber: string
  isAr: boolean
}): jsPDF {
  const { patient, clinic, plan, invoiceNumber, isAr } = params
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const totalPaid = plan.patient_payments.reduce((sum, p) => sum + p.amount_egp, 0)
  const remainingBalance = plan.total_price_egp - totalPaid

  let y = 20

  // Header bar
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Clinic name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(clinic.name, 15, 15)

  // Invoice title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(isAr ? 'فاتورة' : 'INVOICE', pageWidth - 15, 15, { align: 'right' })

  // Invoice number
  doc.setFontSize(8)
  doc.text(`${isAr ? 'رقم الفاتورة' : 'Invoice #'}: ${invoiceNumber}`, pageWidth - 15, 22, { align: 'right' })

  // Date
  const dateStr = new Date(plan.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(`${isAr ? 'التاريخ' : 'Date'}: ${dateStr}`, pageWidth - 15, 29, { align: 'right' })

  y = 45

  // Clinic details (left) & patient details (right)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(isAr ? 'العيادة' : 'FROM', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(isAr ? 'العيادة' : 'BILL TO', pageWidth - 15, y, { align: 'right' })

  y += 6
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)

  const clinicLines: string[] = [
    clinic.name,
    clinic.address || '',
    clinic.contact_phone || '',
    clinic.contact_email || '',
  ].filter(Boolean)

  const patientLines: string[] = [
    patient.full_name,
    patient.phone || '',
    patient.display_id ? `${isAr ? 'رقم المريض' : 'Patient #'}: ${patient.display_id}` : '',
  ].filter(Boolean)

  const maxLines = Math.max(clinicLines.length, patientLines.length)
  for (let i = 0; i < maxLines; i++) {
    if (clinicLines[i]) doc.text(clinicLines[i], 15, y + i * 5)
    if (patientLines[i]) doc.text(patientLines[i], pageWidth - 15, y + i * 5, { align: 'right' })
  }

  y += maxLines * 5 + 8

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(15, y, pageWidth - 15, y)
  y += 8

  // Treatment plan header
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(plan.title, 15, y)
  y += 10

  // Sessions table header
  doc.setFillColor(241, 245, 249)
  doc.rect(15, y - 4, pageWidth - 30, 8, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text(isAr ? 'الجلسة' : 'Session', 18, y + 1)
  doc.text(isAr ? 'السعر' : 'Price', pageWidth / 2, y + 1, { align: 'center' })
  doc.text(isAr ? 'الحالة' : 'Status', pageWidth - 18, y + 1, { align: 'right' })
  y += 10

  // Sessions
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const sessions = [...plan.treatment_plan_sessions].sort((a, b) => a.sequence_number - b.sequence_number)
  for (const session of sessions) {
    doc.setTextColor(30, 41, 59)
    doc.text(`${isAr ? 'جلسة' : 'Session'} #${session.sequence_number}`, 18, y)
    doc.text(`${session.session_price_egp.toLocaleString()} EGP`, pageWidth / 2, y, { align: 'center' })

    const statusLabel = session.status === 'completed'
      ? (isAr ? 'مكتملة' : 'Completed')
      : (isAr ? 'معلقة' : 'Pending')
    doc.setTextColor(session.status === 'completed' ? 16 : 234, session.status === 'completed' ? 185 : 88, session.status === 'completed' ? 129 : 88)
    doc.text(statusLabel, pageWidth - 18, y, { align: 'right' })
    y += 6
  }

  y += 4

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(15, y, pageWidth - 15, y)
  y += 8

  // Totals section
  const totalsX = pageWidth - 15
  const labelsX = 15

  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)

  doc.text(isAr ? 'الإجمالي' : 'Total', labelsX, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(`${plan.total_price_egp.toLocaleString()} EGP`, totalsX, y, { align: 'right' })
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(16, 185, 129)
  doc.text(isAr ? 'المدفوع' : 'Paid', labelsX, y)
  doc.setFont('helvetica', 'bold')
  doc.text(`${totalPaid.toLocaleString()} EGP`, totalsX, y, { align: 'right' })
  y += 7

  if (remainingBalance > 0) {
    doc.setTextColor(239, 68, 68)
    doc.text(isAr ? 'المتبقي' : 'Remaining', labelsX, y)
    doc.setFont('helvetica', 'bold')
    doc.text(`${remainingBalance.toLocaleString()} EGP`, totalsX, y, { align: 'right' })
    y += 7
  }

  y += 6

  // Payments history header (if any)
  if (plan.patient_payments.length > 0) {
    doc.setDrawColor(226, 232, 240)
    doc.line(15, y, pageWidth - 15, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(isAr ? 'سجل المدفوعات' : 'PAYMENT HISTORY', 15, y)
    y += 8

    // Table header
    doc.setFillColor(241, 245, 249)
    doc.rect(15, y - 4, pageWidth - 30, 8, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105)
    doc.text(isAr ? 'التاريخ' : 'Date', 18, y + 1)
    doc.text(isAr ? 'النوع' : 'Type', pageWidth / 2 - 15, y + 1, { align: 'center' })
    doc.text(isAr ? 'المبلغ' : 'Amount', pageWidth - 18, y + 1, { align: 'right' })
    y += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    for (const payment of plan.patient_payments) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      const pDate = new Date(payment.paid_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')
      doc.setTextColor(30, 41, 59)
      doc.text(pDate, 18, y)
      doc.text(payment.payment_type.replace('_', ' '), pageWidth / 2 - 15, y, { align: 'center' })
      doc.setTextColor(16, 185, 129)
      doc.text(`+${payment.amount_egp.toLocaleString()} EGP`, pageWidth - 18, y, { align: 'right' })
      y += 6
    }
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    isAr ? 'تم إنشاء هذه الفاتورة بواسطة ClinicOS' : 'Generated by ClinicOS',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )

  return doc
}
