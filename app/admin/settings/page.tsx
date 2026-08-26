import { Clock3, Mail, ShieldCheck, Settings } from 'lucide-react'

import { CONTACT_INFO, OPERATING_HOURS, SITE } from '@/lib/config'

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin</span>
        <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Facility details and operational defaults.</p>
      </div>
      <div className="grid gap-[2px] bg-border sm:grid-cols-2">
        <Setting icon={Settings} label="Facility" value={SITE.name} detail={SITE.tagline} />
        <Setting icon={Clock3} label="Operating hours" value={OPERATING_HOURS.label} detail="Used when generating available booking slots." />
        <Setting icon={Mail} label="Contact" value={CONTACT_INFO.email} detail={CONTACT_INFO.phone} />
        <Setting icon={ShieldCheck} label="Access control" value="Admin-only" detail="Admin routes and mutations are protected by the profiles table." />
      </div>
    </div>
  )
}

function Setting({ icon: Icon, label, value, detail }: { icon: typeof Settings; label: string; value: string; detail: string }) {
  return (
    <div className="flex flex-col bg-card p-6">
      <Icon className="size-4 text-primary" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-base font-bold uppercase tracking-wide text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  )
}
