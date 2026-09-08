'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth/guards'
import { BOOKING_STATUSES, type BookingRow, type BookingStatus } from '@/lib/types'

export async function updateBookingStatus(bookingId: BookingRow['id'], status: BookingStatus) {
  const parsed = z.object({
    bookingId: z.string().trim().min(1).max(100),
    status: z.enum(BOOKING_STATUSES),
  }).safeParse({ bookingId, status })
  if (!parsed.success) return { error: 'Invalid booking status.' }
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('bookings').update({ booking_status: parsed.data.status }).eq('id', parsed.data.bookingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  return { success: true }
}
