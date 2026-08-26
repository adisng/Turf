import Link from 'next/link'

import { CONTACT_INFO, SITE } from '@/lib/config'

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { href: '/sports', label: 'Sports' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/book', label: 'Book a slot' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/register', label: 'Register' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
]

function Footer() {
  return (
    <footer className="border-t-[3px] border-border-strong bg-card">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center border-[2px] border-primary bg-primary font-heading text-xs font-black text-primary-foreground">
                TB
              </span>
              <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                {SITE.name}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{SITE.tagline}</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t-[2px] border-border pt-6 text-xs text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>{CONTACT_INFO.phone} · {CONTACT_INFO.email}</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
