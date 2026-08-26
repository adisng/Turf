import { createClient } from '@/lib/supabase/server'

export const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'] as const

export async function getAdminBookings(filters?: { status?: string; date?: string; sportId?: string; search?: string }) {
  const supabase = await createClient()
  let query = supabase.from('bookings').select('id, booking_reference, user_id, sport_id, booking_date, start_time, end_time, duration, amount, booking_status, payment_status, created_at, users(name, email, mobile), sports(name)').order('booking_date', { ascending: false }).order('start_time', { ascending: false })
  if (filters?.status && filters.status !== 'all') query = query.eq('booking_status', filters.status)
  if (filters?.date) query = query.eq('booking_date', filters.date)
  if (filters?.sportId && filters.sportId !== 'all') query = query.eq('sport_id', filters.sportId)
  const { data, error } = await query.limit(200)
  let rows = data ?? []
  if (filters?.search) {
    const term = filters.search.toLowerCase()
    rows = rows.filter((row: any) => [row.booking_reference, row.users?.name, row.users?.email, row.users?.mobile].some((value) => String(value ?? '').toLowerCase().includes(term)))
  }
  return { bookings: rows, error }
}

export async function getSports() {
  const supabase = await createClient()
  return supabase.from('sports').select('id, name, description, image, active, created_at').order('name')
}

export function money(value: number | null | undefined) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`
}

export function dateToday() { return new Date().toISOString().slice(0, 10) }

export async function getAdminMetrics() {
  const supabase = await createClient()
  const today = dateToday()
  const [{ data: bookings }, { count: customers }] = await Promise.all([
    supabase.from('bookings').select('user_id, booking_date, amount, booking_status, start_time, end_time'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ])
  const rows = bookings ?? []
  const active = rows.filter((b) => ACTIVE_STATUSES.includes(b.booking_status as any))
  const todayRows = active.filter((b) => b.booking_date === today)
  const repeat = new Set(rows.map((b) => b.user_id)).size
  const counts = new Map<string, number>()
  rows.forEach((b) => counts.set(b.user_id, (counts.get(b.user_id) ?? 0) + 1))
  return { todayBookings: todayRows.length, upcoming: active.filter((b) => b.booking_date >= today).length, total: rows.length, revenue: todayRows.reduce((s, b) => s + Number(b.amount ?? 0), 0), repeatCustomers: [...counts.values()].filter((count) => count > 1).length, customers: customers ?? 0 }
}
