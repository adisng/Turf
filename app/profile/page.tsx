import { AccountShell } from '@/components/layout/account-shell'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fullName = ''
  let phone = ''
  let marketingOptIn = false

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, mobile')
      .eq('id', user.id)
      .single()
    fullName = profile?.name ?? ''
    phone = profile?.mobile ?? ''
    const { data: marketingContact } = await supabase
      .from('marketing_contacts')
      .select('marketing_opt_in')
      .eq('user_id', user.id)
      .maybeSingle()
    marketingOptIn = marketingContact?.marketing_opt_in ?? false
  }

  return (
    <AccountShell>
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Profile</span>
          <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">Your details</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Personal information used for booking confirmations and receipts.
          </p>
        </div>

        <ProfileForm email={user?.email ?? ''} initialFullName={fullName} initialPhone={phone} initialMarketingOptIn={marketingOptIn} />
      </div>
    </AccountShell>
  )
}
