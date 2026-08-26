'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Trophy,
  Grid3x3,
  Tag,
  BarChart3,
  Settings,
  ArrowUpRight,
} from 'lucide-react'

import { SITE } from '@/lib/config'
import { cn } from '@/lib/utils'

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarClock },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/sports', label: 'Sports', icon: Trophy },
  { href: '/admin/slots', label: 'Slots', icon: Grid3x3 },
  { href: '/admin/pricing', label: 'Pricing', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r-[3px] border-border-strong bg-card sm:flex sm:flex-col">
        <div className="flex h-16 items-center gap-3 border-b-[3px] border-border-strong px-5">
          <span className="flex size-9 items-center justify-center border-[2px] border-primary bg-primary font-heading text-xs font-black text-primary-foreground">
            TB
          </span>
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
            {SITE.name} Admin
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {ADMIN_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2.5 border-[2px] border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:border-border hover:bg-card-secondary hover:text-foreground',
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t-[2px] border-border-strong p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 border-[2px] border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-border hover:bg-card-secondary hover:text-foreground"
          >
            Exit admin
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b-[3px] border-border-strong bg-background px-5 sm:hidden">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{SITE.name} Admin</span>
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Exit
          </Link>
        </header>
        <main className="px-5 py-10 sm:px-10">{children}</main>
      </div>
    </div>
  )
}

export { AdminShell }
