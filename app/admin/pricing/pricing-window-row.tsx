'use client'

import { useState, useTransition } from 'react'
import { Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { updatePricingWindow } from './actions'

interface PricingWindowRowProps {
  id: string
  label: string
  rangeLabel: string | null
  hourlyRate: number
}

export function PricingWindowRow({ id, label, rangeLabel, hourlyRate }: PricingWindowRowProps) {
  const [value, setValue] = useState(String(hourlyRate))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isDirty = Number(value) !== hourlyRate

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      const result = await updatePricingWindow(id, Number(value))
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Rate updated.' })
      }
    })
  }

  return (
    <div className="flex flex-col bg-card p-6">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-primary" />
        <p className="font-heading text-base font-bold uppercase tracking-wide text-foreground">{label}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{rangeLabel}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">₹</span>
        <input
          type="number"
          min={1}
          max={100000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 border-[2px] border-border bg-background px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:border-primary"
        />
        <span className="text-sm text-muted-foreground">/hr</span>
        <Button
          size="sm"
          variant="secondary"
          disabled={!isDirty || isPending}
          onClick={handleSave}
          className="ml-auto"
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {message ? (
        <p className={`mt-2 text-xs ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
