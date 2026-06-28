'use client'

import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  /** Compact variant: no checkbox square, smaller padding. Used in the results bar. */
  compact?: boolean
  fullWidth?: boolean
  /** Override classes for the selected state (defaults to primary) */
  selectedClassName?: string
  className?: string
}

export function FilterChip({
  label,
  selected,
  onClick,
  compact = false,
  fullWidth = false,
  selectedClassName = 'bg-primary border-primary text-text-inverse',
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border text-sm font-medium transition-colors cursor-pointer select-none',
        compact ? 'px-3.5 py-1.5' : 'px-4 py-2',
        fullWidth && 'flex-1 justify-center',
        selected
          ? selectedClassName
          : 'bg-surface-1 border-border text-text-primary hover:border-primary',
        className
      )}
    >
      {!compact && (
        <span
          className={cn(
            'inline-flex shrink-0 w-4 h-4 rounded-[3px] border-[1.5px]',
            selected ? 'border-text-inverse' : 'border-border'
          )}
          aria-hidden
        />
      )}
      {label}
    </button>
  )
}
