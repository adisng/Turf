'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function AdminBookingsFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-[2px] bg-border">
      {FILTERS.map((filter) => {
        const isActive = currentStatus === filter.value
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => router.push(filter.value === 'all' ? '/admin/bookings' : `/admin/bookings?status=${filter.value}`)}
            className={cn(
              'border-[2px] bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
