'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SITE } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const ACCOUNT_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/profile', label: 'Profile' },
]

function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b-[3px] border-border-strong bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center border-[2px] border-primary bg-primary font-heading text-xs font-black text-primary-foreground">
              TB
            </span>
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">{SITE.name}</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {ACCOUNT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">{children}</main>
    </div>
  )
}

export { AccountShell }
