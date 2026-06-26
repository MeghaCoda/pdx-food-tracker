export const QUICK_ACTION_TITLE = 'Free food near me now';
export const QUICK_ACTION_SUBTITLE = "Skip filters — show what's open";
export const FILTERS_HEADER = 'What are you looking for?';
export const ANYONE_LABEL = 'Anyone — no requirements';
export const SUBMIT_LABEL = 'Show me results';
export const SUBMIT_SUFFIX = '· list and map';

export const FILTER_SECTION_LABELS = {
  PRICE: 'Price',
  FOOD_TYPE: 'Food Type',
  HOW_YOU_GET_IT: 'How You Get It',
  ELIGIBILITY: 'Eligibility',
} as const;

export const TOGGLE_LABELS = {
  FREE: 'Free',
  DISCOUNT: 'Discount',
  PREPARED: 'Prepared',
  GROCERIES: 'Groceries',
  RESTAURANT: 'Restaurant',
  PICKUP: 'Pickup',
  DELIVERY: 'Delivery',
} as const;

export const ELIGIBILITY_OPTIONS = [
  { value: 'honor_system', label: 'Honor system' },
  { value: 'snap_ebt', label: 'SNAP / EBT' },
  { value: 'wic', label: 'WIC' },
  { value: 'seniors', label: 'Seniors (65+)' },
  { value: 'children', label: 'Children' },
  { value: 'income_restricted', label: 'Income restricted' },
  { value: 'residency_required', label: 'Residency required' },
];
