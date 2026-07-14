import { createClient } from '@/lib/supabase/server'

export type EntitlementsResponse = {
  plan: string;
  features: string[];
}

export async function checkEntitlements(clinicId: string): Promise<EntitlementsResponse> {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000'
  
  try {
    const res = await fetch(`${adminUrl}/api/v1/entitlements/check?clinicId=${clinicId}`, {
      next: { revalidate: 3600 }, // cache for 1 hour to reduce load, or adjust as needed
    })
    
    if (!res.ok) {
      console.warn('Failed to fetch entitlements from Admin API, defaulting to generous mock.')
      return { plan: 'Premium', features: ['dental_module', 'whatsapp_ai', 'whatsapp_rule_based'] }
    }
    
    const data = await res.json()
    return data as EntitlementsResponse
  } catch (err) {
    console.error('Error connecting to Admin API:', err)
    // Fallback for local development when Admin is not running
    return { plan: 'Free', features: [] }
  }
}
