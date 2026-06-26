'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadOffers, type CSVOfferRow, type BatchUploadResult } from './actions';
import {
  BENEFIT_CATEGORIES,
  DAYS_OF_WEEK,
  selectClass,
  OFFER_DETAILS_LEGEND,
  NAME_LABEL,
  DESCRIPTION_LABEL,
  OFFER_DESC_LABEL,
  OFFER_SOURCE_LABEL,
  BENEFITS_LABEL,
  EXPIRES_AT_LABEL,
  ACTIVE_STATUS_LABEL,
  NOTES_LABEL,
  LOCATION_LEGEND,
  LOCATION_OPTIONAL_HINT,
  LOCATION_REQUIRED_HINT,
  ADDRESS_LABEL,
  ADDRESS2_LABEL,
  CITY_LABEL,
  STATE_LABEL,
  ZIP_CODE_LABEL,
  NEIGHBORHOOD_LABEL,
  PHONE_LABEL,
  LOCATION_NOTES_LABEL,
  HOURS_LEGEND,
  ADD_HOURS_LABEL,
  REMOVE_LABEL,
  SELECT_DAY_PLACEHOLDER,
  OPENS_AT_LABEL,
  CLOSES_AT_LABEL,
  STATUS_NOT_SET,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  SUBMITTING_LABEL,
  SUBMIT_LABEL,
  OFFER_CREATED_SUCCESS,
  VALIDATION_NAME_REQUIRED,
  VALIDATION_ADDRESS_REQUIRED,
  VALIDATION_CITY_REQUIRED,
  VALIDATION_STATE_REQUIRED,
  VALIDATION_ZIP_REQUIRED,
  VALIDATION_LOCATION_FOR_HOURS,
  VALIDATION_ERRORS_HEADER,
} from './uploadConstants';

type HourEntry = {
  day: string;
  opens_at: string;
  closes_at: string;
  notes: string;
};

type SingleEntryState = {
  name: string;
  description: string;
  offer_desc: string;
  offer_source: string;
  benefits: string[];
  expires_at: string;
  is_active: string;
  notes: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  phone_number: string;
  location_notes: string;
  hours: HourEntry[];
};

const emptyState: SingleEntryState = {
  name: '',
  description: '',
  offer_desc: '',
  offer_source: '',
  benefits: [],
  expires_at: '',
  is_active: '',
  notes: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  zip_code: '',
  neighborhood: '',
  phone_number: '',
  location_notes: '',
  hours: [],
};

function validate(s: SingleEntryState): string[] {
  const errors: string[] = [];
  if (!s.name.trim()) errors.push(VALIDATION_NAME_REQUIRED);

  const hasAnyLocation = !!(
    s.address || s.address2 || s.city || s.state ||
    s.zip_code || s.neighborhood || s.phone_number || s.location_notes
  );
  if (hasAnyLocation) {
    if (!s.address.trim()) errors.push(VALIDATION_ADDRESS_REQUIRED);
    if (!s.city.trim()) errors.push(VALIDATION_CITY_REQUIRED);
    if (!s.state.trim()) errors.push(VALIDATION_STATE_REQUIRED);
    if (!s.zip_code.trim()) errors.push(VALIDATION_ZIP_REQUIRED);
  }

  if (s.hours.length > 0 && !hasAnyLocation) {
    errors.push(VALIDATION_LOCATION_FOR_HOURS);
  }

  s.hours.forEach((h, i) => {
    const n = i + 1;
    if (!h.day) errors.push(`Hours row ${n}: day is required.`);
    if (!h.opens_at) errors.push(`Hours row ${n}: opening time is required.`);
    if (!h.closes_at) errors.push(`Hours row ${n}: closing time is required.`);
  });

  return errors;
}

function toOfferRow(s: SingleEntryState): CSVOfferRow {
  const hasAnyLocation = !!(
    s.address || s.address2 || s.city || s.state ||
    s.zip_code || s.neighborhood || s.phone_number || s.location_notes
  );
  return {
    name: s.name.trim(),
    description: s.description.trim() || undefined,
    offer_desc: s.offer_desc.trim() || undefined,
    offer_source: s.offer_source.trim() || undefined,
    benefits: s.benefits.length > 0 ? s.benefits : undefined,
    expires_at: s.expires_at || undefined,
    is_active: s.is_active === 'true' ? true : s.is_active === 'false' ? false : undefined,
    notes: s.notes.trim() || undefined,
    location: hasAnyLocation
      ? {
          address: s.address.trim(),
          address2: s.address2.trim() || undefined,
          city: s.city.trim(),
          state: s.state.trim(),
          zip_code: s.zip_code.trim(),
          neighborhood: s.neighborhood.trim() || undefined,
          phone_number: s.phone_number.trim() || undefined,
          notes: s.location_notes.trim() || undefined,
          hours: s.hours.length > 0
            ? s.hours.map((h) => ({
                day: h.day,
                opens_at: h.opens_at,
                closes_at: h.closes_at,
                notes: h.notes.trim() || undefined,
              }))
            : undefined,
        }
      : undefined,
  };
}

