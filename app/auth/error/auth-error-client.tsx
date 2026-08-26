'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { SITE } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'

export default function AuthErrorClient() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('The confirmation link is invalid or has expired.')
  const [isSending, setIsSending] = useState(false)

  async function resendConfirmation() {
    if (!email.trim()) {
      setMessage('Enter your email address to receive a new confirmation link.')
      return
    }
    setIsSending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` },
    })
    setMessage(error ? 'We could not send a new link. Please check the email and try again.' : 'A new confirmation link has been sent. Check your inbox.')
    setIsSending(false)
  }

  const errorCode = searchParams.get('error_code')
  const heading = errorCode === 'otp_expired' ? 'Confirmation link expired' : 'Authentication link unavailable'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-md border-[2px] border-border bg-card p-8">
        <Link href="/" className="flex items-center justify-center gap-3"><span className="flex size-9 items-center justify-center border-[2px] border-primary bg-primary font-heading text-xs font-black text-primary-foreground">TB</span><span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">{SITE.name}</span></Link>
        <div className="mt-8 text-center"><h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">{heading}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p></div>
        <div className="mt-8 flex flex-col gap-4"><FormField label="Email address" htmlFor="resend-email"><Input id="resend-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></FormField><Button type="button" size="lg" onClick={resendConfirmation} disabled={isSending}>{isSending ? 'Sending…' : 'Send new confirmation link'}</Button><Link href="/login" className="text-center text-sm font-bold text-primary hover:text-primary/80">Return to login</Link></div>
      </div>
    </main>
  )
}
