import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Users } from 'lucide-react'

import type { Sport } from '@/lib/config'
import { Badge } from '@/components/ui/badge'

function SportCard({ sport }: { sport: Sport }) {
  return (
    <Link
      href={`/book?sport=${sport.id}`}
      className="group relative block overflow-hidden border-[2px] border-border bg-card transition-all duration-150 hover:border-primary hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--primary)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={sport.image}
          alt={`${sport.name} turf at ${sport.surface}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <Badge className="absolute left-4 top-4">{sport.surface}</Badge>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">{sport.name}</h3>
          <p className="mt-1 text-sm font-medium text-primary">{sport.tagline}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{sport.description}</p>

        <div className="flex items-center justify-between border-t-[2px] border-border pt-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-subtle-foreground">
            <Users className="size-3.5" />
            <span>{sport.maxPlayers}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors group-hover:text-primary/80">
            Book now
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export { SportCard }
