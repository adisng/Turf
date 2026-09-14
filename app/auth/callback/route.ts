import { createClient } from '@/lib/supabase/server'
import { saveMarketingContact } from '@/lib/marketing-contacts'
import { IndianPhoneSchema } from '@/lib/booking-validation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.marketing_opt_in === true) {
        const phone = IndianPhoneSchema.safeParse(String(user.user_metadata.phone ?? ''))
        if (!phone.success) {
          console.warn('Marketing contact was skipped because the signup phone number is invalid.')
        } else {
          try {
            await saveMarketingContact(supabase, {
              userId: user.id,
              name: String(user.user_metadata.full_name ?? ''),
              email: user.email ?? '',
              whatsappNumber: phone.data,
              marketingOptIn: true,
              source: 'registration',
            })
          } catch (marketingError) {
            // Account confirmation must still succeed if a deployment is awaiting the marketing migration.
            console.error('Marketing contact could not be created after signup.', marketingError)
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const errorCode = searchParams.get('error_code') ?? 'auth_callback_failed'
  const errorDescription = searchParams.get('error_description')
  const errorUrl = new URL('/auth/error', origin)
  errorUrl.searchParams.set('error_code', errorCode)
  if (errorDescription) errorUrl.searchParams.set('error_description', errorDescription)

  return NextResponse.redirect(errorUrl)
}
