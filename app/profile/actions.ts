'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

export async function updateProfile(input: {
  fullName: string
  phone: string
}): Promise<{ success: true } | { error: string }> {
  const parsed = z.object({
    fullName: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(/^[+\d][\d\s().-]{7,19}$/),
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
    .from('profiles')
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq('id', user.id)

  if (error) {
    return { error: 'Could not save your changes. Please try again.' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { success: true }
}
