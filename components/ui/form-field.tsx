import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

function FormField({ label, htmlFor, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-subtle-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const fieldControlStyles =
  'w-full border-[2px] border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-subtle-foreground outline-none transition-colors focus:border-primary focus:ring-0'

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldControlStyles, className)} {...props} />
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldControlStyles, 'min-h-32 resize-none', className)} {...props} />
}

export { FormField, Input, Textarea }
