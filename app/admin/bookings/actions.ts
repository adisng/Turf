'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return { error: 'You must be signed in.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    return { error: 'Admin access required.' }
  }

  const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  return { success: true }
}
