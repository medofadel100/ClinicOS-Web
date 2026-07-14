import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AddPatientDialog from './AddPatientDialog'

export default async function PatientsPage({
  params: { locale, clinicId },
  searchParams
}: {
  params: { locale: string; clinicId: string },
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const query = searchParams.q || ''

  // Fetch patients
  let dbQuery = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('registered_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
  }

  const { data: patients } = await dbQuery

  // Fetch active campaigns
  const { data: activeCampaignsData } = await supabase
    .from('marketing_campaigns')
    .select('id, name')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    
  const activeCampaigns = activeCampaignsData || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your clinic&apos;s patient records.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <form className="flex items-center gap-2" action={`/${locale}/${clinicId}/patients`} method="GET">
            <Input 
              name="q" 
              type="search" 
              placeholder="Search name or phone..." 
              defaultValue={query}
              className="w-64"
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          <AddPatientDialog clinicId={clinicId} locale={locale} activeCampaigns={activeCampaigns} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              patients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.full_name}</TableCell>
                  <TableCell>{patient.phone || '-'}</TableCell>
                  <TableCell>{patient.date_of_birth || '-'}</TableCell>
                  <TableCell>{new Date(patient.registered_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <a href={`/${locale}/${clinicId}/patients/${patient.id}`} className="text-primary hover:underline text-sm font-medium">
                      View File
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
