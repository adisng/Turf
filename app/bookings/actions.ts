'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function cancelBooking(bookingId: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in.' }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Could not cancel booking. Please try again.' }
  }

  revalidatePath('/bookings')
  revalidatePath('/dashboard')
  revalidatePath('/admin')

  return { success: true }
}
