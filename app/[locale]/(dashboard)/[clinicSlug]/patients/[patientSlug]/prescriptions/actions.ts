'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendMessage } from '@/lib/whatsapp-client'

async function verifyAccess(clinicId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!staffMember) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) throw new Error('Forbidden')

  return { supabase, staffMember, membership }
}

export async function smartSearchMedications(clinicId: string, query: string) {
  const { supabase } = await verifyAccess(clinicId)

  // 1. Search Global Medications (Arabic-normalized: hamza variants, partial/full names)
  const { data: globalMeds } = (await supabase
    .rpc('search_medications', { p_query: query })) as { data: any[] | null }

  // 2. Search Custom Clinic Medications (ones without a global ID)
  const { data: customMeds } = (await supabase
    .rpc('search_clinic_medications', { p_clinic: clinicId, p_query: query })) as { data: any[] | null }

  // 3. Map globalMeds to see if they ALREADY exist in clinic_medications
  let existingGlobalMedsInClinic: any[] = []
  if (globalMeds && globalMeds.length > 0) {
    const globalIds = globalMeds.map(m => m.id)
    const { data } = await supabase
      .from('clinic_medications')
      .select('id, medication_global_id, default_dosage, default_frequency, default_duration')
      .eq('clinic_id', clinicId)
      .in('medication_global_id', globalIds)
    existingGlobalMedsInClinic = data || []
  }

  const results = []

  // Format Global Meds
  if (globalMeds) {
    for (const gMed of globalMeds) {
      const existing = existingGlobalMedsInClinic.find(c => c.medication_global_id === gMed.id)
      results.push({
        type: existing ? 'existing_global' : 'new_global',
        clinic_medication_id: existing?.id || null,
        medication_global_id: gMed.id,
        brandName: gMed.brand_name_en,
        brandNameAr: gMed.brand_name_ar || '',
        genericName: gMed.generic_name,
        genericNameAr: gMed.generic_name_ar || '',
        dosage: existing?.default_dosage || '',
        frequency: existing?.default_frequency || '',
        duration: existing?.default_duration || '',
        original: gMed
      })
    }
  }

  // Format Custom Meds
  if (customMeds) {
    for (const cMed of customMeds) {
      results.push({
        type: 'custom',
        clinic_medication_id: cMed.id,
        medication_global_id: null,
        brandName: cMed.custom_brand_name,
        brandNameAr: '',
        genericName: cMed.custom_generic_name,
        genericNameAr: '',
        dosage: cMed.default_dosage || '',
        frequency: cMed.default_frequency || '',
        duration: cMed.default_duration || '',
        original: cMed
      })
    }
  }

  return results
}

export async function ensureClinicMedication(clinicId: string, globalMedId: string) {
  const { supabase } = await verifyAccess(clinicId)
  
  const { data: existing } = await supabase
    .from('clinic_medications')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('medication_global_id', globalMedId)
    .maybeSingle()
    
  if (existing) return existing.id
  
  const { data: inserted, error } = await supabase
    .from('clinic_medications')
    .insert([{ clinic_id: clinicId, medication_global_id: globalMedId }])
    .select('id')
    .single()
    
  if (error) throw error
  return inserted.id
}

export async function getMedicationAlternatives(genericName: string) {
  const supabase = createClient()
  const { data, error } = (await supabase
    .rpc('search_medications_by_generic', { p_query: genericName })) as { data: any[] | null, error: any }

  if (error) throw error
  return data || []
}

