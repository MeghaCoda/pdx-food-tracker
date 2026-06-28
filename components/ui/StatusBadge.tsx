import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'error'

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: { badge: 'bg-success-subtle text-success', dot: 'bg-success' },
  warning: { badge: 'bg-warning-subtle text-warning', dot: 'bg-warning' },
  error:   { badge: 'bg-error-subtle text-error',     dot: 'bg-error'   },
}

interface StatusBadgeProps {
  variant: BadgeVariant
  label: string
  className?: string
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const { badge, dot } = variantClasses[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        badge,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} aria-hidden />
      {label}
    </span>
  )
}
