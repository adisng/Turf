import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { syncMarketingContactToGoogleSheet } from '@/lib/google-sheets'

interface SaveMarketingContactInput {
  userId: string
  name: string
  email: string
  whatsappNumber: string
  marketingOptIn: boolean
  source: 'registration' | 'profile'
}

export async function saveMarketingContact(supabase: SupabaseClient, input: SaveMarketingContactInput) {
  const { data: existing, error: existingError } = await supabase
    .from('marketing_contacts')
    .select('id, consent_at')
    .eq('user_id', input.userId)
    .maybeSingle()

  if (existingError) throw existingError
  if (!input.marketingOptIn && !existing) return

  const now = new Date().toISOString()
  const { data: contact, error } = await supabase
    .from('marketing_contacts')
    .upsert({
      user_id: input.userId,
      name: input.name,
      email: input.email,
      whatsapp_number: input.whatsappNumber,
      marketing_opt_in: input.marketingOptIn,
      consent_at: input.marketingOptIn ? existing?.consent_at ?? now : existing?.consent_at ?? null,
      consent_source: input.source,
      opted_out_at: input.marketingOptIn ? null : now,
      updated_at: now,
    }, { onConflict: 'user_id' })
    .select('id, name, email, whatsapp_number, marketing_opt_in, consent_at, opted_out_at')
    .single()

  if (error) throw error

  try {
    await syncMarketingContactToGoogleSheet({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      whatsappNumber: contact.whatsapp_number,
      optedIn: contact.marketing_opt_in,
      consentAt: contact.consent_at,
      optedOutAt: contact.opted_out_at,
    })
  } catch (syncError) {
    // The consent record is authoritative in Supabase. A temporary Google API issue must not block a profile update.
    console.error('Google Sheets marketing contact sync failed.', syncError)
  }
}
