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
  staffInvites,
  locale
}: {
  clinicId: string
  staffMemberships: StaffMembership[]
  staffInvites: StaffInvite[]
  locale: string
}) {
  const isAr = locale === 'ar'

  const t = {
    staffMember: isAr ? 'عضو الفريق' : 'Staff Member',
    role: isAr ? 'الدور' : 'Role',
    payStructure: isAr ? 'هيكل الراتب' : 'Pay Structure',
    details: isAr ? 'التفاصيل' : 'Details',
    actions: isAr ? 'الإجراءات' : 'Actions',
    notConfigured: isAr ? 'غير مُعد' : 'Not Configured',
    fixedBase: isAr ? 'راتب ثابت' : 'Fixed Base',
    commissionOnly: isAr ? 'عمولة فقط' : 'Commission Only',
    baseCommission: isAr ? 'راتب + عمولة' : 'Base + Commission',
    managePay: isAr ? 'إدارة الراتب' : 'Manage Pay',
    pendingInvites: isAr ? 'الدعوات المعلقة والسابقة' : 'Pending & Historical Invites',
    pendingInvitesDesc: isAr ? 'إدارة الدعوات المرسلة للانضمام لعيادتك.' : 'Manage invitations sent to join your clinic.',
    inviteTeam: isAr ? 'دعوة عضو فريق' : 'Invite Team Member',
    inviteStatus: isAr ? 'الحالة' : 'Status',
    inviteExpires: isAr ? 'الانتهاء / التاريخ' : 'Expires / Date',
    noInvites: isAr ? 'لا توجد دعوات.' : 'No invites found.',
    revoke: isAr ? 'إلغاء' : 'Revoke',
  }

  const getPayLabel = (config: StaffMembership['staff_payroll_config'][0] | null) => {
    if (!config) return t.notConfigured
    if (config.salary_type === 'fixed') return t.fixedBase
    if (config.salary_type === 'commission') return t.commissionOnly
    return t.baseCommission
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.staffMember}</TableHead>
              <TableHead>{t.role}</TableHead>
              <TableHead>{t.payStructure}</TableHead>
              <TableHead>{t.details}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffMemberships.map(membership => {
              const config = membership.staff_payroll_config?.[0] || null

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
                  <TableCell>{getPayLabel(config)}</TableCell>
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
                      locale={locale}
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
          <h3 className="text-lg font-medium">{t.pendingInvites}</h3>
          <p className="text-sm text-muted-foreground">{t.pendingInvitesDesc}</p>
        </div>
        <InviteStaffDialog clinicId={clinicId} locale={locale} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.role}</TableHead>
              <TableHead>{t.inviteStatus}</TableHead>
              <TableHead>{t.inviteExpires}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffInvites.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t.noInvites}
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
                      {t.revoke}
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
