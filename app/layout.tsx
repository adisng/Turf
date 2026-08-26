import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, Manrope } from 'next/font/google'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-sans-loaded' })
const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading-loaded' })
const _manrope = Manrope({ subsets: ['latin'], variable: '--font-display-loaded' })

export const metadata: Metadata = {
  title: 'TurfBooking — Premium Cricket & Football Turf',
  description:
    'Book premium cricket and football turf slots. Transparent pricing, instant confirmation, professional-grade facilities.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_spaceGrotesk.variable} ${_manrope.variable} antialiased font-sans`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
