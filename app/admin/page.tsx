import { CalendarClock, IndianRupee, ListChecks, Repeat2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/state'
import { createClient } from '@/lib/supabase/server'
import { getAdminMetrics, getAdminBookings, money } from '@/lib/admin/data'

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics()
  const { bookings } = await getAdminBookings({ date: new Date().toISOString().slice(0, 10) })
  const cards = [
    [CalendarClock, 'Today\'s bookings', metrics.todayBookings], [ListChecks, 'Upcoming bookings', metrics.upcoming], [CalendarClock, 'Total bookings', metrics.total], [IndianRupee, 'Today\'s revenue', money(metrics.revenue)], [Repeat2, 'Repeat customers', metrics.repeatCustomers],
  ] as const
  return <div className="flex flex-col gap-8">
    <header><span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin / Control room</span><h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">Overview</h1><p className="mt-2 text-sm text-muted-foreground">Live operational snapshot for {new Date().toISOString().slice(0, 10)}.</p></header>
    <div className="grid gap-[2px] bg-border sm:grid-cols-2 lg:grid-cols-5">{cards.map(([Icon, label, value]) => <div key={label} className="flex flex-col bg-card p-5"><Icon className="size-4 text-primary" /><p className="mt-4 font-heading text-2xl font-black text-foreground">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p></div>)}</div>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">Today&apos;s schedule</h2><Link href="/admin/bookings" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">View all</Link></div>{bookings.length === 0 ? <EmptyState title="No bookings today" description="New reservations will appear here." /> : <div className="border-[2px] border-border bg-card">{bookings.map((booking: any) => <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 border-b-[2px] border-border px-5 py-4 last:border-0"><div><p className="font-heading text-sm font-bold uppercase text-foreground">{booking.booking_reference}</p><p className="text-xs text-muted-foreground">{booking.users?.name ?? 'Customer'} · {booking.sports?.name ?? 'Sport'} · {booking.start_time.slice(0, 5)}–{booking.end_time.slice(0, 5)}</p></div><div className="flex items-center gap-4"><span className="font-heading font-black text-foreground">{money(booking.amount)}</span><Badge>{booking.booking_status}</Badge></div></div>)}</div>}</section>
  </div>
}

