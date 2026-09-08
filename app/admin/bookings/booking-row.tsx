'use client'

import { useState, useTransition } from 'react'

import { Badge } from '@/components/ui/badge'
import { updateBookingStatus } from './actions'
import type { BookingRow, BookingStatus } from '@/lib/types'

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

const STATUS_VARIANT: Record<BookingStatus, 'default' | 'success' | 'destructive'> = {
  pending: 'default',
  confirmed: 'success',
  completed: 'success',
  cancelled: 'destructive',
}

interface AdminBookingRowProps {
  booking: BookingRow & { customer_name?: string | null; customer_phone?: string | null; sport_name?: string }
}

export function AdminBookingRow({ booking }: AdminBookingRowProps) {
  const [status, setStatus] = useState<BookingStatus>(booking.booking_status)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStatusChange(next: BookingStatus) {
    setError(null)
    const previous = status
    setStatus(next)
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, next)
      if (result?.error) {
        setStatus(previous)
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3 border-b-[2px] border-border px-6 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">{booking.sport_name}</p>
          <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {booking.booking_date} · {booking.start_time.slice(0, 5)}–{booking.end_time.slice(0, 5)}
        </p>
        <p className="text-xs text-subtle-foreground">
          {booking.customer_name ?? 'Unknown customer'}
          {booking.customer_phone ? ` · ${booking.customer_phone}` : ''}
        </p>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <p className="font-heading text-sm font-black text-foreground">
          ₹{Number(booking.amount).toLocaleString('en-IN')}
        </p>
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
          className="border-[2px] border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground outline-none focus:border-primary disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
