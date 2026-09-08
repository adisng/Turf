import assert from 'node:assert/strict'
import test from 'node:test'

import { CreateBookingSchema } from '../lib/booking-validation'

const validBooking = {
  sportId: 'football',
  date: '2030-01-15',
  startTime: '22:00',
  endTime: '00:00',
  durationMinutes: 120,
  customerName: 'Aditi Singh',
  customerPhone: '+91 9876543210',
  customerEmail: 'aditi@example.com',
  notes: 'Please keep the floodlights on.',
  idempotencyKey: 'booking_key_123456',
}

test('accepts valid booking input and normalizes an Indian phone number', () => {
  const result = CreateBookingSchema.safeParse(validBooking)
  assert.equal(result.success, true)
  if (result.success) assert.equal(result.data.customerPhone, '9876543210')
})

test('rejects invalid phones and oversized notes', () => {
  assert.equal(CreateBookingSchema.safeParse({ ...validBooking, customerPhone: '12345' }).success, false)
  assert.equal(CreateBookingSchema.safeParse({ ...validBooking, notes: 'x'.repeat(501) }).success, false)
})

test('rejects invalid dates and unsupported durations', () => {
  assert.equal(CreateBookingSchema.safeParse({ ...validBooking, date: '2030-02-31' }).success, false)
  assert.equal(CreateBookingSchema.safeParse({ ...validBooking, durationMinutes: 45 }).success, false)
})
