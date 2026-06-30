'use client'

import { IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { FilterChip } from './FilterChip'
import {
  useSearchFilters,
  PRICE_OPTIONS,
  FOOD_TYPE_OPTIONS,
  ACCESS_OPTIONS,
  ELIGIBILITY_OPTIONS,
} from '@/store/searchFilters'

// ─── Sub-component ──────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <p className="w-28 shrink-0 pt-1.5 text-xs font-semibold tracking-widest uppercase text-text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// ─── Props ──────────────────────────────────────────────────────────────────────

export interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  onSearch: () => void
  onClearFilters: () => void
  className?: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function FilterDrawer({
  open,
  onClose,
  onSearch,
  onClearFilters,
  className,
}: FilterDrawerProps) {
  const { price, foodType, accessType, eligibility, toggle, toggleEligibility } = useSearchFilters()

  const totalActive =
    price.length +
    foodType.length +
    accessType.length +
    eligibility.filter((v) => v !== 'anyone').length

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-full md:max-w-sm bg-surface-1 shadow-2xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <p className="text-base font-semibold text-text-primary">
            Filters{totalActive > 0 ? ` (${totalActive})` : ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-0 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body: all filter groups stacked */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <FilterGroup label="Price">
            {PRICE_OPTIONS.map(({ value, label, selectedClassName }) => (
              <FilterChip
                key={value}
                label={label}
                selected={price.includes(value)}
                onClick={() => toggle('price', value)}
                selectedClassName={selectedClassName}
                compact
              />
            ))}
          </FilterGroup>

          <div className="border-t border-border" />

          <FilterGroup label="Food type">
            {FOOD_TYPE_OPTIONS.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                selected={foodType.includes(value)}
                onClick={() => toggle('foodType', value)}
                compact
              />
            ))}
          </FilterGroup>

          <div className="border-t border-border" />

          <FilterGroup label="How you get it">
            {ACCESS_OPTIONS.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                selected={accessType.includes(value)}
                onClick={() => toggle('accessType', value)}
                compact
              />
            ))}
          </FilterGroup>

          <div className="border-t border-border" />

          <FilterGroup label="Eligibility">
            {ELIGIBILITY_OPTIONS.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                selected={eligibility.includes(value)}
                onClick={() => toggleEligibility(value)}
                compact
              />
            ))}
          </FilterGroup>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 rounded-full text-sm text-text-secondary border border-border hover:border-primary hover:text-primary transition-colors"
          >
            Clear filters
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="px-6 py-2 rounded-full text-sm font-semibold text-text-inverse bg-primary hover:bg-primary-hover transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </>
  )
}
