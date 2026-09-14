import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Privacy</span>
        <h1 className="mt-3 font-heading text-4xl font-black uppercase tracking-tight text-foreground">Marketing preferences</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-muted-foreground">
          <p>We use your name, email address, and mobile number to manage your bookings and account. We only use your WhatsApp number for offers and promotional messages if you actively opt in.</p>
          <p>Marketing consent is optional and is never required to make a booking. You can withdraw consent at any time from your profile; we will then exclude you from future WhatsApp marketing campaigns.</p>
          <p>Customer and consent records are stored in our booking system. Opted-in contact details may also be mirrored to a restricted Google Sheet used by authorised staff for campaign management.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
