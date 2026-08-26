import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PricingCard } from '@/components/pricing-card'
import { Button } from '@/components/ui/button'
import { DURATION_OPTIONS, PRICING_WINDOWS, OPERATING_HOURS } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Pricing — TurfBooking',
  description: 'Transparent hourly rates for cricket and football turf bookings.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Pricing</span>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
            One rate card. No surprises.
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Pricing is the same for cricket and football, and applies across our full operating
            hours: {OPERATING_HOURS.label}.
          </p>
        </div>

        <div className="mt-12 grid gap-[2px] bg-border sm:grid-cols-2">
          {PRICING_WINDOWS.map((window, index) => (
            <PricingCard key={window.id} window={window} highlighted={index === 1} />
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-6">
          <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">Available durations</h2>
          <div className="grid gap-[2px] bg-border sm:grid-cols-2 lg:grid-cols-4">
            {DURATION_OPTIONS.map((duration) => (
              <div key={duration.minutes} className="flex flex-col bg-card p-6">
                <p className="font-heading text-2xl font-black text-foreground">{duration.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">Available on any active slot</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 border-[2px] border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-xl font-bold uppercase tracking-wide text-foreground">Ready to book?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a sport, pick a slot, and you&apos;re on the turf.
            </p>
          </div>
          <Button size="lg" render={<Link href="/book">Book Now <ArrowUpRight className="size-3.5" /></Link>} />
        </div>
      </main>
      <Footer />
    </>
  )
}
