'use client'

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

function isoDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date
}

export function HomeDateSelector({ maxAdvanceDays = 2, todayIso }: { maxAdvanceDays?: number; todayIso: string }) {
  const dates = Array.from({ length: Math.max(3, maxAdvanceDays + 1) }, (_, index) => {
    const date = addDays(todayIso, index)
    return { key: isoDate(date), date }
  })

  return (
    <section aria-label="Choose a booking date" className="border-b-[3px] border-border-strong bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 sm:px-8">
        <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sm:inline">Book date</span>
        <button type="button" aria-label="Previous date" disabled className="flex size-8 shrink-0 items-center justify-center border-[2px] border-border text-muted-foreground opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dates.map(({ key, date }, index) => {
            const available = index <= maxAdvanceDays
            return (
              <a
                key={key}
                href={available ? `/book?date=${key}` : undefined}
                aria-disabled={!available}
                className={cn(
                  'min-w-[92px] shrink-0 border-[2px] px-3 py-2 text-center transition-colors',
                  index === 0 && available ? 'border-primary bg-primary/10' : 'border-border bg-background',
                  available ? 'hover:border-primary' : 'cursor-not-allowed opacity-35',
                )}
              >
                <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">{index === 0 ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })}</span>
                <span className="mt-1 block font-heading text-lg font-black text-foreground">{date.getDate()}</span>
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">{date.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })}</span>
              </a>
            )
          })}
        </div>
        <button type="button" aria-label="Next date" disabled className="flex size-8 shrink-0 items-center justify-center border-[2px] border-border text-muted-foreground opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

