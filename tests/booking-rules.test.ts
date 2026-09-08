import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateSplitTotal, isWithinBookingWindow, maxBookingDateIso, normalizeEndMinutes, todayIso } from '../lib/booking-rules'
import { generateCandidateSlots, type PricingWindowRow } from '../lib/slots'

const windows: PricingWindowRow[] = [
  { id: 'day', label: 'Day', range_label: null, start_time: '06:00', end_time: '18:00', hourly_rate: 1000 },
  { id: 'night', label: 'Night', range_label: null, start_time: '18:00', end_time: '00:00', hourly_rate: 1300 },
]

test('normalizes displayed midnight to the internal end-of-day minute', () => {
  assert.equal(normalizeEndMinutes(22 * 60, 0), 1440)
  assert.equal(normalizeEndMinutes(0, 0), 0)
})

test('calculates day, night, and midnight-crossing prices', () => {
  assert.equal(calculateSplitTotal(10 * 60, 11 * 60, windows), 1000)
  assert.equal(calculateSplitTotal(19 * 60, 21 * 60, windows), 2600)
  assert.equal(calculateSplitTotal(22 * 60, 0, windows), 2600)
  assert.equal(calculateSplitTotal(17 * 60, 19 * 60, windows), 2300)
})

test('generates slots through midnight without creating a 00:00 start slot', () => {
  const slots = generateCandidateSlots(120, [], false, 0)
  const final = slots.at(-1)
  assert.equal(final?.startMinutes, 1320)
  assert.equal(final?.endMinutes, 1440)
})

test('marks overlapping existing bookings unavailable', () => {
  const slots = generateCandidateSlots(60, [{ start_time: '10:00', end_time: '11:00' }], false, 0)
  assert.equal(slots.find((slot) => slot.startMinutes === 600)?.available, false)
  assert.equal(slots.find((slot) => slot.startMinutes === 660)?.available, true)
})

test('enforces the inclusive today through today-plus-30-day window', () => {
  assert.equal(isWithinBookingWindow(todayIso()), true)
  assert.equal(isWithinBookingWindow(maxBookingDateIso()), true)

  const tooFar = new Date(`${maxBookingDateIso()}T00:00:00Z`)
  tooFar.setUTCDate(tooFar.getUTCDate() + 1)
  assert.equal(isWithinBookingWindow(tooFar.toISOString().slice(0, 10)), false)
  assert.equal(isWithinBookingWindow('2000-01-01'), false)
})
