'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { FormField, Input, Textarea } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/state'
import { DURATION_OPTIONS, OPERATING_HOURS, CURRENCY } from '@/lib/config'
import { cn } from '@/lib/utils'
import { createBooking, getAvailableSlots, type SlotOption } from './actions'

interface SportRow {
  id: string
  name: string
  tagline: string | null
}

interface BookingFormProps {
  sports: SportRow[]
  initialDate?: string
  defaultName: string
  defaultPhone: string
  defaultEmail: string
}

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

export function BookingForm({ sports, initialDate, defaultName, defaultPhone, defaultEmail }: BookingFormProps) {
  const router = useRouter()
  const [sportId, setSportId] = useState(sports[0]?.id ?? '')
  const [date, setDate] = useState(initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : todayIso())
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [slots, setSlots] = useState<SlotOption[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [customerName, setCustomerName] = useState(defaultName)
  const [customerPhone, setCustomerPhone] = useState(defaultPhone)
  const [customerEmail, setCustomerEmail] = useState(defaultEmail)
  const [notes, setNotes] = useState('')
  const [idempotencyKey] = useState(() => `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!sportId || !date) return
    let cancelled = false
    setIsLoadingSlots(true)
    setSlotsError(null)
    setSelectedSlot(null)

    getAvailableSlots({ sportId, date, durationMinutes }).then((result) => {
      if (cancelled) return
      if ('error' in result) {
        setSlotsError(result.error)
        setSlots([])
      } else {
        setSlots(result.slots)
      }
      setIsLoadingSlots(false)
    })

    return () => {
      cancelled = true
    }
  }, [sportId, date, durationMinutes])

  const selectedSport = useMemo(() => sports.find((s) => s.id === sportId), [sports, sportId])
  const availableCount = slots.filter((s) => s.available).length

  function handleConfirm() {
    if (!selectedSlot || !sportId || !customerName.trim() || !customerPhone.trim()) {
      setFormError('Please fill in your name and phone number.')
      return
    }
    setFormError(null)

    startTransition(async () => {
      const result = await createBooking({
        sportId,
        date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        durationMinutes,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        notes: notes.trim() || undefined,
        idempotencyKey,
      })

      if ('error' in result) {
        setFormError(result.error)
        return
      }

      setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="mt-10 border-[2px] border-success/30 bg-success/5 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <div>
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">Booking reserved</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedSport?.name} on {date} from {selectedSlot?.startTime} to {selectedSlot?.endTime}.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" render={<a href="/bookings">View my bookings</a>} />
            <Button
              onClick={() => {
                setSuccess(false)
                setSelectedSlot(null)
                router.refresh()
              }}
            >
              Book another slot
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-10 flex flex-col gap-8">
      {/* Sport selection */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">Choose a sport</p>
        <div className="grid gap-[2px] bg-border sm:grid-cols-2">
          {sports.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => setSportId(sport.id)}
              className={cn(
                'border-[2px] bg-card px-5 py-4 text-left transition-all duration-150',
                sportId === sport.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/40 hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_var(--primary)]',
              )}
            >
              <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">{sport.name}</p>
              {sport.tagline ? <p className="mt-1 text-sm text-muted-foreground">{sport.tagline}</p> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Date + duration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date" htmlFor="booking-date">
          <Input
            id="booking-date"
            type="date"
            min={todayIso()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </FormField>
        <FormField label="Duration" htmlFor="booking-duration">
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                type="button"
                onClick={() => setDurationMinutes(option.minutes)}
                className={cn(
                  'border-[2px] px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-150',
                  durationMinutes === option.minutes
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FormField>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-subtle-foreground">Operating hours: {OPERATING_HOURS.label}</p>

      {/* Slot grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">Available slots</p>
          {!isLoadingSlots && slots.length > 0 ? (
            <Badge variant={availableCount > 0 ? 'success' : 'destructive'}>
              {availableCount} of {slots.length} open
            </Badge>
          ) : null}
        </div>

        {isLoadingSlots ? (
          <div className="flex items-center gap-2 border-[2px] border-border bg-card px-5 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Checking availability…
          </div>
        ) : slotsError ? (
          <p className="text-sm text-destructive">{slotsError}</p>
        ) : slots.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No slots for this selection"
            description="Try a different date or duration."
          />
        ) : (
          <div className="grid grid-cols-2 gap-[2px] bg-border sm:grid-cols-3 md:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTime === slot.startTime
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'flex flex-col gap-0.5 border-[2px] bg-card px-3 py-3 text-left text-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-30',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-primary/40 hover:-translate-y-[1px]',
                  )}
                >
                  <span className="font-heading font-bold text-foreground">{slot.startTime}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {slot.available ? `${CURRENCY}${slot.total.toLocaleString('en-IN')} · Available` : 'Booked'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Contact + confirm */}
      {selectedSlot ? (
        <div className="border-[2px] border-border bg-card">
          <div className="flex items-center justify-between border-b-[2px] border-border px-6 py-4">
            <div>
              <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">
                {selectedSport?.name} · {selectedSlot.startTime}–{selectedSlot.endTime}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedSlot.pricingWindowLabel} · {date}
              </p>
            </div>
            <p className="font-heading text-xl font-black text-primary">
              {CURRENCY}
              {selectedSlot.total.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="customer-name">
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                />
              </FormField>
              <FormField label="Phone number" htmlFor="customer-phone">
                <Input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  required
                />
              </FormField>
              <FormField label="Email address" htmlFor="customer-email">
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  required
                />
              </FormField>
            </div>
            <FormField label="Notes (optional)" htmlFor="customer-notes">
              <Textarea
                id="customer-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Any special requests"
              />
            </FormField>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <Button size="lg" onClick={handleConfirm} disabled={isPending}>
              {isPending ? 'Confirming…' : `Confirm booking — ${CURRENCY}${selectedSlot.total.toLocaleString('en-IN')}`}
            </Button>
            <p className="text-center text-xs text-subtle-foreground">
              Payment placeholder: your booking is pending payment and will be confirmed after checkout is connected.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
