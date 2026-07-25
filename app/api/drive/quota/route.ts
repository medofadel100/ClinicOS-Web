import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinicId')
    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
    }

    // Verify staff membership
    const { data: staffMember } = await supabase
      .from('staff_members')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!staffMember) {
      return NextResponse.json({ error: 'Not found' }, { status: 403 })
    }

    const { data: membership } = await supabase
      .from('clinic_staff_memberships')
      .select('role')
      .eq('staff_member_id', staffMember.id)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Get quota setting
    const { data: quotaSetting } = await supabase
      .from('clinic_settings')
      .select('setting_value')
      .eq('clinic_id', clinicId)
      .eq('setting_key', 'storage_quota_mb')
      .single()

    const quotaMB = parseInt(quotaSetting?.setting_value || '15000', 10)

    // Get storage usage per category
    const { data: files } = await supabase
      .from('patient_uploaded_files')
      .select('file_size, category, storage_provider')
      .eq('clinic_id', clinicId)

    const totalUsedBytes = (files || []).reduce((sum, f) => sum + (f.file_size || 0), 0)

    const byCategory = {
      xray: (files || []).filter(f => f.category === 'xray').reduce((s, f) => s + (f.file_size || 0), 0),
      lab: (files || []).filter(f => f.category === 'lab').reduce((s, f) => s + (f.file_size || 0), 0),
      prescription: (files || []).filter(f => f.category === 'prescription').reduce((s, f) => s + (f.file_size || 0), 0),
    }

    const totalFiles = (files || []).length

    return NextResponse.json({
      quotaMB,
      quotaGB: Math.round(quotaMB / 1024 * 100) / 100,
      usedMB: Math.round(totalUsedBytes / (1024 * 1024) * 100) / 100,
      usedGB: Math.round(totalUsedBytes / (1024 * 1024 * 1024) * 100) / 100,
      usedBytes: totalUsedBytes,
      percentUsed: Math.round((totalUsedBytes / (quotaMB * 1024 * 1024)) * 100),
      byCategory: {
        xray: Math.round(byCategory.xray / (1024 * 1024) * 100) / 100,
        lab: Math.round(byCategory.lab / (1024 * 1024) * 100) / 100,
        prescription: Math.round(byCategory.prescription / (1024 * 1024) * 100) / 100,
      },
      totalFiles,
    })
  } catch (error) {
    console.error('[Quota Error]', error)
    return NextResponse.json({ error: 'Failed to get quota' }, { status: 500 })
  }
}
