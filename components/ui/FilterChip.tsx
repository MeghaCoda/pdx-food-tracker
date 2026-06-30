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
  /** Override background class for the checkbox when selected — should match the chip's selected background */
  selectedCheckboxClassName?: string
  className?: string
}

export function FilterChip({
  label,
  selected,
  onClick,
  compact = false,
  fullWidth = false,
  selectedClassName = 'bg-primary border-primary text-text-inverse',
  selectedCheckboxClassName = 'bg-transparent',
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
            'inline-flex shrink-0 items-center justify-center w-4 h-4 rounded-[3px] border-[1.5px]',
            selected ? cn('border-text-inverse', selectedCheckboxClassName) : 'border-border'
          )}
          aria-hidden
        >
          {selected && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      {label}
      {compact && (
        <span className={cn('text-sm leading-none', !selected && 'opacity-0')} aria-hidden>✕</span>
      )}
    </button>
  )
}
