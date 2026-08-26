'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function updateProfile(input: {
  fullName: string
  phone: string
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: input.fullName.trim(), phone: input.phone.trim() })
    .eq('id', user.id)

  if (error) {
    return { error: 'Could not save your changes. Please try again.' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { success: true }
}
