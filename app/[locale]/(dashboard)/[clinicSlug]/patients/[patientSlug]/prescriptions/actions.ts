'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  // 1. Search Global Medications
  const { data: globalMeds } = await supabase
    .from('medications_global')
    .select('*')
    .or(`brand_name_en.ilike.%${query}%,brand_name_ar.ilike.%${query}%,generic_name.ilike.%${query}%`)
    .limit(15)

  // 2. Search Custom Clinic Medications (ones without a global ID)
  const { data: customMeds } = await supabase
    .from('clinic_medications')
    .select('*')
    .eq('clinic_id', clinicId)
    .is('medication_global_id', null)
    .or(`custom_brand_name.ilike.%${query}%,custom_generic_name.ilike.%${query}%`)
    .limit(10)

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
        genericName: gMed.generic_name,
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
        genericName: cMed.custom_generic_name,
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
  const { data, error } = await supabase
    .from('medications_global')
    .select('*')
    .ilike('generic_name', genericName)
    .limit(20)
    
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
