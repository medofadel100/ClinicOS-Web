import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const getClinicId = cache(async (slug: string) => {
  const supabase = createClient()
  
  // Try treating the string as a UUID first (backward compatibility or raw ID usage)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  if (isUuid) {
    const { data } = await supabase.from('clinics').select('id').eq('id', slug).single()
    return data?.id || null
  }

  // Otherwise, lookup by slug
  const { data } = await supabase.from('clinics').select('id').eq('slug', slug).single()
  return data?.id || null
})

export const requireClinicId = async (slug: string) => {
  const id = await getClinicId(slug)
  if (!id) notFound()
  return id
}
