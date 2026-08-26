import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { money } from '@/lib/admin/data'

export default async function AdminBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: booking } = await supabase.from('bookings').select('*, users(name, email, mobile), sports(name), payments(*)').eq('id', id).maybeSingle()
  if (!booking) notFound()
  const rows = [['Reference', booking.booking_reference], ['Customer', booking.users?.name || '—'], ['Mobile', booking.users?.mobile || '—'], ['Email', booking.users?.email || '—'], ['Sport', booking.sports?.name || '—'], ['Date', booking.booking_date], ['Time', `${booking.start_time.slice(0,5)}–${booking.end_time.slice(0,5)}`], ['Duration', `${booking.duration} hour(s)`], ['Amount', money(booking.amount)], ['Payment', booking.payment_status], ['Booking status', booking.booking_status]]
  return <div className="flex max-w-3xl flex-col gap-8"><Link href="/admin/bookings" className="text-xs font-black uppercase tracking-wider text-primary hover:underline">← Back to bookings</Link><header><span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Booking record</span><h1 className="mt-2 font-heading text-3xl font-black uppercase text-foreground">{booking.booking_reference}</h1><div className="mt-3 flex gap-2"><Badge>{booking.booking_status}</Badge><Badge>{booking.payment_status}</Badge></div></header><div className="grid gap-px border-[2px] border-border bg-border sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="bg-card p-5"><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-sm font-bold text-foreground">{value}</p></div>)}</div><p className="text-sm text-muted-foreground">Cancellation and refund actions are disabled until the business policy is confirmed.</p></div>
}
