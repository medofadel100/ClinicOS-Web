export type EntitlementsResponse = {
  plan: string
  features: string[]
}

const FALLBACK_ENTITLEMENTS: EntitlementsResponse = {
  plan: 'free',
  features: [],
}

export async function checkEntitlements(clinicId: string): Promise<EntitlementsResponse> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const { data: sub } = await supabase
      .from('clinic_subscriptions')
      .select('plan_id')
      .eq('clinic_id', clinicId)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!sub) return FALLBACK_ENTITLEMENTS

    const { data: plan } = await supabase
      .from('plans')
      .select('code')
      .eq('id', sub.plan_id)
      .single()

    const { data: planFeatures } = await supabase
      .from('plan_features')
      .select('feature_id, features!inner(code)')
      .eq('plan_id', sub.plan_id)

    const featureCodes = (planFeatures ?? [])
      .map((pf: any) => pf.features?.code)
      .filter(Boolean) as string[]

    return {
      plan: plan?.code || 'free',
      features: featureCodes,
    }
  } catch (err) {
    console.error('[Entitlements] Failed to check entitlements:', err)
    return FALLBACK_ENTITLEMENTS
  }
}
