'use client'

import { useRouter } from 'next/navigation'
import { useSearchFilters, type FilterKey } from '@/store/searchFilters'
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
  TOGGLE_LABELS,
  ELIGIBILITY_OPTIONS,
} from './constants'

export default function SearchPage() {
  const router = useRouter()
  const { price, foodType, accessType, eligibility, toggle, toParams } = useSearchFilters()

  function handleToggle(key: FilterKey, value: string) {
    toggle(key, value)
  }

  function handleSubmit() {
    const params = toParams()
    router.push(`${ROUTES.MAP}?${params.toString()}`)
  }

  const anyoneSelected = eligibility.includes('anyone')

  function handleEligibilityToggle(value: string) {
    if (value === 'anyone') {
      toggle('eligibility', 'anyone')
      return
    }
    if (anyoneSelected) {
      toggle('eligibility', 'anyone')
    }
    toggle('eligibility', value)
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
            <FilterChip
              label={TOGGLE_LABELS.FREE}
              selected={price.includes('free')}
              onClick={() => handleToggle('price', 'free')}
              selectedClassName="bg-success border-success text-text-inverse"
              fullWidth
            />
            <FilterChip
              label={TOGGLE_LABELS.DISCOUNT}
              selected={price.includes('discount')}
              onClick={() => handleToggle('price', 'discount')}
              fullWidth
            />
          </div>
        </FilterSection>

        {/* Food Type */}
        <FilterSection label={FILTER_SECTION_LABELS.FOOD_TYPE}>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={TOGGLE_LABELS.PREPARED}
              selected={foodType.includes('prepared')}
              onClick={() => handleToggle('foodType', 'prepared')}
            />
            <FilterChip
              label={TOGGLE_LABELS.GROCERIES}
              selected={foodType.includes('groceries')}
              onClick={() => handleToggle('foodType', 'groceries')}
            />
            <FilterChip
              label={TOGGLE_LABELS.RESTAURANT}
              selected={foodType.includes('restaurant')}
              onClick={() => handleToggle('foodType', 'restaurant')}
            />
          </div>
        </FilterSection>

        {/* How you get it */}
        <FilterSection label={FILTER_SECTION_LABELS.HOW_YOU_GET_IT}>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={TOGGLE_LABELS.PICKUP}
              selected={accessType.includes('pickup')}
              onClick={() => handleToggle('accessType', 'pickup')}
            />
            <FilterChip
              label={TOGGLE_LABELS.DELIVERY}
              selected={accessType.includes('delivery')}
              onClick={() => handleToggle('accessType', 'delivery')}
            />
          </div>
        </FilterSection>

        {/* Eligibility */}
        <EligibilityCard
          sectionLabel={FILTER_SECTION_LABELS.ELIGIBILITY}
          anyoneLabel={ANYONE_LABEL}
          options={ELIGIBILITY_OPTIONS}
          selected={eligibility}
          anyoneSelected={anyoneSelected}
          onToggle={handleEligibilityToggle}
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
