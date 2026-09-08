import { resolvePricingWindow, timeToMinutes, type PricingWindowRow } from './slots'
import { MAX_ADVANCE_BOOKING_DAYS } from './config'

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function maxBookingDateIso() {
  const date = new Date(`${todayIso()}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + MAX_ADVANCE_BOOKING_DAYS)
  return date.toISOString().slice(0, 10)
}

export function isWithinBookingWindow(date: string) {
  return date >= todayIso() && date <= maxBookingDateIso()
}

export function normalizeEndMinutes(start: number, end: number) {
  return end === 0 && start > 0 ? 1440 : end
}

export function calculateSplitTotal(start: number, rawEnd: number, windows: PricingWindowRow[]) {
  const end = normalizeEndMinutes(start, rawEnd)
  let total = 0

  for (let cursor = start; cursor < end;) {
    const window = resolvePricingWindow(cursor, windows)
    if (!window) return null

    let windowEnd = timeToMinutes(window.end_time)
    if (windowEnd <= timeToMinutes(window.start_time)) windowEnd += 1440
    const segmentEnd = Math.min(end, windowEnd)
    total += ((segmentEnd - cursor) * window.hourly_rate) / 60
    cursor = segmentEnd
  }

  return Math.round(total)
}
