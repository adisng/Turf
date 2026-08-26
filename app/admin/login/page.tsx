'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form-field'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      setError('Invalid admin credentials.')
      setIsSubmitting(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-sm border-[2px] border-border bg-card p-8">
        <div className="text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-primary">TurfBooking</p>
          <h1 className="mt-3 font-heading text-xl font-black uppercase tracking-wide text-foreground">Admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use the testing credentials configured for this project.</p>
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
