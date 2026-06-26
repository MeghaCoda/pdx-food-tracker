'use client'

import { useRouter } from 'next/navigation'
import { useSearchFilters, type FilterKey } from '@/store/searchFilters'

function SquareIcon({ filled }: { filled: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 w-4 h-4 rounded-[3px] border-2 ${
        filled ? 'border-white' : 'border-gray-400'
      }`}
      aria-hidden
    />
  )
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center w-5 h-5 rounded-[3px] border-2 transition-colors ${
        checked ? 'border-[#2B5CA8] bg-[#2B5CA8]' : 'border-gray-300 bg-white'
      }`}
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

function ToggleButton({
  label,
  selected,
  onClick,
  selectedBg = 'bg-[#2B5CA8] border-[#2B5CA8]',
  fullWidth = false,
}: {
  label: string
  selected: boolean
  onClick: () => void
  selectedBg?: string
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
        fullWidth ? 'flex-1' : ''
      } ${
        selected
          ? `${selectedBg} text-white`
          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
      }`}
    >
      <SquareIcon filled={selected} />
      {label}
    </button>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <p className="px-4 pt-4 pb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        {label}
      </p>
      <div className="px-4 pb-4">{children}</div>
    </div>
  )
}

const ELIGIBILITY_OPTIONS = [
  { value: 'honor_system', label: 'Honor system' },
  { value: 'snap_ebt', label: 'SNAP / EBT' },
  { value: 'wic', label: 'WIC' },
  { value: 'seniors', label: 'Seniors (65+)' },
  { value: 'children', label: 'Children' },
  { value: 'income_restricted', label: 'Income restricted' },
  { value: 'residency_required', label: 'Residency required' },
]

export default function SearchPage() {
  const router = useRouter()
  const { price, foodType, accessType, eligibility, toggle, toParams } = useSearchFilters()

  function handleToggle(key: FilterKey, value: string) {
    toggle(key, value)
  }

  function handleSubmit() {
    const params = toParams()
    router.push(`/map?${params.toString()}`)
  }

  function handleQuickAction() {
    router.push('/map?openNow=true')
  }

  const anyoneSelected = eligibility.includes('anyone')

  function handleEligibilityToggle(value: string) {
    if (value === 'anyone') {
      toggle('eligibility', 'anyone')
      return
    }
    // If "anyone" is selected and user picks a specific option, deselect "anyone"
    if (anyoneSelected) {
      toggle('eligibility', 'anyone')
    }
    toggle('eligibility', value)
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F2F2F2]">
      {/* Blue header band */}
      <div className="bg-[#2B5CA8] px-4 pt-4 pb-6">
        <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-3">
          Rose City Finds
        </p>
        <button
          type="button"
          onClick={handleQuickAction}
          className="w-full bg-white rounded-xl px-4 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/90 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-[4px] border-2 border-[#2B5CA8]" aria-hidden>
              <span className="w-4 h-4 rounded-[2px] border-2 border-[#2B5CA8]" />
            </span>
            <div>
              <p className="text-[#2B5CA8] font-semibold text-base leading-tight">
                Free food near me now
              </p>
              <p className="text-[#2B5CA8] text-sm leading-tight mt-0.5">
                Skip filters — show what&apos;s open
              </p>
            </div>
          </div>
          <span className="flex items-center justify-center w-8 h-8 rounded-[4px] border-2 border-[#2B5CA8] shrink-0" aria-hidden>
            <span className="w-4 h-4 rounded-[2px] border-2 border-[#2B5CA8]" />
          </span>
        </button>
      </div>

      {/* Filter body */}
      <div className="flex-1 px-4 pt-6 pb-28 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase px-1">
          What are you looking for?
        </p>

        {/* Price */}
        <FilterSection label="Price">
          <div className="flex gap-3">
            <ToggleButton
              label="Free"
              selected={price.includes('free')}
              onClick={() => handleToggle('price', 'free')}
              selectedBg="bg-[#4A6B1C] border-[#4A6B1C]"
              fullWidth
            />
            <ToggleButton
              label="Discount"
              selected={price.includes('discount')}
              onClick={() => handleToggle('price', 'discount')}
              fullWidth
            />
          </div>
        </FilterSection>

        {/* Food Type */}
        <FilterSection label="Food Type">
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              label="Prepared"
              selected={foodType.includes('prepared')}
              onClick={() => handleToggle('foodType', 'prepared')}
            />
            <ToggleButton
              label="Groceries"
              selected={foodType.includes('groceries')}
              onClick={() => handleToggle('foodType', 'groceries')}
            />
            <ToggleButton
              label="Restaurant"
              selected={foodType.includes('restaurant')}
              onClick={() => handleToggle('foodType', 'restaurant')}
            />
          </div>
        </FilterSection>

        {/* How you get it */}
        <FilterSection label="How You Get It">
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              label="Pickup"
              selected={accessType.includes('pickup')}
              onClick={() => handleToggle('accessType', 'pickup')}
            />
            <ToggleButton
              label="Delivery"
              selected={accessType.includes('delivery')}
              onClick={() => handleToggle('accessType', 'delivery')}
            />
          </div>
        </FilterSection>

        {/* Eligibility */}
        <FilterSection label="Eligibility">
          {/* Anyone row */}
          <button
            type="button"
            onClick={() => handleEligibilityToggle('anyone')}
            className="w-full flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer"
          >
            <CheckboxIcon checked={anyoneSelected} />
            <span className="text-sm font-medium text-gray-800">Anyone — no requirements</span>
          </button>

          {/* 2-col grid */}
          <div className="grid grid-cols-2 mt-1">
            {ELIGIBILITY_OPTIONS.map((opt, i) => {
              const isLastOdd = i === ELIGIBILITY_OPTIONS.length - 1 && ELIGIBILITY_OPTIONS.length % 2 !== 0
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleEligibilityToggle(opt.value)}
                  className={`flex items-center gap-3 py-3 cursor-pointer ${
                    i % 2 === 0 && !isLastOdd ? 'border-r border-gray-100 pr-4' : 'pl-4'
                  } ${i < ELIGIBILITY_OPTIONS.length - (isLastOdd ? 1 : 2) ? 'border-b border-gray-100' : ''} ${
                    isLastOdd ? 'col-span-2' : ''
                  }`}
                >
                  <CheckboxIcon checked={eligibility.includes(opt.value) && !anyoneSelected} />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </FilterSection>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 px-4 pb-6 pt-2 bg-[#F2F2F2]">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-[#1A3A6C] text-white rounded-xl px-6 py-5 flex items-center justify-center gap-3 font-semibold text-lg cursor-pointer hover:bg-[#15305C] transition-colors"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-[3px] border-2 border-white shrink-0" aria-hidden />
          Show me results
          <span className="text-white/60 text-sm font-normal">· list and map</span>
        </button>
      </div>
    </div>
  )
}
