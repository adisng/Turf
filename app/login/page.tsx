'use client'

import type React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SITE } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'
import { FormField, Input } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      const message = signInError.message.toLowerCase().includes('confirm')
        ? 'Please confirm your email before logging in.'
        : 'Invalid email or password.'
      setError(message)
      setIsSubmitting(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your bookings and account details.
          </p>
        </div>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </FormField>
          <FormField label="Password" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-primary hover:text-primary/80">
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}
