import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()
const AdminLoginSchema = z.object({
  username: z.string().trim().email().max(254),
  password: z.string().min(1),
})

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = attempts.get(ip)
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  current.count += 1
  return current.count > MAX_ATTEMPTS
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const credentials = AdminLoginSchema.safeParse(payload)
  if (!credentials.success) {
    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: credentials.data.username,
    password: credentials.data.password,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 })
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: 'A valid Supabase session is required.' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (error || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  attempts.delete(ip)
  return NextResponse.json({ ok: true })
}
