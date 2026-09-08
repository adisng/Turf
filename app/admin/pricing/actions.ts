'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth/guards'

export async function updatePricingWindow(id: string, hourlyRate: number) {
  const parsed = z.object({
    id: z.string().trim().min(1).max(100),
    hourlyRate: z.number().finite().gt(0).max(100000),
  }).safeParse({ id, hourlyRate })
  if (!parsed.success) return { error: 'Enter a valid hourly rate.' }
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('pricing')
    .update({ price_per_hour: Math.round(parsed.data.hourlyRate) })
    .eq('id', parsed.data.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/pricing')
  revalidatePath('/book')
  revalidatePath('/pricing')
  return { success: true }
}
