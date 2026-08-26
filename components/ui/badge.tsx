import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border-[2px] px-3 py-1 text-xs font-bold uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary/10 text-primary',
        neutral: 'border-border bg-card-secondary text-muted-foreground',
        success: 'border-success bg-success/10 text-success',
        warning: 'border-warning bg-warning/10 text-primary',
        destructive: 'border-destructive bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
