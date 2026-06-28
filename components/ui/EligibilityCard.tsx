'use client'

import { cn } from '@/lib/utils'

interface EligibilityOption {
  value: string
  label: string
}

interface EligibilityCardProps {
  /** Section header label shown above the rows */
  sectionLabel?: string
  anyoneLabel: string
  options: EligibilityOption[]
  selected: string[]
  anyoneSelected: boolean
  onToggle: (value: string) => void
  className?: string
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center w-5 h-5 rounded-[3px] border-2 transition-colors',
        checked ? 'border-primary bg-primary' : 'border-border bg-surface-1'
      )}
      aria-hidden
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

export function EligibilityCard({
  sectionLabel,
  anyoneLabel,
  options,
  selected,
  anyoneSelected,
  onToggle,
  className,
}: EligibilityCardProps) {
  return (
    <div className={cn('bg-surface-1 rounded-xl border border-border overflow-hidden', className)}>
      {sectionLabel && (
        <p className="px-4 pt-4 pb-2 text-xs font-semibold tracking-widest text-text-muted uppercase border-b border-border">
          {sectionLabel}
        </p>
      )}
      {/* Anyone row — full width */}
      <button
        type="button"
        onClick={() => onToggle('anyone')}
        className="w-full flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer hover:bg-surface-0 transition-colors"
      >
        <CheckboxIcon checked={anyoneSelected} />
        <span className="text-sm font-medium text-text-primary">{anyoneLabel}</span>
      </button>

      {/* 2-column grid of specific options */}
      <div className="grid grid-cols-2">
        {options.map((opt, i) => {
          const isLastOdd = i === options.length - 1 && options.length % 2 !== 0
          const isChecked = selected.includes(opt.value) && !anyoneSelected
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-0 transition-colors',
                i % 2 === 0 && !isLastOdd ? 'border-r border-border' : '',
                i < options.length - (isLastOdd ? 1 : 2) ? 'border-b border-border' : '',
                isLastOdd ? 'col-span-2' : ''
              )}
            >
              <CheckboxIcon checked={isChecked} />
              <span className="text-sm text-text-secondary">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
