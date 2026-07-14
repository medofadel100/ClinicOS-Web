import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Button } from '@/components/ui/button'
import RequestLeaveDialog from './RequestLeaveDialog'
import { reviewLeaveRequest } from './actions'

export default async function HRPage({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!staffMember) redirect(`/${locale}/clinic-switcher`)

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('id, role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) redirect(`/${locale}/clinic-switcher`)

  const isOwnerOrAdmin = membership.role === 'owner' || membership.role === 'admin'

  // Fetch My Entitlements
  const { data: entitlements } = await supabase
    .from('staff_entitlements')
    .select('*')
    .eq('membership_id', membership.id)

  const myEntitlements = entitlements || []

  // Fetch My Requests
  const { data: myRequestsData } = await supabase
    .from('staff_leave_requests')
    .select('*')
    .eq('membership_id', membership.id)
    .order('created_at', { ascending: false })

  const myRequests = myRequestsData || []

  // If Admin, Fetch All Pending Requests
  let pendingApprovals: {
    id: string
    clinic_id: string
    leave_type: string
    start_date: string
    end_date: string
    reason: string | null
    clinic_staff_memberships: {
      staff_members: {
        full_name: string
      } | null
    } | null
  }[] = []
  if (isOwnerOrAdmin) {
    const { data: pendingData } = await supabase
      .from('staff_leave_requests')
      .select(`
        *,
        clinic_staff_memberships (
          staff_members (
            full_name
          )
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    pendingApprovals = pendingData || []
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
          <p className="text-muted-foreground">Manage your time off and view approvals.</p>
        </div>
        <RequestLeaveDialog clinicId={clinicId} locale={locale} />
      </div>

      <Tabs defaultValue="my-leave" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-leave">My Leave</TabsTrigger>
          {isOwnerOrAdmin && (
            <TabsTrigger value="approvals">
              Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 rounded-full bg-destructive w-5 h-5 text-[10px] inline-flex items-center justify-center text-white">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-leave" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Annual Leave Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myEntitlements.find(e => e.leave_type === 'annual')?.days_used || 0} Days
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sick Leave Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myEntitlements.find(e => e.leave_type === 'sick')?.days_used || 0} Days
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unpaid Leave Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myEntitlements.find(e => e.leave_type === 'unpaid')?.days_used || 0} Days
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">You haven&apos;t requested any time off yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequests.map(req => (
                      <TableRow key={req.id}>
                        <TableCell className="capitalize font-medium">{req.leave_type}</TableCell>
                        <TableCell>
                          {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.reason || '-'}</TableCell>
                        <TableCell>
                          {req.status === 'approved' && <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>}
                          {req.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                          {req.status === 'pending' && <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isOwnerOrAdmin && (
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending leave requests.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            {req.clinic_staff_memberships?.staff_members?.full_name}
                          </TableCell>
                          <TableCell className="capitalize">{req.leave_type}</TableCell>
                          <TableCell>
                            {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{req.reason || '-'}</TableCell>
                          <TableCell className="text-right">
                            <form className="flex justify-end gap-2">
                              <Button formAction={async () => {
                                'use server'
                                await reviewLeaveRequest(clinicId, locale, req.id, 'rejected')
                              }} size="sm" variant="destructive">Reject</Button>
                              <Button formAction={async () => {
                                'use server'
                                await reviewLeaveRequest(clinicId, locale, req.id, 'approved')
                              }} size="sm" variant="default" className="bg-green-600 hover:bg-green-700">Approve</Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
