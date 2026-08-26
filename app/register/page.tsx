'use client'

import type React from 'react'
import { useState } from 'react'
import Link from 'next/link'

import { SITE } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'
import { FormField, Input } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          phone,
        },
      },
    })

    if (signUpError) {
      const message = signUpError.message.toLowerCase().includes('already registered')
        ? 'An account with this email already exists.'
        : 'Something went wrong creating your account. Please try again.'
      setError(message)
      setIsSubmitting(false)
      return
    }

    setSubmitted(true)
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
        <div className="w-full max-w-sm border-[2px] border-success/30 bg-card p-8 text-center">
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">Check your inbox</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to <span className="text-foreground">{email}</span>. Confirm
            your email to activate your account, then log in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center border-[2px] border-primary bg-primary px-5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all duration-150 hover:bg-primary/90 hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_var(--primary)]"
          >
            Go to login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-sm border-[2px] border-border bg-card p-8">
        <Link href="/" className="flex items-center justify-center gap-3">
          <span className="flex size-9 items-center justify-center border-[2px] border-primary bg-primary font-heading text-xs font-black text-primary-foreground">
            TB
          </span>
          <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">{SITE.name}</span>
        </Link>

        <div className="mt-8 text-center">
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">Create an account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register to book slots and track your bookings.
          </p>
        </div>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label="Full name" htmlFor="register-name">
            <Input
              id="register-name"
              placeholder="Your name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
            />
          </FormField>
          <FormField label="Email" htmlFor="register-email">
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </FormField>
          <FormField label="Phone number" htmlFor="register-phone">
            <Input
              id="register-phone"
              type="tel"
              placeholder="+91 00000 00000"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Password" htmlFor="register-password">
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:text-primary/80">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
