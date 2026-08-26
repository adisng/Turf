import { Clock } from 'lucide-react'

import type { PricingWindow } from '@/lib/config'
import { CURRENCY, DURATION_OPTIONS, formatPriceForDuration } from '@/lib/config'
import { cn } from '@/lib/utils'

function PricingCard({ window: pricingWindow, highlighted }: { window: PricingWindow; highlighted?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col border-[2px] border-border bg-card p-6 transition-all duration-150 hover:-translate-y-1',
        highlighted && 'border-primary bg-card-secondary hover:shadow-[6px_6px_0_0_var(--primary)]',
        !highlighted && 'hover:shadow-[4px_4px_0_0_var(--border)]',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">{pricingWindow.label}</p>
        {highlighted && (
          <span className="border-[2px] border-primary bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
            Popular
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-subtle-foreground">
        <Clock className="size-3.5" />
        <span>{pricingWindow.range}</span>
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-heading text-5xl font-black text-foreground">
          {CURRENCY}
          {pricingWindow.hourlyRate.toLocaleString('en-IN')}
        </span>
        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">/ hour</span>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t-[2px] border-border pt-5">
        {DURATION_OPTIONS.map((duration) => (
          <div
            key={duration.minutes}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{duration.label}</span>
            <span className="font-heading font-bold text-foreground">
              {formatPriceForDuration(pricingWindow.hourlyRate, duration.minutes)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { PricingCard }
