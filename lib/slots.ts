// Time helpers for the booking engine. All internal math uses minutes-from-midnight
// so we can safely reason about the 06:00 -> 24:00 operating window.

export const OPEN_MINUTES = 6 * 60 // 06:00
export const CLOSE_MINUTES = 24 * 60 // 24:00 (midnight, end of day)
export const SLOT_STEP_MINUTES = 30

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export interface PricingWindowRow {
  id: string
  label: string
  range_label: string | null
  start_time: string
  end_time: string
  hourly_rate: number
}

/** Resolves the pricing window that a given slot start time falls into. */
export function resolvePricingWindow(
  startMinutes: number,
  windows: PricingWindowRow[],
): PricingWindowRow | null {
  for (const window of windows) {
    const windowStart = timeToMinutes(window.start_time)
    let windowEnd = timeToMinutes(window.end_time)
    if (windowEnd <= windowStart) windowEnd += 1440
    if (startMinutes >= windowStart && startMinutes < windowEnd) return window
  }
  return null
}

export function calculateTotal(hourlyRate: number, durationMinutes: number): number {
  return Math.round((hourlyRate * durationMinutes) / 60)
}

interface ExistingBooking {
  start_time: string
  end_time: string
}

/** Generates every candidate start time for a duration, marking ones that overlap existing bookings. */
export function generateCandidateSlots(
  durationMinutes: number,
  existingBookings: ExistingBooking[],
  isToday: boolean,
  nowMinutes: number,
) {
  const slots: { startMinutes: number; endMinutes: number; available: boolean }[] = []

  for (
    let start = OPEN_MINUTES;
    start + durationMinutes <= CLOSE_MINUTES;
    start += SLOT_STEP_MINUTES
  ) {
    const end = start + durationMinutes
    if (isToday && start <= nowMinutes) continue

    const overlaps = existingBookings.some((booking) => {
      const bookedStart = timeToMinutes(booking.start_time)
      let bookedEnd = timeToMinutes(booking.end_time)
      if (bookedEnd <= bookedStart) bookedEnd += 1440
      return start < bookedEnd && end > bookedStart
    })

    slots.push({ startMinutes: start, endMinutes: end, available: !overlaps })
  }

  return slots
}
