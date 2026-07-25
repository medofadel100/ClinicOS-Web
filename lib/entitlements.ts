export type EntitlementsResponse = {
  plan: string
  features: string[]
}

const FALLBACK_ENTITLEMENTS: EntitlementsResponse = {
  plan: 'Premium',
  features: ['dental_module', 'whatsapp_ai', 'whatsapp_rule_based'],
}

export async function checkEntitlements(clinicId: string): Promise<EntitlementsResponse> {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL

  if (!adminUrl) {
    console.warn('[Entitlements] NEXT_PUBLIC_ADMIN_URL is not set, returning fallback entitlements.')
    return FALLBACK_ENTITLEMENTS
  }

  try {
    const res = await fetch(`${adminUrl}/api/v1/entitlements/check?clinicId=${clinicId}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.warn(`[Entitlements] Admin API returned ${res.status}, defaulting to fallback entitlements.`)
      return FALLBACK_ENTITLEMENTS
    }

    const data: unknown = await res.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'plan' in data &&
      'features' in data
    ) {
      return data as EntitlementsResponse
    }

    console.warn('[Entitlements] Unexpected response shape from Admin API, using fallback.')
    return FALLBACK_ENTITLEMENTS
  } catch (err) {
    console.error('[Entitlements] Failed to connect to Admin API:', err)
    return FALLBACK_ENTITLEMENTS
  }
}
