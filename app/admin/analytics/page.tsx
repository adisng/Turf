import { BarChart3, CalendarDays, IndianRupee, Users } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('sport_id, booking_date, total_amount, status')
    .order('booking_date', { ascending: true })

  const rows = bookings ?? []
  const confirmed = rows.filter((booking) => booking.status === 'confirmed' || booking.status === 'completed')
  const revenue = confirmed.reduce((sum, booking) => sum + booking.total_amount, 0)
  const sportCounts = confirmed.reduce<Record<string, number>>((counts, booking) => {
    counts[booking.sport_id] = (counts[booking.sport_id] ?? 0) + 1
    return counts
  }, {})
  const maxCount = Math.max(1, ...Object.values(sportCounts))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin</span>
        <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">A live read on confirmed demand and revenue.</p>
      </div>

      <div className="grid gap-[2px] bg-border sm:grid-cols-3">
        <Metric icon={CalendarDays} label="Completed bookings" value={String(confirmed.length)} />
        <Metric icon={IndianRupee} label="Tracked revenue" value={`₹${revenue.toLocaleString('en-IN')}`} />
        <Metric icon={Users} label="All booking records" value={String(rows.length)} />
      </div>

      <div className="border-[2px] border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="font-heading text-base font-bold uppercase tracking-wide text-foreground">Bookings by sport</h2>
        </div>
        <div className="mt-6 flex flex-col gap-5">
          {Object.keys(sportCounts).length ? Object.entries(sportCounts).map(([sport, count]) => (
            <div key={sport}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold uppercase tracking-wider text-muted-foreground">{sport}</span>
                <span className="font-heading font-black text-foreground">{count}</span>
              </div>
              <div className="h-3 overflow-hidden bg-card-secondary">
                <div className="h-full bg-primary" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">Confirmed bookings will appear here once available.</p>}
        </div>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex flex-col bg-card p-6">
      <Icon className="size-4 text-primary" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-black text-foreground">{value}</p>
    </div>
  )
}