export function SingleEntrySection({ adminUserId }: { adminUserId: string }) {
  const [form, setForm] = useState<SingleEntryState>(emptyState);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitResult, setSubmitResult] = useState<BatchUploadResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const set =
    (key: keyof SingleEntryState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const addHour = () =>
    setForm((s) => ({ ...s, hours: [...s.hours, { day: '', opens_at: '', closes_at: '', notes: '' }] }));

  const removeHour = (i: number) =>
    setForm((s) => ({ ...s, hours: s.hours.filter((_, idx) => idx !== i) }));

  const setHour =
    (i: number, key: keyof HourEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({
        ...s,
        hours: s.hours.map((h, idx) => (idx === i ? { ...h, [key]: e.target.value } : h)),
      }));

  const toggleBenefit = (value: string) =>
    setForm((s) => ({
      ...s,
      benefits: s.benefits.includes(value)
        ? s.benefits.filter((b) => b !== value)
        : [...s.benefits, value],
    }));

  const handleSubmit = () => {
    const errors = validate(form);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSubmitResult(null);
      return;
    }
    setValidationErrors([]);
    setSubmitResult(null);
    startTransition(async () => {
      const res = await uploadOffers([toOfferRow(form)], adminUserId);
      setSubmitResult(res);
      if (res.success) setForm(emptyState);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {submitResult?.success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {OFFER_CREATED_SUCCESS}
        </div>
      )}
      {submitResult?.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {submitResult.error}
        </div>
      )}
      {validationErrors.length > 0 && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-destructive">{VALIDATION_ERRORS_HEADER}</p>
          <ul className="text-sm text-destructive list-disc list-inside space-y-1">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold mb-2">{OFFER_DETAILS_LEGEND}</legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-name">
            {NAME_LABEL} <span className="text-destructive" aria-label="required">*</span>
          </Label>
          <Input id="single-name" value={form.name} onChange={set('name')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-description">{DESCRIPTION_LABEL}</Label>
          <Input id="single-description" value={form.description} onChange={set('description')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-offer-desc">{OFFER_DESC_LABEL}</Label>
          <Input id="single-offer-desc" value={form.offer_desc} onChange={set('offer_desc')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-offer-source">{OFFER_SOURCE_LABEL}</Label>
          <Input id="single-offer-source" value={form.offer_source} onChange={set('offer_source')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{BENEFITS_LABEL}</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {BENEFIT_CATEGORIES.map((b) => (
              <label key={b.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.benefits.includes(b.value)}
                  onChange={() => toggleBenefit(b.value)}
                />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-expires-at">{EXPIRES_AT_LABEL}</Label>
            <Input id="single-expires-at" type="date" value={form.expires_at} onChange={set('expires_at')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-is-active">{ACTIVE_STATUS_LABEL}</Label>
            <select id="single-is-active" value={form.is_active} onChange={set('is_active')} className={selectClass}>
              <option value="">{STATUS_NOT_SET}</option>
              <option value="true">{STATUS_ACTIVE}</option>
              <option value="false">{STATUS_INACTIVE}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-notes">{NOTES_LABEL}</Label>
          <Input id="single-notes" value={form.notes} onChange={set('notes')} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold mb-2">
          {LOCATION_LEGEND} <span className="text-sm font-normal text-muted-foreground">{LOCATION_OPTIONAL_HINT}</span>
        </legend>
        <p className="text-sm text-muted-foreground -mt-2">
          {LOCATION_REQUIRED_HINT}
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-address">{ADDRESS_LABEL}</Label>
          <Input id="single-address" value={form.address} onChange={set('address')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-address2">{ADDRESS2_LABEL}</Label>
          <Input id="single-address2" value={form.address2} onChange={set('address2')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-city">{CITY_LABEL}</Label>
            <Input id="single-city" value={form.city} onChange={set('city')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-state">{STATE_LABEL}</Label>
            <Input id="single-state" value={form.state} onChange={set('state')} placeholder="OR" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-zip">{ZIP_CODE_LABEL}</Label>
            <Input id="single-zip" value={form.zip_code} onChange={set('zip_code')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-neighborhood">{NEIGHBORHOOD_LABEL}</Label>
            <Input id="single-neighborhood" value={form.neighborhood} onChange={set('neighborhood')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="single-phone">{PHONE_LABEL}</Label>
            <Input id="single-phone" value={form.phone_number} onChange={set('phone_number')} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="single-location-notes">{LOCATION_NOTES_LABEL}</Label>
          <Input id="single-location-notes" value={form.location_notes} onChange={set('location_notes')} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>{HOURS_LEGEND}</Label>
            <button
              type="button"
              onClick={addHour}
              className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {ADD_HOURS_LABEL}
            </button>
          </div>
          {form.hours.map((h, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`hour-day-${i}`}>Day</Label>
                  <select id={`hour-day-${i}`} value={h.day} onChange={setHour(i, 'day')} className={selectClass}>
                    <option value="">{SELECT_DAY_PLACEHOLDER}</option>
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`hour-open-${i}`}>{OPENS_AT_LABEL}</Label>
                  <Input id={`hour-open-${i}`} type="time" value={h.opens_at} onChange={setHour(i, 'opens_at')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`hour-close-${i}`}>{CLOSES_AT_LABEL}</Label>
                  <Input id={`hour-close-${i}`} type="time" value={h.closes_at} onChange={setHour(i, 'closes_at')} />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label htmlFor={`hour-notes-${i}`}>{NOTES_LABEL}</Label>
                  <Input id={`hour-notes-${i}`} value={h.notes} onChange={setHour(i, 'notes')} placeholder="e.g. Closed holidays" />
                </div>
                <button
                  type="button"
                  onClick={() => removeHour(i)}
                  className="h-9 px-3 text-sm text-destructive underline underline-offset-4 hover:text-destructive/80 transition-colors"
                >
                  {REMOVE_LABEL}
                </button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending ? SUBMITTING_LABEL : SUBMIT_LABEL}
      </Button>
    </div>
  );
}
