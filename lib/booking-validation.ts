import { z } from 'zod'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function isValidCalendarDate(date: string) {
  if (!DATE_RE.test(date)) return false
  const parsed = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}

export const BookingDateSchema = z.string().regex(DATE_RE).refine(isValidCalendarDate, 'Invalid date')
export const TimeSchema = z.string().regex(TIME_RE)
export const BookingIdSchema = z.string().trim().min(1).max(100)

export const IndianPhoneSchema = z.string().trim().transform((value) => {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits
}).refine((value) => /^[6-9]\d{9}$/.test(value), 'Invalid Indian mobile number')

export const CreateBookingSchema = z.object({
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

export const AvailableSlotsSchema = z.object({
  sportId: z.string().trim().min(1).max(100),
  date: BookingDateSchema,
  durationMinutes: CreateBookingSchema.shape.durationMinutes,
})
