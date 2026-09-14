import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth/guards'

function csvCell(value: string | null | undefined) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export async function GET() {
  const { supabase } = await requireAdmin()
  const { data: contacts, error } = await supabase
    .from('marketing_contacts')
    .select('name, email, whatsapp_number, consent_at')
    .eq('marketing_opt_in', true)
    .is('opted_out_at', null)
    .order('consent_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Could not export marketing contacts.' }, { status: 500 })

  const csv = [
    ['Name', 'Email', 'WhatsApp number', 'Consent date'].map(csvCell).join(','),
    ...(contacts ?? []).map((contact) => [contact.name, contact.email, `+91 ${contact.whatsapp_number}`, contact.consent_at].map(csvCell).join(',')),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="turfbooking-whatsapp-contacts.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
