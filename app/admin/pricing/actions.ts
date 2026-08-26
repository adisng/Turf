'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return { supabase: null, error: 'You must be signed in.' }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .maybeSingle()
  if (!profile?.is_admin) {
    return { supabase: null, error: 'Admin access required.' }
  }
  return { supabase, error: null }
}

export async function updatePricingWindow(id: string, hourlyRate: number) {
  const { supabase, error: authError } = await requireAdmin()
  if (!supabase) {
    return { error: authError }
  }

  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0 || hourlyRate > 100000) {
    return { error: 'Enter a valid hourly rate.' }
  }

  const { error } = await supabase
    .from('pricing_windows')
    .update({ hourly_rate: Math.round(hourlyRate) })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/pricing')
  revalidatePath('/book')
  revalidatePath('/pricing')
  return { success: true }
}
