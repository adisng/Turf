import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ShieldCheck, Timer, CalendarCheck, Sparkles, Clock } from 'lucide-react'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HomeDateSelector } from '@/components/booking/home-date-selector'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SPORTS, PRICING_WINDOWS, OPERATING_HOURS, CURRENCY, DURATION_OPTIONS, formatPriceForDuration } from '@/lib/config'

const WHY_CHOOSE_US = [
  {
    icon: ShieldCheck,
    title: 'Professional-grade turf',
    description: 'FIFA-quality grass and match-ready cricket pitches, maintained daily.',
  },
  {
    icon: Timer,
    title: 'Instant confirmation',
    description: 'See live availability and lock in your slot in under a minute.',
  },
  {
    icon: CalendarCheck,
    title: 'Flexible durations',
    description: 'Book 30 min to 2 hours, day or night.',
  },
  {
    icon: Sparkles,
    title: 'Transparent pricing',
    description: 'One clear rate card. No hidden fees.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: bookingSettings } = await supabase
    .from('booking_settings')
    .select('max_advance_days')
    .eq('id', true)
    .maybeSingle()
  const maxAdvanceDays = bookingSettings?.max_advance_days ?? 2
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <>
      <Navbar />
      <HomeDateSelector maxAdvanceDays={maxAdvanceDays} todayIso={todayIso} />
      <main>
        {/* ── COMPACT HERO ── */}
        <section className="relative overflow-hidden border-b-[3px] border-border-strong">
          <Image
            src="/hero-turf.png"
            alt="Premium sports turf facility lit at night"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-6">
                <span className="inline-flex w-fit border-[2px] border-primary bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  Cricket · Football · {OPERATING_HOURS.label}
                </span>
                <h1 className="max-w-xl text-balance font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Book your game.
                  <br />
                  <span className="text-primary">Own your time.</span>
                </h1>
                <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Reserve match-ready cricket and football turfs with transparent pricing and instant
                  confirmation — built for teams who play often.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" className="h-12 px-8 text-sm" render={<Link href="/book">Book Now <ArrowUpRight className="size-4" /></Link>} />
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-sm"
                    render={<Link href="/sports">Explore Sports</Link>}
                  />
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative size-64 overflow-hidden border-[2px] border-border">
                  <Image
                    src="/turf-cricket.png"
                    alt="Cricket turf"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SPORTS BENTO GRID ── */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Our sports</span>
              <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">Choose your game</h2>
            </div>
            <Link
              href="/sports"
              className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 sm:inline-flex"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-[2px] bg-border sm:grid-cols-2">
            {SPORTS.map((sport) => (
              <Link
                key={sport.id}
                href={`/book?sport=${sport.id}`}
                className="group relative flex flex-col overflow-hidden bg-card transition-all duration-150 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={sport.image}
                    alt={`${sport.name} turf`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                </div>
                <div className="flex flex-col gap-2 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">{sport.name}</h3>
                    <ArrowUpRight className="size-5 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <p className="text-sm text-primary">{sport.tagline}</p>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-subtle-foreground">
                    <span>{sport.surface}</span>
                    <span>·</span>
                    <span>{sport.maxPlayers}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BOOKING PREVIEW (Bento) ── */}
        <section className="border-y-[3px] border-border-strong bg-card">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <div className="mb-10 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">How it works</span>
              <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                Pick a slot. Book instantly.
              </h2>
            </div>

            <div className="grid gap-[2px] bg-border sm:grid-cols-3">
              {/* Date block */}
              <div className="flex flex-col bg-card p-6 sm:row-span-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Step 01</span>
                <p className="mt-3 font-heading text-lg font-black uppercase text-foreground">Select date</p>
                <p className="mt-2 text-sm text-muted-foreground">Choose any day up to 30 days ahead. See what's open before you commit.</p>
                <div className="mt-6 flex-1 border-[2px] border-border bg-card-secondary p-4">
                  <p className="font-heading text-4xl font-black text-foreground">28</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">August 2026</p>
                </div>
              </div>

              {/* Time slots */}
              <div className="flex flex-col bg-card p-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Step 02</span>
                <p className="mt-3 font-heading text-lg font-black uppercase text-foreground">Check availability</p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-[2px] border-success/30 bg-success/5 px-3 py-2">
                    <span className="text-sm font-bold text-foreground">06:00 PM</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-success">Available</span>
                  </div>
                  <div className="flex items-center justify-between border-[2px] border-destructive/30 bg-destructive/5 px-3 py-2 opacity-60">
                    <span className="text-sm font-bold text-foreground">07:00 PM</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-destructive">Booked</span>
                  </div>
                  <div className="flex items-center justify-between border-[2px] border-success/30 bg-success/5 px-3 py-2">
                    <span className="text-sm font-bold text-foreground">08:00 PM</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-success">Available</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col justify-between bg-primary p-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-foreground/60">Step 03</span>
                <div>
                  <p className="font-heading text-2xl font-black uppercase text-primary-foreground">Book & play</p>
                  <p className="mt-2 text-sm text-primary-foreground/70">Confirm your slot and step onto the turf.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 self-start border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:shadow-[4px_4px_0_0_var(--primary-foreground)]"
                  render={<Link href="/book">Book Now <ArrowUpRight className="size-3.5" /></Link>}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING BENTO ── */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Pricing</span>
              <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                One rate card. No surprises.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 sm:inline-flex"
            >
              Full pricing
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-[2px] bg-border sm:grid-cols-2">
            {PRICING_WINDOWS.map((window) => (
              <div key={window.id} className="flex flex-col bg-card p-6 transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Clock className="size-3.5" />
                  {window.range}
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-heading text-5xl font-black text-foreground">
                    {CURRENCY}
                    {window.hourlyRate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">/ hr</span>
                </div>
                <div className="mt-6 flex flex-col gap-2 border-t-[2px] border-border pt-4">
                  {DURATION_OPTIONS.map((d) => (
                    <div key={d.minutes} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-heading font-bold text-foreground">{formatPriceForDuration(window.hourlyRate, d.minutes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS BENTO ── */}
        <section className="border-y-[3px] border-border-strong bg-card">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <div className="grid gap-[2px] bg-border sm:grid-cols-3">
              <div className="flex flex-col bg-card p-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Opening</span>
                <p className="mt-3 font-heading text-4xl font-black text-foreground">06:00</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AM · Every day</p>
              </div>
              <div className="flex flex-col bg-card p-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Closing</span>
                <p className="mt-3 font-heading text-4xl font-black text-foreground">12:00</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AM · Every day</p>
              </div>
              <div className="flex flex-col bg-card p-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Duration</span>
                <p className="mt-3 font-heading text-4xl font-black text-foreground">30–120</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Minutes · Flexible</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US (Bento) ── */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-10 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Why choose us</span>
            <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
              Built for teams who play often
            </h2>
          </div>

          <div className="grid gap-[2px] bg-border sm:grid-cols-2">
            {WHY_CHOOSE_US.map((item, i) => (
              <div
                key={item.title}
                className="flex flex-col bg-card p-6 transition-all duration-150 hover:-translate-y-1"
              >
                <div className="mb-4 flex size-10 items-center justify-center border-[2px] border-border bg-card-secondary">
                  <item.icon className="size-5 text-primary" />
                </div>
                <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="border-t-[3px] border-border-strong">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-16 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="max-w-xl text-balance font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
                Ready to play?
              </h2>
              <p className="mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
                Your next match is one booking away.
              </p>
            </div>
            <Button size="lg" className="h-12 px-8 text-sm" render={<Link href="/book">Book Your Slot <ArrowUpRight className="size-4" /></Link>} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
