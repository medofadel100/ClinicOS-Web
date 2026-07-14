'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  if (!membership) {
    throw new Error('Forbidden')
  }

  return { supabase, staffMember, membership }
}

export async function createInventoryItem(
  clinicId: string,
  locale: string,
  name: string,
  unit: string,
  minThreshold: number,
  category: string
) {
  const { supabase } = await verifyAccess(clinicId)

  const { error } = await supabase
    .from('medical_inventory_items')
    .insert({
      clinic_id: clinicId,
      name,
      unit,
      quantity_on_hand: 0,
      min_threshold: minThreshold,
      category: category || null
    })

  if (error) {
    console.error('Failed to create inventory item:', error)
    throw new Error('Failed to create inventory item')
  }

  revalidatePath(`/${locale}/${clinicId}/inventory`)
}

export async function logTransaction(
  clinicId: string,
  locale: string,
  itemId: string,
  changeQuantity: number,
  transactionType: 'restock' | 'usage' | 'adjustment',
  note: string
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  // Insert transaction
  // The PostgreSQL trigger trg_update_inventory_quantity will automatically update quantity_on_hand
  const { error } = await supabase
    .from('inventory_transactions')
    .insert({
      clinic_id: clinicId,
      item_id: itemId,
      change_quantity: changeQuantity,
      transaction_type: transactionType,
      note: note || null,
      created_by: staffMember.id
    })

  if (error) {
    console.error('Failed to log transaction:', error)
    throw new Error('Failed to log inventory transaction')
  }

  revalidatePath(`/${locale}/${clinicId}/inventory`)
}
