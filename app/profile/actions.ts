'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { IndianPhoneSchema } from '@/lib/booking-validation'
import { saveMarketingContact } from '@/lib/marketing-contacts'

export async function updateProfile(input: {
  fullName: string
  phone: string
  marketingOptIn: boolean
}): Promise<{ success: true } | { error: string }> {
  const parsed = z.object({
    fullName: z.string().trim().min(2).max(100),
    phone: IndianPhoneSchema,
    marketingOptIn: z.boolean(),
  }).safeParse(input)
  if (!parsed.success) return { error: 'Please provide valid profile details.' }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in.' }
  }

  const { error } = await supabase
    .from('users')
    .update({ name: parsed.data.fullName, mobile: parsed.data.phone })
    .eq('id', user.id)

  if (error) {
    return { error: 'Could not save your changes. Please try again.' }
  }

  try {
    await saveMarketingContact(supabase, {
      userId: user.id,
      name: parsed.data.fullName,
      email: user.email ?? '',
      whatsappNumber: parsed.data.phone,
      marketingOptIn: parsed.data.marketingOptIn,
      source: 'profile',
    })
  } catch (marketingError) {
    console.error('Marketing preference could not be saved.', marketingError)
    return { error: 'Your profile was updated, but your WhatsApp preference could not be saved. Please try again.' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { success: true }
}
