'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantIcon: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-border text-foreground',
  success: 'border-success text-success',
  warning: 'border-warning text-primary',
  destructive: 'border-destructive text-destructive',
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2.5">
        {toasts.map((toast) => {
          const Icon = variantIcon[toast.variant]
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'flex items-start gap-3 border-[2px] bg-card p-4 shadow-[4px_4px_0_0_var(--border)] animate-in',
                variantStyles[toast.variant],
              )}
              style={{ animation: 'toast-in 0.2s ease-out' }}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-bold text-foreground">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 border-[2px] border-border p-0.5 text-subtle-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
                <span className="sr-only">Dismiss</span>
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export { ToastProvider, useToast }
