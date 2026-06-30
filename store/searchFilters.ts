import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type FilterKey = 'price' | 'foodType' | 'accessType' | 'eligibility'

export const PRICE_OPTIONS: { value: string; label: string; selectedClassName?: string }[] = [
  { value: 'free',     label: 'Free',     selectedClassName: 'bg-success border-success text-text-inverse' },
  { value: 'discount', label: 'Discount' },
]

export const FOOD_TYPE_OPTIONS = [
  { value: 'prepared',   label: 'Prepared' },
  { value: 'groceries',  label: 'Groceries' },
  { value: 'restaurant', label: 'Restaurant' },
]

export const ACCESS_OPTIONS = [
  { value: 'dine_in',  label: 'Dine in' },
  { value: 'pickup',   label: 'Pickup' },
  { value: 'delivery', label: 'Delivery' },
]

export const ELIGIBILITY_OPTIONS = [
  { value: 'anyone',             label: 'Anyone' },
  { value: 'honor_system',       label: 'Honor system' },
  { value: 'snap_ebt',           label: 'SNAP / EBT' },
  { value: 'wic',                label: 'WIC' },
  { value: 'seniors',            label: 'Seniors (65+)' },
  { value: 'children',           label: 'Children' },
  { value: 'income_restricted',  label: 'Income restricted' },
  { value: 'residency_required', label: 'Residency required' },
  { value: 'military_discount',  label: 'Military' },
]

interface SearchFiltersState {
  price: string[]
  foodType: string[]
  accessType: string[]
  eligibility: string[]
  toggle: (key: FilterKey, value: string) => void
  toggleEligibility: (value: string) => void
  setFilter: (key: FilterKey, values: string[]) => void
  reset: () => void
  toParams: () => URLSearchParams
}

const defaultFilters = {
  price: ['free'] as string[],
  foodType: ['prepared'] as string[],
  accessType: ['pickup'] as string[],
  eligibility: ['anyone'] as string[],
}

export const useSearchFilters = create<SearchFiltersState>()(devtools((set, get) => ({
  ...defaultFilters,
  toggle(key, value) {
    set((state) => {
      const current = state[key]
      return {
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    }, false, { type: 'toggle', key, value })
  },
  toggleEligibility(value) {
    const { eligibility, toggle, setFilter } = get()
    if (value === 'anyone') { toggle('eligibility', 'anyone'); return }
    if (eligibility.includes('anyone')) { setFilter('eligibility', [value]); return }
    toggle('eligibility', value)
  },
  setFilter(key, values) {
    set({ [key]: values }, false, { type: 'setFilter', key, values })
  },
  reset() {
    set(defaultFilters, false, { type: 'reset' })
  },
  toParams() {
    const { price, foodType, accessType, eligibility } = get()
    const params = new URLSearchParams()
    if (price.length) params.set('price', price.join(','))
    if (foodType.length) params.set('foodType', foodType.join(','))
    if (accessType.length) params.set('accessType', accessType.join(','))
    if (eligibility.length) params.set('eligibility', eligibility.join(','))
    return params
  },
}), { name: 'searchFilters' }))
