'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  uploadOffers,
  getOffers,
  getOfferWithLocations,
  updateOffer,
  type CSVOfferRow,
  type OfferSummary,
  type OfferDetail,
  type BatchUploadResult,
  type UpdateOfferResult,
} from './actions';

// ============================================================
// Constants
// ============================================================

const BENEFIT_CATEGORIES = [
  { value: 'free_food', label: 'Free Food' },
  { value: 'discounted_food', label: 'Discounted Food' },
  { value: 'snap_accepted', label: 'SNAP Accepted' },
  { value: 'student_discount', label: 'Student Discount' },
  { value: 'senior_discount', label: 'Senior Discount' },
  { value: 'kids_eat_free', label: 'Kids Eat Free' },
  { value: 'bogo', label: 'BOGO' },
  { value: 'coupon', label: 'Coupon' },
  { value: 'free_breakfast', label: 'Free Breakfast' },
  { value: 'other', label: 'Other' },
] as const;

const VALID_BENEFITS = new Set(BENEFIT_CATEGORIES.map((b) => b.value));

// ============================================================
// CSV Parsing
// ============================================================

function parseCSVText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
      else if (ch === '"') { inQuotes = false; i++; }
      else { field += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ',') { row.push(field.trim()); field = ''; i++; }
      else if (ch === '\n' || ch === '\r') {
        row.push(field.trim());
        field = '';
        if (row.some((c) => c !== '')) rows.push(row);
        row = [];
        if (ch === '\r' && text[i + 1] === '\n') i++;
        i++;
      } else { field += ch; i++; }
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some((c) => c !== '')) rows.push(row);
  }
  return rows;
}

type ParseError = { row: number; message: string };
type ParseResult = { rows: CSVOfferRow[]; errors: ParseError[] };

function parseOffersCSV(text: string): ParseResult {
  const rawRows = parseCSVText(text);
  if (rawRows.length === 0) {
    return { rows: [], errors: [{ row: 0, message: 'File is empty.' }] };
  }

  const headers = rawRows[0].map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const dataRows = rawRows.slice(1);
  const errors: ParseError[] = [];
  const rows: CSVOfferRow[] = [];

  const get = (row: string[], col: string): string => {
    const i = headers.indexOf(col);
    return i >= 0 ? (row[i] ?? '') : '';
  };

  for (let r = 0; r < dataRows.length; r++) {
    const rawRow = dataRows[r];
    const rowNum = r + 2;
    const rowErrors: string[] = [];

    const name = get(rawRow, 'name');
    if (!name) rowErrors.push('name is required');

    let benefits: string[] | undefined;
    const benefitsRaw = get(rawRow, 'benefits');
    if (benefitsRaw) {
      const parts = benefitsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = parts.filter((p) => !VALID_BENEFITS.has(p as never));
      if (invalid.length > 0) {
        rowErrors.push(`invalid benefit values: ${invalid.join(', ')}`);
      } else {
        benefits = parts;
      }
    }

    let is_active: boolean | undefined;
    const isActiveRaw = get(rawRow, 'is_active').toLowerCase();
    if (isActiveRaw === 'true') is_active = true;
    else if (isActiveRaw === 'false') is_active = false;
    else if (isActiveRaw) rowErrors.push('is_active must be "true" or "false"');

    const address = get(rawRow, 'address');
    const city = get(rawRow, 'city');
    const state = get(rawRow, 'state');
    const zip_code = get(rawRow, 'zip_code');
    const hasAnyLocation = !!(
      address || city || state || zip_code ||
      get(rawRow, 'address2') || get(rawRow, 'neighborhood') || get(rawRow, 'phone_number')
    );

    let location: CSVOfferRow['location'];
    if (hasAnyLocation) {
      const missing: string[] = [];
      if (!address) missing.push('address');
      if (!city) missing.push('city');
      if (!state) missing.push('state');
      if (!zip_code) missing.push('zip_code');
      if (missing.length > 0) {
        rowErrors.push(`location requires: ${missing.join(', ')}`);
      } else {
        location = {
          address,
          address2: get(rawRow, 'address2') || undefined,
          city,
          state,
          zip_code,
          neighborhood: get(rawRow, 'neighborhood') || undefined,
          phone_number: get(rawRow, 'phone_number') || undefined,
        };
      }
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((msg) => errors.push({ row: rowNum, message: msg }));
    } else if (name) {
      rows.push({
        name,
        description: get(rawRow, 'description') || undefined,
        offer_desc: get(rawRow, 'offer_desc') || undefined,
        offer_source: get(rawRow, 'offer_source') || undefined,
        benefits,
        expires_at: get(rawRow, 'expires_at') || undefined,
        is_active,
        location,
      });
    }
  }

  return { rows, errors };
}

