import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
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
