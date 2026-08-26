import Link from 'next/link'
import { Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/state'
import { createClient } from '@/lib/supabase/server'
import { money } from '@/lib/admin/data'

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const [{ data: users }, { data: bookings }] = await Promise.all([supabase.from('users').select('id, name, email, mobile, role, created_at').order('created_at', { ascending: false }), supabase.from('bookings').select('user_id, amount, booking_date, booking_status').order('booking_date', { ascending: false })])
  const stats = new Map<string, { count: number; spent: number; last: string | null }>()
  for (const b of bookings ?? []) { const s = stats.get(b.user_id) ?? { count: 0, spent: 0, last: null }; s.count++; if (b.booking_status !== 'cancelled') s.spent += Number(b.amount); s.last ??= b.booking_date; stats.set(b.user_id, s) }
  return <div className="flex flex-col gap-8"><header><span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin / People</span><h1 className="mt-2 font-heading text-3xl font-black uppercase text-foreground">Customers</h1><p className="mt-2 text-sm text-muted-foreground">Account activity and booking value.</p></header>{!users?.length ? <EmptyState icon={Users} title="No customers yet" description="Registered customers will appear here." /> : <div className="overflow-x-auto border-[2px] border-border bg-card"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b-[2px] border-border bg-card-secondary text-[10px] font-black uppercase tracking-wider text-muted-foreground"><tr>{['Customer','Mobile','Email','Bookings','Total spent','Last booking'].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody>{users.map((u) => { const s = stats.get(u.id) ?? { count: 0, spent: 0, last: null }; return <tr key={u.id} className="border-b border-border last:border-0"><td className="px-5 py-4"><Link href={`/admin/customers/${u.id}`} className="font-bold text-primary hover:underline">{u.name || 'Unnamed customer'}</Link></td><td className="px-5 py-4 text-muted-foreground">{u.mobile || '—'}</td><td className="px-5 py-4 text-muted-foreground">{u.email}</td><td className="px-5 py-4 font-black text-foreground">{s.count}</td><td className="px-5 py-4 font-black text-foreground">{money(s.spent)}</td><td className="px-5 py-4 text-muted-foreground">{s.last || '—'}</td></tr> })}</tbody></table></div>}</div>
}
