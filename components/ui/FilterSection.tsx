import { cn } from '@/lib/utils'

interface FilterSectionProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function FilterSection({ label, children, className }: FilterSectionProps) {
  return (
    <div className={cn('bg-surface-1 rounded-xl border border-border overflow-hidden', className)}>
      <p className="px-4 pt-4 pb-2 text-xs font-semibold tracking-widest text-text-muted uppercase">
        {label}
      </p>
      <div className="px-4 pb-4">{children}</div>
    </div>
  )
}
