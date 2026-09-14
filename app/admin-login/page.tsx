'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    })

    if (signInError) {
      setError('Invalid admin credentials.')
      setIsSubmitting(false)
      return
    }

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) {
      await supabase.auth.signOut()
      const data = await response.json().catch(() => ({}))
      setError(data.error || (response.status === 403 ? 'Admin access required.' : 'Could not verify admin access.'))
      setIsSubmitting(false)
      return
    }

    // Use a full navigation so the refreshed Supabase session is included
    // in the first request to the protected dashboard.
    window.location.assign('/admin')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-sm border-[2px] border-border bg-card p-8">
        <div className="text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-primary">TurfBooking</p>
          <h1 className="mt-3 font-heading text-xl font-black uppercase tracking-wide text-foreground">Admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use your Supabase admin account.</p>
        </div>
        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label="Admin username" htmlFor="admin-username">
            <Input id="admin-username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </FormField>
          <FormField label="Admin password" htmlFor="admin-password">
            <Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </FormField>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Checking…' : 'Open admin dashboard'}</Button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">Return to site</Link>
      </div>
    </main>
  )
}
