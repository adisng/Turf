import { Download, MessageCircle } from 'lucide-react'

import { EmptyState } from '@/components/ui/state'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

export default async function MarketingContactsPage() {
  const supabase = await createClient()
  const { data: contacts, error } = await supabase
    .from('marketing_contacts')
    .select('id, name, email, whatsapp_number, marketing_opt_in, consent_at, opted_out_at, created_at')
    .order('created_at', { ascending: false })

  const optedIn = contacts?.filter((contact) => contact.marketing_opt_in) ?? []

  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin / Marketing</span>
        <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">WhatsApp contacts</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Only customers who explicitly opted in may receive marketing messages. Supabase is the source of truth; configured contacts are mirrored to Google Sheets.
        </p>
      </header>

      {error ? (
        <div className="border-[2px] border-warning/40 bg-warning/5 p-5 text-sm text-muted-foreground">
          Run <code className="font-mono text-foreground">supabase/20260914_marketing_contacts.sql</code> in Supabase before using this page.
        </div>
      ) : !contacts?.length ? (
        <EmptyState icon={MessageCircle} title="No marketing contacts yet" description="Opted-in customers will appear here after they confirm registration or update their profile." />
      ) : (
        <>
          <div className="grid gap-[2px] bg-border sm:grid-cols-2">
            <Stat label="Opted in" value={String(optedIn.length)} detail="Eligible for WhatsApp campaigns" />
            <Stat label="Opted out" value={String(contacts.length - optedIn.length)} detail="Keep these contacts excluded" />
          </div>
          <a
            href={`/api/admin/marketing-contacts.csv`}
            className="inline-flex w-fit items-center gap-2 border-[2px] border-primary bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground"
          >
            <Download className="size-4" /> Download opted-in CSV
          </a>
          <div className="overflow-x-auto border-[2px] border-border bg-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b-[2px] border-border bg-card-secondary text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>{['Customer', 'WhatsApp', 'Email', 'Consent', 'Updated'].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 font-bold text-foreground">{contact.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">+91 {contact.whatsapp_number}</td>
                    <td className="px-5 py-4 text-muted-foreground">{contact.email}</td>
                    <td className="px-5 py-4"><Badge variant={contact.marketing_opt_in ? 'success' : 'destructive'}>{contact.marketing_opt_in ? 'Opted in' : 'Opted out'}</Badge></td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(contact.marketing_opt_in ? contact.consent_at ?? contact.created_at : contact.opted_out_at ?? contact.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="bg-card p-6"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{label}</p><p className="mt-2 font-heading text-3xl font-black text-foreground">{value}</p><p className="mt-2 text-sm text-muted-foreground">{detail}</p></div>
}
