'use client'

import { useTransition } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cancelBooking } from './actions'

interface BookingRowProps {
  id: string
  sportName: string
  date: string
  startTime: string
  endTime: string
  total: number
  status: string
  currency: string
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'destructive',
  completed: 'neutral',
}

export function BookingRow({
  id,
  sportName,
  date,
  startTime,
  endTime,
  total,
  status,
  currency,
}: BookingRowProps) {
  const [isPending, startTransition] = useTransition()
  const canCancel = status === 'confirmed' || status === 'pending'

  function handleCancel() {
    startTransition(async () => {
      await cancelBooking(id)
    })
  }

  return (
    <div className="flex flex-col gap-3 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">{sportName}</p>
          <Badge variant={STATUS_VARIANT[status] ?? 'neutral'} className="capitalize">
            {status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {startTime}–{endTime}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-heading text-lg font-black text-foreground">
          {currency}{total.toLocaleString('en-IN')}
        </p>
        {canCancel ? (
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
            {isPending ? 'Cancelling…' : 'Cancel'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
