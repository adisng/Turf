import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function requireUser(nextPath = '/dashboard') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  return { supabase, user }
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser('/admin-login')
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect('/dashboard')
  return { supabase, user }
}

export function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

export function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)
}
