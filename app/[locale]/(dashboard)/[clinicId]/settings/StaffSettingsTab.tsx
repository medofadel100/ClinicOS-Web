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
import EditPayrollDialog from './EditPayrollDialog'

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

export default function StaffSettingsTab({
  clinicId,
  staffMemberships
}: {
  clinicId: string
  staffMemberships: StaffMembership[]
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
    </div>
  )
}
