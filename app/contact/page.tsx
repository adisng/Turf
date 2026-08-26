'use client'

import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { FormField, Input, Textarea } from '@/components/ui/form-field'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { CONTACT_INFO } from '@/lib/config'

const CONTACT_DETAILS = [
  { icon: MapPin, label: 'Location', value: CONTACT_INFO.address },
  { icon: Phone, label: 'Phone', value: CONTACT_INFO.phone },
  { icon: Mail, label: 'Email', value: CONTACT_INFO.email },
  { icon: Clock, label: 'Hours', value: CONTACT_INFO.hours },
]

function ContactForm() {
  const { showToast } = useToast()

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        showToast({
          title: 'Message queued',
          description: 'This form is a UI placeholder — no message was sent yet.',
          variant: 'default',
        })
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="contact-name">
          <Input id="contact-name" name="name" placeholder="Your name" required />
        </FormField>
        <FormField label="Phone number" htmlFor="contact-phone">
          <Input id="contact-phone" name="phone" type="tel" placeholder="+91 00000 00000" />
        </FormField>
      </div>
      <FormField label="Email" htmlFor="contact-email">
        <Input id="contact-email" name="email" type="email" placeholder="you@example.com" required />
      </FormField>
      <FormField label="Message" htmlFor="contact-message">
        <Textarea id="contact-message" name="message" placeholder="How can we help?" required />
      </FormField>
      <Button type="submit" size="lg" className="mt-2 self-start">
        Send message <Send className="size-3.5" />
      </Button>
    </form>
  )
}

export default function ContactPage() {
  return (
    <ToastProvider>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Contact</span>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">Get in touch</h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Questions about availability, group bookings, or memberships? Send us a message and
            we&apos;ll get back to you.
          </p>
        </div>

        <div className="mt-12 grid gap-[2px] bg-border lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col">
            {CONTACT_DETAILS.map((detail) => (
              <div key={detail.label} className="flex items-start gap-4 bg-card p-6">
                <div className="flex size-10 shrink-0 items-center justify-center border-[2px] border-border bg-card-secondary">
                  <detail.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle-foreground">
                    {detail.label}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card p-6">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </ToastProvider>
  )
}
