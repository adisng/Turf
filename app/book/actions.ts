'use server'

import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateCandidateSlots, minutesToTime, resolvePricingWindow, timeToMinutes, type PricingWindowRow } from '@/lib/slots'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

const BookingDateSchema = z.string().regex(DATE_RE).refine(isValidDate, 'Invalid date')
const TimeSchema = z.string().regex(TIME_RE)
const BookingIdSchema = z.string().trim().min(1).max(100)
const IndianPhoneSchema = z.string().trim().transform((value) => {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits
}).refine((value) => /^[6-9]\d{9}$/.test(value), 'Invalid Indian mobile number')
const CreateBookingSchema = z.object({
  sportId: z.string().trim().min(1).max(100),
  date: BookingDateSchema,
  startTime: TimeSchema,
  endTime: TimeSchema,
  durationMinutes: z.union([z.literal(30), z.literal(60), z.literal(90), z.literal(120)]),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: IndianPhoneSchema,
  customerEmail: z.string().trim().email().max(254),
  notes: z.string().trim().max(500).optional(),
  idempotencyKey: z.string().regex(/^[a-zA-Z0-9_-]{16,80}$/),
})
const AvailableSlotsSchema = z.object({
  sportId: z.string().trim().min(1).max(100),
  date: BookingDateSchema,
  durationMinutes: CreateBookingSchema.shape.durationMinutes,
})

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function maxBookingDateIso() {
  const date = new Date(`${todayIso()}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 30)
  return date.toISOString().slice(0, 10)
}

function isWithinBookingWindow(date: string) {
  return date >= todayIso() && date <= maxBookingDateIso()
}

function normalizeEndMinutes(start: number, end: number) {
  return end === 0 && start > 0 ? 1440 : end
}

export interface SlotOption {
  startTime: string
  endTime: string
  available: boolean
  hourlyRate: number
  total: number
  pricingWindowId: string | null
  pricingWindowLabel: string | null
}

function isValidDate(date: string) {
  if (!DATE_RE.test(date)) return false
  const parsed = new Date(`${date}T00:00:00`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}

function calculateSplitTotal(start: number, rawEnd: number, windows: PricingWindowRow[]) {
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

export async function getAvailableSlots(input: { sportId: string; date: string; durationMinutes: number }): Promise<{ slots: SlotOption[] } | { error: string }> {
  const parsed = AvailableSlotsSchema.safeParse(input)
  if (!parsed.success || !isWithinBookingWindow(parsed.data.date)) return { error: 'Please choose a date within the next 30 days.' }
  const bookingInput = parsed.data
  const supabase = await createClient()
  const [{ data: pricingRows, error: pricingError }, { data: sports, error: sportError }] = await Promise.all([
    supabase.from('pricing').select('id, start_time, end_time, price_per_hour').eq('active', true).order('start_time'),
    supabase.from('sports').select('id').eq('id', bookingInput.sportId).eq('active', true).maybeSingle(),
  ])
  if (pricingError || sportError) return { error: 'Could not load booking options. Please try again.' }
  if (!sports) return { error: 'That sport is not available.' }
  const { data: existingBookings, error } = await supabase.from('bookings').select('start_time, end_time').eq('sport_id', bookingInput.sportId).eq('booking_date', bookingInput.date).in('booking_status', ['pending_payment', 'pending', 'confirmed'])
  if (error) return { error: 'Could not check availability. Please try again.' }
  const windows: PricingWindowRow[] = (pricingRows ?? []).map((row) => ({ id: row.id, label: '', range_label: null, start_time: row.start_time, end_time: row.end_time, hourly_rate: Number(row.price_per_hour) }))
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const candidates = generateCandidateSlots(bookingInput.durationMinutes, existingBookings ?? [], bookingInput.date === today, now.getHours() * 60 + now.getMinutes())
  return { slots: candidates.map((slot) => {
    const window = resolvePricingWindow(slot.startMinutes, windows)
    const total = calculateSplitTotal(slot.startMinutes, slot.endMinutes, windows)
    return { startTime: minutesToTime(slot.startMinutes), endTime: minutesToTime(slot.endMinutes), available: slot.available && total !== null, hourlyRate: window?.hourly_rate ?? 0, total: total ?? 0, pricingWindowId: window?.id ?? null, pricingWindowLabel: window?.label || (window ? `${window.start_time}–${window.end_time}` : null) }
  }) }
}

export interface CreateBookingInput {
  sportId: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  customerName: string
  customerPhone: string
  customerEmail: string
  notes?: string
  idempotencyKey: string
}

export async function createBooking(input: CreateBookingInput): Promise<{ success: true; booking: { reference: string; amount: number; token: string } } | { error: string }> {
  const parsed = CreateBookingSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid booking details.' }
  const booking = parsed.data
  if (!isWithinBookingWindow(booking.date)) return { error: 'Booking date must be within the next 30 days.' }
  const start = timeToMinutes(booking.startTime)
  const end = normalizeEndMinutes(start, timeToMinutes(booking.endTime))
  if (start < 360 || end <= start || end > 1440 || end - start !== booking.durationMinutes) return { error: 'That time slot is invalid.' }
  const supabase = await createClient()
  const publicToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(publicToken).digest('hex')
  const { data, error } = await supabase.rpc('create_guest_booking_atomic', { p_sport_id: booking.sportId, p_booking_date: booking.date, p_start_time: booking.startTime, p_end_time: end === 1440 ? '24:00' : booking.endTime, p_duration_minutes: booking.durationMinutes, p_customer_name: booking.customerName, p_customer_phone: booking.customerPhone, p_customer_email: booking.customerEmail, p_notes: booking.notes ?? '', p_idempotency_key: booking.idempotencyKey, p_public_token_hash: tokenHash }).single() as { data: { id: string; booking_reference: string; amount: number | string } | null; error: { message: string } | null }
  if (error) {
    const message = error.message
    if (message.includes('p_notes') || message.includes('create_guest_booking_atomic')) {
      // The deployed RPC must accept p_notes; otherwise the booking schema needs a reviewed migration.
      console.warn('Booking notes could not be persisted because the deployed booking RPC does not accept p_notes.')
    }
    if (message.includes('SLOT_UNAVAILABLE')) return { error: 'This slot is no longer available. Please choose another.' }
    if (message.includes('INVALID_SPORT')) return { error: 'That sport is not available.' }
    if (message.includes('PRICE_UNAVAILABLE')) return { error: 'Pricing is unavailable for that time. Please choose another slot.' }
    if (message.includes('UNAUTHORIZED')) return { error: 'Your session has expired. Please log in again.' }
    return { error: 'Could not create your booking. Please try again.' }
  }
  if (!data) return { error: 'Could not create your booking. Please try again.' }
  revalidatePath('/bookings'); revalidatePath('/dashboard'); revalidatePath('/admin')
  return { success: true, booking: { reference: data.booking_reference, amount: Number(data.amount), token: publicToken } }
}

export async function getBooking(bookingId: string) {
  const parsed = BookingIdSchema.safeParse(bookingId)
  if (!parsed.success) return { error: 'Booking not found.' }
  const supabase = await createClient(); const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { error: 'Unauthorized' }
  const { data, error } = await supabase.from('bookings').select('id, booking_reference, user_id, sport_id, booking_date, start_time, end_time, duration, amount, booking_status, payment_status, created_at, sports(name)').eq('id', parsed.data).eq('user_id', user.user.id).maybeSingle()
  return error || !data ? { error: 'Booking not found.' } : { booking: data }
}

export async function getCustomerBookings() {
  const supabase = await createClient(); const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { error: 'Unauthorized' }
  const { data, error } = await supabase.from('bookings').select('id, booking_reference, booking_date, start_time, end_time, duration, amount, booking_status, payment_status, sports(name)').eq('user_id', user.user.id).order('booking_date', { ascending: false }).order('start_time', { ascending: false })
  return error ? { error: 'Could not load bookings.' } : { bookings: data ?? [] }
}

export async function calculatePrice(input: { startTime: string; endTime: string }) {
  const parsed = z.object({ startTime: TimeSchema, endTime: TimeSchema }).safeParse(input)
  if (!parsed.success) return { error: 'Invalid time range.' }
  const supabase = await createClient(); const { data, error } = await supabase.from('pricing').select('id, start_time, end_time, price_per_hour').eq('active', true)
  if (error) return { error: 'Could not load pricing.' }
  const windows = (data ?? []).map((row) => ({ id: row.id, label: '', range_label: null, start_time: row.start_time, end_time: row.end_time, hourly_rate: Number(row.price_per_hour) }))
  const total = calculateSplitTotal(timeToMinutes(parsed.data.startTime), timeToMinutes(parsed.data.endTime), windows)
  return total === null ? { error: 'Pricing unavailable.' } : { total }
}
