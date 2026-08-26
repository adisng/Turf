'use client'

import { useState, useTransition } from 'react'

import { FormField, Input } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { updateProfile } from './actions'

interface ProfileFormProps {
  email: string
  initialFullName: string
  initialPhone: string
}

export function ProfileForm({ email, initialFullName, initialPhone }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const result = await updateProfile({ fullName, phone })
      if ('error' in result) {
        setError(result.error)
        return
      }
      setSaved(true)
    })
  }

  return (
    <div className="max-w-xl border-[2px] border-border bg-card p-6">
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="profile-name">
            <Input
              id="profile-name"
              placeholder="Your name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </FormField>
          <FormField label="Phone number" htmlFor="profile-phone">
            <Input
              id="profile-phone"
              placeholder="+91 00000 00000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="profile-email">
          <Input id="profile-email" type="email" value={email} disabled />
        </FormField>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved ? <p className="text-sm text-success">Profile updated.</p> : null}
        <Button onClick={handleSave} disabled={isPending} className="self-start">
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
