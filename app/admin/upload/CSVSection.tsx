'use client';

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadOffers, type BatchUploadResult } from './actions';
import { parseOffersCSV, type ParseResult } from './csvParser';
import {
  CSV_COLUMN_NAMES,
  CSV_MULTI_BENEFIT_HINT,
  CSV_DOWNLOAD_LABEL,
  CSV_FILE_LABEL,
  CSV_TABLE_NAME,
  CSV_TABLE_BENEFITS,
  CSV_TABLE_LOCATION,
  UPLOADING_LABEL,
} from './uploadConstants';

function downloadExampleCSV() {
  const headers = [
    'name', 'description', 'offer_desc', 'offer_source', 'benefits',
    'expires_at', 'is_active', 'notes', 'address', 'address2', 'city', 'state',
    'zip_code', 'neighborhood', 'phone_number', 'location_notes',
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
      '',
      '7900 NE 33rd Dr', '', 'Portland', 'OR', '97211', 'Parkrose', '503-282-0555', '',
    ],
    [
      'SE Uplift Community Fridge',
      'Community fridge stocked with donated food',
      'Take what you need, leave what you can',
      '',
      'free_food',
      '2026-12-31',
      'true',
      'Outdoor fridge; check social media for restocking schedule',
      '3534 SE Main St', '', 'Portland', 'OR', '97214', 'Buckman', '', '',
    ],
    [
      'Eastside Diner Kids Night',
      'Family diner in NE Portland',
      'Kids 12 and under eat free with a paying adult on Tuesdays',
      '',
      'kids_eat_free,discounted_food',
      '2026-08-31',
      'true',
      '',
      '2337 NE Glisan St', '', 'Portland', 'OR', '97232', 'Kerns', '503-555-0142', 'Dine-in only; offer valid 5–9pm',
    ],
    [
      'Oregon SNAP Benefits',
      'State food assistance program for low-income households',
      'Apply online for monthly food assistance benefits',
      'https://www.oregon.gov/dhs/ASSISTANCE/FOOD-MED/Pages/SNAP.aspx',
      'snap_accepted,free_food',
      '',
      'true',
      'Income limits apply; see website for eligibility details',
      '', '', '', '', '', '', '', '',
    ],
    [
      'Meals on Wheels People',
      'Home-delivered meals for seniors and adults with disabilities in the Portland metro area',
      'Free or reduced-cost meals delivered to your home; call to apply',
      'https://www.mowp.org',
      'free_food,senior_discount',
      '',
      'true',
      '',
      '', '', '', '', '', '', '', '',
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

export function CSVSection({ adminUserId }: { adminUserId: string }) {
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
      <div>
        <p className="text-sm text-muted-foreground">
          Upload a CSV with columns:{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {CSV_COLUMN_NAMES}
          </code>
          . {CSV_MULTI_BENEFIT_HINT}
        </p>
        <button
          onClick={downloadExampleCSV}
          className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {CSV_DOWNLOAD_LABEL}
        </button>
      </div>

      {uploadResult?.success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Successfully created {uploadResult.created} offer{uploadResult.created !== 1 ? 's' : ''}.
          {uploadResult.skipped > 0 && ` ${uploadResult.skipped} skipped (already exist).`}
        </div>
      )}
      {uploadResult?.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {uploadResult.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="csv-file">{CSV_FILE_LABEL}</Label>
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
                  <th className="px-3 py-2 text-left font-medium">{CSV_TABLE_NAME}</th>
                  <th className="px-3 py-2 text-left font-medium">{CSV_TABLE_BENEFITS}</th>
                  <th className="px-3 py-2 text-left font-medium">{CSV_TABLE_LOCATION}</th>
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
              ? UPLOADING_LABEL
              : `Submit ${parseResult.rows.length} offer${parseResult.rows.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
}
