'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const BookingIdSchema = z.string().trim().min(1).max(100)

export async function cancelBooking(bookingId: string): Promise<{ success: true } | { error: string }> {
  const parsed = BookingIdSchema.safeParse(bookingId)
  if (!parsed.success) return { error: 'Invalid booking.' }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in.' }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ booking_status: 'cancelled' })
    .eq('id', parsed.data)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Could not cancel booking. Please try again.' }
  }

  revalidatePath('/bookings')
  revalidatePath('/dashboard')
  revalidatePath('/admin')

  return { success: true }
}