// ============================================================
// Shared styles
// ============================================================

const selectClass =
  'h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 transition-[color,box-shadow,background-color]';

// ============================================================
// Main component — mode picker
// ============================================================

type Mode = 'select' | 'upload' | 'modify';

export function UploadForm({ adminUserId }: { adminUserId: string }) {
  const [mode, setMode] = useState<Mode>('select');

  if (mode === 'upload') {
    return <CSVUploadPanel adminUserId={adminUserId} onBack={() => setMode('select')} />;
  }

  if (mode === 'modify') {
    return <ModifyOfferPanel onBack={() => setMode('select')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">What would you like to do?</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('upload')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors"
        >
          <p className="font-semibold">Upload new data</p>
          <p className="mt-1 text-sm text-muted-foreground">Import offers from a CSV file</p>
        </button>
        <button
          onClick={() => setMode('modify')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors"
        >
          <p className="font-semibold">Modify existing data</p>
          <p className="mt-1 text-sm text-muted-foreground">Edit an existing offer and its locations</p>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CSV Upload Panel
// ============================================================

function downloadExampleCSV() {
  const headers = [
    'name', 'description', 'offer_desc', 'offer_source', 'benefits',
    'expires_at', 'is_active', 'address', 'address2', 'city', 'state',
    'zip_code', 'neighborhood', 'phone_number',
  ];

  const rows: string[][] = [
    [
      'Oregon Food Bank',
      'Statewide network distributing food to those in need',
      'Free groceries available on designated distribution days',
      'https://www.oregonfoodbank.org',
      'free_food,snap_accepted',
      '',
      'true',
      '7900 NE 33rd Dr', '', 'Portland', 'OR', '97211', 'Parkrose', '503-282-0555',
    ],
    [
      'SE Uplift Community Fridge',
      'Community fridge stocked with donated food',
      'Take what you need, leave what you can',
      '',
      'free_food',
      '2026-12-31',
      'true',
      '3534 SE Main St', '', 'Portland', 'OR', '97214', 'Buckman', '',
    ],
    [
      'Eastside Diner Kids Night',
      'Family diner in NE Portland',
      'Kids 12 and under eat free with a paying adult on Tuesdays',
      '',
      'kids_eat_free,discounted_food',
      '2026-08-31',
      'true',
      '2337 NE Glisan St', '', 'Portland', 'OR', '97232', 'Kerns', '503-555-0142',
    ],
    [
      'Oregon SNAP Benefits',
      'State food assistance program for low-income households',
      'Apply online for monthly food assistance benefits',
      'https://www.oregon.gov/dhs/ASSISTANCE/FOOD-MED/Pages/SNAP.aspx',
      'snap_accepted,free_food',
      '',
      'true',
      '', '', '', '', '', '', '',
    ],
    [
      'Meals on Wheels People',
      'Home-delivered meals for seniors and adults with disabilities in the Portland metro area',
      'Free or reduced-cost meals delivered to your home; call to apply',
      'https://www.mowp.org',
      'free_food,senior_discount',
      '',
      'true',
      '', '', '', '', '', '', '',
    ],
  ];

  const escape = (v: string) =>
    v.includes(',') || v.includes('"') || v.includes('\n')
      ? `"${v.replace(/"/g, '""')}"`
      : v;

  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'example-offers.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function CSVUploadPanel({ adminUserId, onBack }: { adminUserId: string; onBack: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setParseResult(parseOffersCSV(ev.target?.result as string));
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!parseResult || parseResult.errors.length > 0 || parseResult.rows.length === 0) return;
    startTransition(async () => {
      const res = await uploadOffers(parseResult.rows, adminUserId);
      setUploadResult(res);
      if (res.success) {
        setParseResult(null);
        if (fileRef.current) fileRef.current.value = '';
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        ← Back
      </button>

      <div>
        <h2 className="text-lg font-semibold">Upload new offers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV with columns:{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            name, description, offer_desc, offer_source, benefits, expires_at, is_active,
            address, address2, city, state, zip_code, neighborhood, phone_number
          </code>
          . Separate multiple benefit values with commas.
          If any location field is present, address, city, state, and zip_code are all required.
        </p>
        <button
          onClick={downloadExampleCSV}
          className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          Download example CSV
        </button>
      </div>

      {uploadResult?.success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Successfully created {uploadResult.created} offer{uploadResult.created !== 1 ? 's' : ''}.
        </div>
      )}
      {uploadResult?.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {uploadResult.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="csv-file">CSV File</Label>
        <input
          ref={fileRef}
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
        />
      </div>

      {parseResult && parseResult.errors.length > 0 && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-destructive">
            {parseResult.errors.length} error{parseResult.errors.length !== 1 ? 's' : ''} — fix these before uploading:
          </p>
          <ul className="text-sm text-destructive list-disc list-inside space-y-1">
            {parseResult.errors.map((e, i) => (
              <li key={i}>{e.row > 0 ? `Row ${e.row}: ` : ''}{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {parseResult && parseResult.errors.length === 0 && parseResult.rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            {parseResult.rows.length} offer{parseResult.rows.length !== 1 ? 's' : ''} ready to upload:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Benefits</th>
                  <th className="px-3 py-2 text-left font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {parseResult.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.benefits?.join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.location ? `${row.location.address}, ${row.location.city}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? 'Uploading…'
              : `Upload ${parseResult.rows.length} offer${parseResult.rows.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Modify Offer Panel
// ============================================================

type EditState = {
  name: string;
  description: string;
  offer_desc: string;
  offer_source: string;
  benefits: string[];
  expires_at: string;
  is_active: string;
  verification_status: string;
};

function offerToEditState(offer: OfferDetail): EditState {
  return {
    name: offer.name,
    description: offer.description ?? '',
    offer_desc: offer.offer_desc ?? '',
    offer_source: offer.offer_source ?? '',
    benefits: offer.benefits ?? [],
    expires_at: offer.expires_at ?? '',
    is_active: offer.is_active == null ? '' : String(offer.is_active),
    verification_status: offer.verification_status ?? '',
  };
}

function ModifyOfferPanel({ onBack }: { onBack: () => void }) {
  const [offers, setOffers] = useState<OfferSummary[] | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [offerDetail, setOfferDetail] = useState<OfferDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveResult, setSaveResult] = useState<UpdateOfferResult | null>(null);

  useEffect(() => {
    getOffers().then((data) => {
      setOffers(data);
      setLoadingOffers(false);
    });
  }, []);

  const handleSelectOffer = (id: string) => {
    setSelectedId(id);
    setSaveResult(null);
    setOfferDetail(null);
    setEditState(null);
    if (!id) return;
    setLoadingDetail(true);
    getOfferWithLocations(id).then((detail) => {
      setLoadingDetail(false);
      if (detail) {
        setOfferDetail(detail);
        setEditState(offerToEditState(detail));
      }
    });
  };

  const set = (key: keyof EditState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditState((s) => s && { ...s, [key]: e.target.value });

  const toggleBenefit = (value: string) =>
    setEditState((s) => {
      if (!s) return s;
      return {
        ...s,
        benefits: s.benefits.includes(value)
          ? s.benefits.filter((b) => b !== value)
          : [...s.benefits, value],
      };
    });

  const handleSave = () => {
    if (!editState || !selectedId) return;
    setSaveResult(null);
    startTransition(async () => {
      const res = await updateOffer(selectedId, {
        name: editState.name,
        description: editState.description || null,
        offer_desc: editState.offer_desc || null,
        offer_source: editState.offer_source || null,
        benefits: editState.benefits.length > 0 ? editState.benefits : null,
        expires_at: editState.expires_at || null,
        is_active:
          editState.is_active === 'true' ? true
          : editState.is_active === 'false' ? false
          : null,
        verification_status: editState.verification_status || null,
      });
      setSaveResult(res);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        ← Back
      </button>

      <h2 className="text-lg font-semibold">Modify existing offer</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offer-select">Select an offer</Label>
        {loadingOffers ? (
          <p className="text-sm text-muted-foreground">Loading offers…</p>
        ) : (
          <select
            id="offer-select"
            value={selectedId}
            onChange={(e) => handleSelectOffer(e.target.value)}
            className={selectClass}
          >
            <option value="">— Select an offer —</option>
            {(offers ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
      </div>

      {loadingDetail && <p className="text-sm text-muted-foreground">Loading…</p>}

      {editState && offerDetail && (
        <div className="flex flex-col gap-6">
          {saveResult?.success && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Offer updated successfully.
            </div>
          )}
          {saveResult?.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {saveResult.error}
            </div>
          )}

          <fieldset className="flex flex-col gap-4">
            <legend className="text-base font-semibold mb-2">Offer Details</legend>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">
                Name <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Input id="edit-name" value={editState.name} onChange={set('name')} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={editState.description} onChange={set('description')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-offer-desc">Offer Description</Label>
              <Input id="edit-offer-desc" value={editState.offer_desc} onChange={set('offer_desc')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-offer-source">Offer Source</Label>
              <Input id="edit-offer-source" value={editState.offer_source} onChange={set('offer_source')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Benefits</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {BENEFIT_CATEGORIES.map((b) => (
                  <label key={b.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editState.benefits.includes(b.value)}
                      onChange={() => toggleBenefit(b.value)}
                    />
                    {b.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-expires-at">Expires At</Label>
                <Input id="edit-expires-at" type="date" value={editState.expires_at} onChange={set('expires_at')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-is-active">Active Status</Label>
                <select
                  id="edit-is-active"
                  value={editState.is_active}
                  onChange={set('is_active')}
                  className={selectClass}
                >
                  <option value="">Not set</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-verification-status">Verification Status</Label>
              <select
                id="edit-verification-status"
                value={editState.verification_status}
                onChange={set('verification_status')}
                className={selectClass}
              >
                <option value="">Not set</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </fieldset>

          <Button onClick={handleSave} disabled={isPending || !editState.name}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold">
              Locations ({offerDetail.locations.length})
            </h3>
            {offerDetail.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No locations associated with this offer.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {offerDetail.locations.map((loc) => (
                  <div key={loc.id} className="rounded-lg border border-border p-4 text-sm">
                    <p className="font-medium">
                      {loc.address}{loc.address2 ? `, ${loc.address2}` : ''}
                    </p>
                    <p className="text-muted-foreground">
                      {loc.city}, {loc.state} {loc.zip_code}
                    </p>
                    {loc.neighborhood && (
                      <p className="text-muted-foreground">{loc.neighborhood}</p>
                    )}
                    {loc.phone_number && (
                      <p className="text-muted-foreground">{loc.phone_number}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {loc.verification_status ?? 'not set'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
