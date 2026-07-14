'use client'

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
import EditPayrollDialog from './EditPayrollDialog'
import InviteStaffDialog from './InviteStaffDialog'
import { revokeStaffInvite } from './actions'

type StaffMembership = {
  id: string
  role: string
  staff_members: {
    id: string
    full_name: string
  }
  staff_payroll_config: {
    salary_type: 'fixed' | 'commission' | 'fixed_plus_commission'
    base_salary_egp: number | null
    commission_percentage: number | null
  }[]
}

type StaffInvite = {
  id: string
  invited_role: string
  status: string
  expires_at: string
  created_at: string
}

export default function StaffSettingsTab({
  clinicId,
  staffMemberships,
  staffInvites
}: {
  clinicId: string
  staffMemberships: StaffMembership[]
  staffInvites: StaffInvite[]
}) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pay Structure</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffMemberships.map(membership => {
              const config = membership.staff_payroll_config?.[0] || null
              
              let payStructure = 'Not Configured'
              if (config) {
                if (config.salary_type === 'fixed') payStructure = 'Fixed Base'
                if (config.salary_type === 'commission') payStructure = 'Commission Only'
                if (config.salary_type === 'fixed_plus_commission') payStructure = 'Base + Commission'
              }

              return (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">
                    {membership.staff_members.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {membership.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{payStructure}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {config?.salary_type === 'fixed' && `${config.base_salary_egp} EGP/mo`}
                    {config?.salary_type === 'commission' && `${config.commission_percentage}%`}
                    {config?.salary_type === 'fixed_plus_commission' && `${config.base_salary_egp} EGP + ${config.commission_percentage}%`}
                  </TableCell>
                  <TableCell className="text-right">
                    <EditPayrollDialog 
                      clinicId={clinicId}
                      membershipId={membership.id}
                      staffName={membership.staff_members.full_name}
                      currentConfig={config}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-8 pb-4">
        <div>
          <h3 className="text-lg font-medium">Pending & Historical Invites</h3>
          <p className="text-sm text-muted-foreground">Manage invitations sent to join your clinic.</p>
        </div>
        <InviteStaffDialog clinicId={clinicId} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires / Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffInvites.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No invites found.
                </TableCell>
              </TableRow>
            )}
            {staffInvites.map(invite => (
              <TableRow key={invite.id}>
                <TableCell className="capitalize">{invite.invited_role}</TableCell>
                <TableCell>
                  <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'pending' ? 'secondary' : 'destructive'}>
                    {invite.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(invite.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {invite.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => revokeStaffInvite(clinicId, invite.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
