import type { Metadata } from 'next'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SportCard } from '@/components/sport-card'
import { SPORTS, OPERATING_HOURS } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Sports — TurfBooking',
  description: 'Explore cricket and football turfs available for booking.',
}

export default function SportsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Sports</span>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
            Two turfs. One standard of quality.
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Both turfs are open {OPERATING_HOURS.label} with floodlighting for evening play. Choose
            a sport below to see details and book a slot.
          </p>
        </div>

        <div className="mt-12 grid gap-[2px] bg-border sm:grid-cols-2">
          {SPORTS.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
