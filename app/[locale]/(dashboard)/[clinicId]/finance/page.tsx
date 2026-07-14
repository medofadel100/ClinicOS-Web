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
import LogExpenseDialog from './LogExpenseDialog'
import { Button } from '@/components/ui/button'
import { payOccurrence } from './actions'

export default async function FinancePage({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Double check authorization on the server side
  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
    
  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember?.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    redirect(`/${locale}/${clinicId}`)
  }

  // Fetch Revenue
  const { data: payments } = await supabase
    .from('patient_payments')
    .select('amount_egp')
    .eq('clinic_id', clinicId)

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount_egp), 0) || 0

  // Fetch Expenses
  const { data: expenses } = await supabase
    .from('clinic_expenses')
    .select(`
      *,
      expense_occurrences (*)
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  const clinicExpenses = expenses || []
  
  type ExpenseOccurrence = {
    id: string
    period_date: string
    amount_egp: number
    status: 'pending' | 'paid'
  }
  
  const allOccurrences = clinicExpenses.flatMap(e => 
    (e.expense_occurrences as unknown as ExpenseOccurrence[]).map(o => ({ ...o, expenseTitle: e.title, category: e.category }))
  )
  
  const totalExpenses = allOccurrences
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.amount_egp), 0)

  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinic Finance</h1>
          <p className="text-muted-foreground">High-level overview of revenue and expenses.</p>
        </div>
        <LogExpenseDialog clinicId={clinicId} locale={locale} />
      </div>

      {/* Aggregate Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString()} EGP
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {totalExpenses.toLocaleString()} EGP
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {netProfit.toLocaleString()} EGP
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Occurrences</CardTitle>
        </CardHeader>
        <CardContent>
          {allOccurrences.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No expenses logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Period Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOccurrences.sort((a, b) => new Date(b.period_date).getTime() - new Date(a.period_date).getTime()).map(occ => (
                  <TableRow key={occ.id}>
                    <TableCell className="font-medium">{occ.expenseTitle}</TableCell>
                    <TableCell className="capitalize">{occ.category}</TableCell>
                    <TableCell>{new Date(occ.period_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{occ.amount_egp} EGP</TableCell>
                    <TableCell>
                      {occ.status === 'paid' ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {occ.status === 'pending' && (
                        <form action={async () => {
                          'use server'
                          await payOccurrence(clinicId, locale, occ.id)
                        }}>
                          <Button size="sm" variant="outline">Mark as Paid</Button>
                        </form>
                      )}
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