export async function savePrescription(
  clinicId: string, 
  patientId: string, 
  items: any[], 
  notes: string = ''
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  // 1. Create prescription record
  const { data: rx, error: rxError } = await supabase
    .from('patient_prescriptions')
    .insert([{
      clinic_id: clinicId,
      patient_id: patientId,
      doctor_id: staffMember.id,
      notes
    }])
    .select()
    .single()

  if (rxError) throw rxError

  // 2. Insert items
  const itemsToInsert = items.map(item => ({
    prescription_id: rx.id,
    clinic_medication_id: item.clinic_medication_id,
    dosage: item.dosage,
    frequency: item.frequency,
    timing: item.timing,
    duration: item.duration,
    instructions: item.instructions
  }))

  const { error: itemsError } = await supabase
    .from('patient_prescription_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // Rollback
    await supabase.from('patient_prescriptions').delete().eq('id', rx.id)
    throw itemsError
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/prescriptions', 'page')
  return rx
}

export async function getPatientPrescriptions(clinicId: string, patientId: string) {
  const { supabase } = await verifyAccess(clinicId)

  const { data, error } = await supabase
    .from('patient_prescriptions')
    .select(`
      *,
      staff_members ( full_name ),
      patient_prescription_items (
        *,
        clinic_medications (
          custom_brand_name,
          custom_generic_name,
          concentration,
          medications_global (
            brand_name_en,
            brand_name_ar,
            generic_name,
            concentration
          )
        )
      )
    `)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function savePrescriptionTemplate(
  clinicId: string,
  templateName: string,
  items: any[]
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { data: template, error: tmplError } = await supabase
    .from('prescription_templates')
    .insert([{
      clinic_id: clinicId,
      doctor_id: staffMember.id,
      template_name: templateName
    }])
    .select()
    .single()

  if (tmplError) throw tmplError

  const itemsToInsert = items.map(item => ({
    template_id: template.id,
    clinic_medication_id: item.clinic_medication_id,
    dosage: item.dosage,
    frequency: item.frequency,
    timing: item.timing,
    duration: item.duration,
    instructions: item.instructions
  }))

  const { error: itemsError } = await supabase
    .from('prescription_template_items')
    .insert(itemsToInsert)

  if (itemsError) {
    await supabase.from('prescription_templates').delete().eq('id', template.id)
    throw itemsError
  }

  return template
}

export async function getPrescriptionTemplates(clinicId: string) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { data, error } = await supabase
    .from('prescription_templates')
    .select(`
      *,
      prescription_template_items (
        *,
        clinic_medications (
          custom_brand_name,
          custom_generic_name,
          concentration,
          medications_global (
            brand_name_en,
            brand_name_ar,
            generic_name,
            concentration
          )
        )
      )
    `)
    .eq('clinic_id', clinicId)
    .eq('doctor_id', staffMember.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Sends a prescription to the patient's WhatsApp through the clinic's
 * connected WhatsApp session (the real send API, not just a wa.me deep link).
 */
export async function sendPrescriptionWhatsApp(clinicId: string, locale: string, prescriptionId: string) {
  const { supabase } = await verifyAccess(clinicId)
  const isAr = locale === 'ar'

  const { data: rx, error: rxError } = await supabase
    .from('patient_prescriptions')
    .select(`
      id, created_at, notes,
      patients ( id, full_name, phone ),
      staff_members ( full_name ),
      patient_prescription_items (
        dosage, frequency, timing, duration, instructions,
        clinic_medications (
          custom_brand_name,
          custom_generic_name,
          medications_global ( brand_name_ar, brand_name_en, generic_name )
        )
      )
    `)
    .eq('id', prescriptionId)
    .eq('clinic_id', clinicId)
    .single()

  if (rxError || !rx) throw new Error('Prescription not found')

  const patient: any = Array.isArray(rx.patients) ? rx.patients[0] : rx.patients
  const phone = patient?.phone?.replace(/[^0-9+]/g, '') || ''
  if (!phone) throw new Error(isAr ? 'لا يوجد رقم هاتف مسجل لهذا المريض' : 'No phone number on file for this patient')

  const normalizePhone = (p: string): string => {
    if (p.startsWith('+')) return p
    if (p.startsWith('0020')) return `+${p.slice(2)}`
    if (p.startsWith('0')) return `+20${p.slice(1)}`
    return `+20${p}`
  }

  const doctorName = (Array.isArray(rx.staff_members) ? rx.staff_members[0] : rx.staff_members)?.full_name

  const lines: string[] = []
  lines.push('┌──────────────────────────┐')
  lines.push('   Rosheta')
  lines.push('└──────────────────────────┘')
  lines.push('')
  lines.push(isAr ? `المريض: ${patient?.full_name}` : `Patient: ${patient?.full_name}`)
  lines.push(isAr ? `التاريخ: ${new Date(rx.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}` : `Date: ${new Date(rx.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}`)
  if (doctorName) lines.push(isAr ? `الطبيب: ${doctorName}` : `Doctor: ${doctorName}`)
  lines.push('')

  rx.patient_prescription_items.forEach((item: any, i: number) => {
    const med = item.clinic_medications
    const global = med?.medications_global
    const name = isAr ? (global?.brand_name_ar || global?.brand_name_en || med?.custom_brand_name || '') : (global?.brand_name_en || med?.custom_brand_name || '')
    const generic = global?.generic_name || med?.custom_generic_name || ''
    lines.push(`${i + 1}. ${name}${generic ? ` (${generic})` : ''}`)
    if (item.dosage) lines.push(`   ${isAr ? 'الجرعة' : 'Dose'}: ${item.dosage}`)
    if (item.frequency) lines.push(`   ${isAr ? 'التكرار' : 'Freq'}: ${item.frequency}`)
    if (item.timing) lines.push(`   ${isAr ? 'التوقيت' : 'Timing'}: ${item.timing}`)
    if (item.duration) lines.push(`   ${isAr ? 'المدة' : 'Duration'}: ${item.duration}`)
    if (item.instructions) lines.push(`   ${isAr ? 'ملاحظة' : 'Note'}: ${item.instructions}`)
    lines.push('')
  })

  if (rx.notes) lines.push(`${isAr ? 'ملاحظات: ' : 'Notes: '}${rx.notes}`)

  await sendMessage(clinicId, normalizePhone(phone), lines.join('\n'))

  return { success: true }
}
