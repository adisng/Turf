import Link from 'next/link'
import { CalendarClock, ArrowUpRight } from 'lucide-react'

import { AccountShell } from '@/components/layout/account-shell'
import { EmptyState } from '@/components/ui/state'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CURRENCY } from '@/lib/config'
import { BookingRow } from './booking-row'

export default async function BookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bookings } = user
    ? await supabase
        .from('bookings')
        .select(
          'id, sport_id, booking_date, start_time, end_time, amount, booking_status, sports(name)',
        )
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })
    : { data: null }

  return (
    <AccountShell>
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Bookings</span>
          <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">Your bookings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A history of every slot you&apos;ve booked, past and upcoming.
          </p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No bookings yet"
            description="Bookings you make will be listed here with sport, date, and time details."
            action={<Button render={<Link href="/book">Book a slot <ArrowUpRight className="size-3.5" /></Link>} />}
          />
        ) : (
          <div className="flex flex-col gap-[2px] bg-border">
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                id={booking.id}
                sportName={(booking.sports as unknown as { name: string } | null)?.name ?? booking.sport_id}
                date={booking.booking_date}
                startTime={booking.start_time}
                endTime={booking.end_time}
                total={Number(booking.amount)}
                status={booking.booking_status}
                currency={CURRENCY}
              />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  )
}
