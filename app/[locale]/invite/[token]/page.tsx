import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InviteAcceptForm from './InviteAcceptForm'

export default async function InvitePage({
  params: { locale, token }
}: {
  params: { locale: string; token: string }
}) {
  const supabase = createClient()

  const { data: invite } = await supabase
    .from('staff_invites')
    .select(`
      *,
      clinics (
        id,
        name
      )
    `)
    .eq('invite_token', token)
    .single()

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold text-destructive">Invalid Invitation</h1>
          <p className="text-muted-foreground">This invitation link is invalid or has been revoked.</p>
        </div>
      </div>
    )
  }

  if (invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold text-destructive">Expired Invitation</h1>
          <p className="text-muted-foreground">This invitation link has expired or has already been used.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="max-w-md w-full">
        <InviteAcceptForm locale={locale} invite={invite} />
      </div>
    </div>
  )
}
