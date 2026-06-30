'use client'

import { useRouter } from 'next/navigation'
import {
  useSearchFilters,
  PRICE_OPTIONS,
  FOOD_TYPE_OPTIONS,
  ACCESS_OPTIONS,
  ELIGIBILITY_OPTIONS,
} from '@/store/searchFilters'
import { ROUTES } from '@/lib/constants'
import { FilterChip } from '@/components/ui/FilterChip'
import { FilterSection } from '@/components/ui/FilterSection'
import { EligibilityCard } from '@/components/ui/EligibilityCard'
import { CtaBar } from '@/components/ui/CtaBar'
import {
  FILTERS_HEADER,
  ANYONE_LABEL,
  SUBMIT_LABEL,
  SUBMIT_SUFFIX,
  FILTER_SECTION_LABELS,
} from './constants'

export default function SearchPage() {
  const router = useRouter()
  const { price, foodType, accessType, eligibility, toggle, toggleEligibility, toParams } = useSearchFilters()

  function handleSubmit() {
    const params = toParams()
    router.push(`${ROUTES.RESULTS}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col min-h-full bg-surface-0">

      {/* Filter body */}
      <div className="flex-1 px-4 pt-6 pb-28 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase px-1">
          {FILTERS_HEADER}
        </p>

        {/* Price */}
        <FilterSection label={FILTER_SECTION_LABELS.PRICE}>
          <div className="flex gap-3">
            {PRICE_OPTIONS.map(({ value, label, selectedClassName }) => (
              <FilterChip
                key={value}
                label={label}
                selected={price.includes(value)}
                onClick={() => toggle('price', value)}
                selectedClassName={selectedClassName}
                fullWidth
              />
            ))}
          </div>
        </FilterSection>

        {/* Food Type */}
        <FilterSection label={FILTER_SECTION_LABELS.FOOD_TYPE}>
          <div className="flex flex-wrap gap-2">
            {FOOD_TYPE_OPTIONS.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                selected={foodType.includes(value)}
                onClick={() => toggle('foodType', value)}
              />
            ))}
          </div>
        </FilterSection>

        {/* How you get it */}
        <FilterSection label={FILTER_SECTION_LABELS.HOW_YOU_GET_IT}>
          <div className="flex flex-wrap gap-2">
            {ACCESS_OPTIONS.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                selected={accessType.includes(value)}
                onClick={() => toggle('accessType', value)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Eligibility */}
        <EligibilityCard
          sectionLabel={FILTER_SECTION_LABELS.ELIGIBILITY}
          anyoneLabel={ANYONE_LABEL}
          options={ELIGIBILITY_OPTIONS.filter((o) => o.value !== 'anyone')}
          selected={eligibility}
          anyoneSelected={eligibility.includes('anyone')}
          onToggle={toggleEligibility}
        />
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 px-4 pb-6 pt-2 bg-surface-0">
        <CtaBar
          label={SUBMIT_LABEL}
          sublabel={SUBMIT_SUFFIX}
          onClick={handleSubmit}
        />
      </div>
    </div>
  )
}
