'use server'

import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { generateCandidateSlots, minutesToTime, resolvePricingWindow, timeToMinutes, type PricingWindowRow } from '@/lib/slots'

const VALID_DURATIONS = new Set([30, 60, 90, 120])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

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

function calculateSplitTotal(start: number, end: number, windows: PricingWindowRow[]) {
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
  if (!input.sportId || !isValidDate(input.date) || input.date < new Date().toISOString().slice(0, 10)) return { error: 'Please choose a valid future date.' }
  if (!VALID_DURATIONS.has(input.durationMinutes)) return { error: 'Please choose a valid duration.' }
  const supabase = await createClient()
  const [{ data: pricingRows, error: pricingError }, { data: sports, error: sportError }] = await Promise.all([
    supabase.from('pricing').select('id, start_time, end_time, price_per_hour').eq('active', true).order('start_time'),
    supabase.from('sports').select('id').eq('id', input.sportId).eq('active', true).maybeSingle(),
  ])
  if (pricingError || sportError) return { error: 'Could not load booking options. Please try again.' }
  if (!sports) return { error: 'That sport is not available.' }
  const { data: existingBookings, error } = await supabase.from('bookings').select('start_time, end_time').eq('sport_id', input.sportId).eq('booking_date', input.date).in('booking_status', ['pending_payment', 'pending', 'confirmed'])
  if (error) return { error: 'Could not check availability. Please try again.' }
  const windows: PricingWindowRow[] = (pricingRows ?? []).map((row) => ({ id: row.id, label: '', range_label: null, start_time: row.start_time, end_time: row.end_time, hourly_rate: Number(row.price_per_hour) }))
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const candidates = generateCandidateSlots(input.durationMinutes, existingBookings ?? [], input.date === today, now.getHours() * 60 + now.getMinutes())
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
  if (!isValidDate(input.date) || input.date < new Date().toISOString().slice(0, 10)) return { error: 'Bookings must be made for today or a future date.' }
  if (!VALID_DURATIONS.has(input.durationMinutes)) return { error: 'Please choose a valid duration.' }
  if (!TIME_RE.test(input.startTime) || !TIME_RE.test(input.endTime) || !input.sportId) return { error: 'Please provide valid booking details.' }
  if (!input.customerName.trim() || !/^[+\d][\d\s().-]{7,19}$/.test(input.customerPhone.trim())) return { error: 'Please provide a valid name and phone number.' }
  const start = timeToMinutes(input.startTime)
  const end = timeToMinutes(input.endTime)
  if (start < 360 || end <= start || end > 1440 || end - start !== input.durationMinutes) return { error: 'That time slot is invalid.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail.trim())) return { error: 'Please provide a valid email address.' }
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(input.idempotencyKey)) return { error: 'Please try submitting again.' }
  const supabase = await createClient()
  const publicToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(publicToken).digest('hex')
  const { data, error } = await supabase.rpc('create_guest_booking_atomic', { p_sport_id: input.sportId, p_booking_date: input.date, p_start_time: input.startTime, p_end_time: input.endTime === '00:00' ? '24:00' : input.endTime, p_duration_minutes: input.durationMinutes, p_customer_name: input.customerName.trim(), p_customer_phone: input.customerPhone.trim(), p_customer_email: input.customerEmail.trim(), p_idempotency_key: input.idempotencyKey, p_public_token_hash: tokenHash }).single() as { data: { id: string; booking_reference: string; amount: number | string } | null; error: { message: string } | null }
  if (error) {
    const message = error.message
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
  const supabase = await createClient(); const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { error: 'Unauthorized' }
  const { data, error } = await supabase.from('bookings').select('id, booking_reference, user_id, sport_id, booking_date, start_time, end_time, duration, amount, booking_status, payment_status, created_at, sports(name)').eq('id', bookingId).eq('user_id', user.user.id).maybeSingle()
  return error || !data ? { error: 'Booking not found.' } : { booking: data }
}

export async function getCustomerBookings() {
  const supabase = await createClient(); const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { error: 'Unauthorized' }
  const { data, error } = await supabase.from('bookings').select('id, booking_reference, booking_date, start_time, end_time, duration, amount, booking_status, payment_status, sports(name)').eq('user_id', user.user.id).order('booking_date', { ascending: false }).order('start_time', { ascending: false })
  return error ? { error: 'Could not load bookings.' } : { bookings: data ?? [] }
}

export async function calculatePrice(input: { startTime: string; endTime: string }) {
  const supabase = await createClient(); const { data, error } = await supabase.from('pricing').select('id, start_time, end_time, price_per_hour').eq('active', true)
  if (error) return { error: 'Could not load pricing.' }
  const windows = (data ?? []).map((row) => ({ id: row.id, label: '', range_label: null, start_time: row.start_time, end_time: row.end_time, hourly_rate: Number(row.price_per_hour) }))
  const total = calculateSplitTotal(timeToMinutes(input.startTime), timeToMinutes(input.endTime), windows)
  return total === null ? { error: 'Pricing unavailable.' } : { total }
}
