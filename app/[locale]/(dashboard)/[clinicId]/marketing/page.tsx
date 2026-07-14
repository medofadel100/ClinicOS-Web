import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import CampaignDialog from './CampaignDialog'

export default async function MarketingPage({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!staffMember) redirect(`/${locale}/clinic-switcher`)

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    redirect(`/${locale}/${clinicId}`)
  }

  // Fetch campaigns and a count of patients
  const { data: campaignsData } = await supabase
    .from('marketing_campaigns')
    .select(`
      *,
      patients (count)
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  const campaigns = campaignsData || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Tracking</h1>
          <p className="text-muted-foreground">Manage campaigns and track patient acquisition ROI.</p>
        </div>
        <CampaignDialog clinicId={clinicId} locale={locale} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No marketing campaigns found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Patients Acquired</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(camp => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-medium">{camp.name}</TableCell>
                    <TableCell>{camp.platform}</TableCell>
                    <TableCell>
                      {camp.start_date ? new Date(camp.start_date).toLocaleDateString() : 'N/A'} - 
                      {camp.end_date ? new Date(camp.end_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{camp.budget_egp ? `${camp.budget_egp} EGP` : '-'}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {/* @ts-expect-error count is an array containing an object */}
                      {camp.patients?.[0]?.count || 0}
                    </TableCell>
                    <TableCell>
                      {camp.is_active 
                        ? <Badge className="bg-green-100 text-green-800" variant="secondary">Active</Badge> 
                        : <Badge variant="secondary">Inactive</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <CampaignDialog 
                        clinicId={clinicId} 
                        locale={locale} 
                        campaign={{
                          ...camp,
                          patients: undefined // strip out relation to match type
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
