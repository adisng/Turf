export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export interface BookingRow {
  id: string
  booking_reference: string
  user_id: string | null
  sport_id: string
  booking_date: string
  start_time: string
  end_time: string
  duration: number
  amount: number | string
  booking_status: BookingStatus
  payment_status: string
  created_at?: string
  users?: { name: string | null; email: string | null; mobile: string | null } | null
  sports?: { name: string } | null
}
