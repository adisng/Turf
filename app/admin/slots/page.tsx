import { CalendarDays, Grid3x3 } from 'lucide-react'

import { EmptyState } from '@/components/ui/state'
import { OPERATING_HOURS } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export default async function AdminSlotsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, sport_id, booking_date, start_time, end_time, status')
    .gte('booking_date', today)
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(20)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin</span>
        <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">Slots</h1>
        <p className="mt-2 text-sm text-muted-foreground">Upcoming occupancy across the {OPERATING_HOURS.label} operating window.</p>
      </div>
      {!bookings?.length ? (
        <EmptyState icon={Grid3x3} title="No upcoming bookings" description="Available slots are generated automatically from operating hours and active bookings." />
      ) : (
        <div className="border-[2px] border-border bg-card">
          <div className="flex flex-col">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-center gap-4 border-b-[2px] border-border px-6 py-4 last:border-0">
                <CalendarDays className="size-4 text-primary" />
                <div className="min-w-36 flex-1">
                  <p className="text-sm font-bold uppercase tracking-wide text-foreground">{booking.sport_id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(`${booking.booking_date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className="text-sm text-muted-foreground">{booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}</p>
                <span className="border-[2px] border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">{booking.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
