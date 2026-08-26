import Link from 'next/link'
import { CalendarClock, CalendarDays, Clock3, Wallet, ArrowUpRight } from 'lucide-react'

import { AccountShell } from '@/components/layout/account-shell'
import { EmptyState } from '@/components/ui/state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CURRENCY } from '@/lib/config'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let displayName = 'there'
  let bookings: Array<{
    id: string
    sport_id: string
    booking_date: string
    start_time: string
    end_time: string
    amount: number
    booking_status: string
    sports: { name: string } | null
  }> = []

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()
    displayName = profile?.name || user.email?.split('@')[0] || 'there'

    const { data } = await supabase
      .from('bookings')
      .select('id, sport_id, booking_date, start_time, end_time, amount, booking_status, sports(name)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })

    bookings = (data as unknown as typeof bookings) ?? []
  }

  const todayIso = new Date().toISOString().slice(0, 10)
  const upcoming = bookings
    .filter((b) => b.booking_status !== 'cancelled' && b.booking_date >= todayIso)
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date) || a.start_time.localeCompare(b.start_time))
  const nextBooking = upcoming[0]
  const totalSpent = bookings
    .filter((b) => b.booking_status === 'confirmed' || b.booking_status === 'completed')
    .reduce((sum, b) => sum + Number(b.amount), 0)

  return (
    <AccountShell>
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Dashboard</span>
          <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your upcoming bookings and account activity at a glance.
          </p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No bookings yet"
            description="Once you make a booking, it will show up here with all the details you need."
            action={<Button render={<Link href="/book">Book a slot <ArrowUpRight className="size-3.5" /></Link>} />}
          />
        ) : (
          <>
            <div className="grid gap-[2px] bg-border sm:grid-cols-3">
              <div className="flex flex-col bg-card p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle-foreground">
                  Total bookings
                </p>
                <p className="mt-2 font-heading text-3xl font-black text-foreground">{bookings.length}</p>
              </div>
              <div className="flex flex-col bg-card p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle-foreground">
                  Upcoming
                </p>
                <p className="mt-2 font-heading text-3xl font-black text-foreground">{upcoming.length}</p>
              </div>
              <div className="flex flex-col bg-card p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle-foreground">
                  Total spent
                </p>
                <p className="mt-2 font-heading text-3xl font-black text-foreground">
                  {CURRENCY}{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Next booking</p>
              {nextBooking ? (
                <div className="border-[2px] border-border bg-card p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">
                          {nextBooking.sports?.name ?? nextBooking.sport_id}
                        </p>
                        <Badge variant="success" className="capitalize">
                          {nextBooking.booking_status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {nextBooking.booking_date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="size-3.5" />
                          {nextBooking.start_time}–{nextBooking.end_time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Wallet className="size-3.5" />
                          {CURRENCY}{Number(nextBooking.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" render={<Link href="/bookings">View all</Link>} />
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={CalendarClock}
                  title="No upcoming bookings"
                  description="You don't have any slots booked right now."
                  action={<Button render={<Link href="/book">Book a slot</Link>} />}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AccountShell>
  )
}
