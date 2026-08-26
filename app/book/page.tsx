import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import { BookingForm } from './booking-form'

export default async function BookPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const [{ data: sports }, { data: { user } }] = await Promise.all([
    supabase.from('sports').select('id, name, description').eq('active', true).order('name'),
    supabase.auth.getUser(),
  ])
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Book</span>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">Book your slot</h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">Pick a sport, date, and duration to see live availability and reserve your turf. You can pay securely at checkout.</p>
        </div>
        <BookingForm sports={(sports ?? []).map((sport) => ({ id: sport.id, name: sport.name, tagline: sport.description }))} initialDate={params.date} defaultName={user?.user_metadata?.name ?? ''} defaultPhone={user?.user_metadata?.mobile ?? ''} defaultEmail={user?.email ?? ''} />
      </main>
      <Footer />
    </>
  )
}
