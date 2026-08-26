import type { Metadata } from 'next'
import { Award, HeartHandshake, MapPin, Users } from 'lucide-react'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { OPERATING_HOURS } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About — TurfBooking',
  description: 'Learn about our sports facility and what makes it different.',
}

const VALUES = [
  {
    icon: Award,
    title: 'Match-ready standards',
    description: 'Our turfs are maintained to professional specifications so every session feels like game day.',
  },
  {
    icon: Users,
    title: 'Built for every team',
    description: 'From casual weekend games to recurring league fixtures, our booking system scales with you.',
  },
  {
    icon: HeartHandshake,
    title: 'Straightforward experience',
    description: 'Transparent pricing, clear availability, and no hidden fees — booking should be effortless.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b-[3px] border-border-strong bg-card">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">About us</span>
            <h1 className="mt-3 max-w-2xl font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
              A dedicated home for cricket and football.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              We built this facility for players who take their game seriously — whether that
              means a weekly five-a-side with friends or a full weekend cricket tournament.
              Two professional-grade turfs, open {OPERATING_HOURS.label}, with a booking
              experience designed to get you playing faster.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-[2px] bg-border sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="flex flex-col bg-card p-6 transition-all duration-150 hover:-translate-y-1">
                <div className="mb-4 flex size-10 items-center justify-center border-[2px] border-border bg-card-secondary">
                  <value.icon className="size-5 text-primary" />
                </div>
                <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">{value.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-border-strong bg-card">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-5 py-16 sm:px-8 sm:py-20">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="size-5" />
              <p className="text-xs font-black uppercase tracking-[0.25em]">Find us</p>
            </div>
            <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Facility location details will be published here once finalized. In the meantime,
              reach out through our contact page for directions and availability.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
