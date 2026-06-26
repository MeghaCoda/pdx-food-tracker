'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  getPendingResources,
  setResourceVerificationStatus,
  setLocationVerificationStatus,
  type PendingResource,
  type OfferLocation,
  type LocationHour,
} from './actions';
import {
  BENEFIT_CATEGORIES,
  DAY_ORDER,
  DAY_LABELS,
  BACK_LABEL,
  LOADING_LABEL,
  APPROVAL_PANEL_TITLE,
  APPROVAL_PANEL_SUBTITLE,
  ALL_CAUGHT_UP_TITLE,
  ALL_CAUGHT_UP_MESSAGE,
  APPROVE_LABEL,
  REJECT_LABEL,
  APPROVE_RESOURCE_LABEL,
  OFFER_FIELD_LABEL,
  SOURCE_FIELD_LABEL,
  HOURS_SECTION_LABEL,
  SAVING_LABEL,
} from './uploadConstants';

const benefitLabel = (value: string) =>
  BENEFIT_CATEGORIES.find((b) => b.value === value)?.label ?? value;

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function HoursList({ hours }: { hours: LocationHour[] }) {
  if (hours.length === 0) return null;
  const sorted = [...hours].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );
  return (
    <div className="mt-1 flex flex-col gap-0.5">
      {sorted.map((h) => (
        <p key={h.id} className="text-muted-foreground text-xs">
          <span className="w-8 inline-block font-medium text-foreground">{DAY_LABELS[h.day]}</span>
          {formatTime(h.opens_at)}–{formatTime(h.closes_at)}
          {h.notes && <span className="ml-1 text-muted-foreground">({h.notes})</span>}
        </p>
      ))}
    </div>
  );
}

function LocationCard({
  loc,
  onAction,
  loading,
}: {
  loc: OfferLocation;
  onAction: (id: string, status: 'approved' | 'rejected') => void;
  loading: boolean;
}) {
  const isPending = loc.verification_status === 'pending' || loc.verification_status == null;

  return (
    <div className="rounded-lg border border-border p-3 text-sm flex flex-col gap-2">
      <div>
        <p className="font-medium">
          {loc.address}
          {loc.address2 ? `, ${loc.address2}` : ''}
        </p>
        <p className="text-muted-foreground">
          {loc.city}, {loc.state} {loc.zip_code}
        </p>
        {loc.neighborhood && <p className="text-muted-foreground">{loc.neighborhood}</p>}
        {loc.phone_number && <p className="text-muted-foreground">{loc.phone_number}</p>}
        {loc.notes && <p className="text-muted-foreground">{loc.notes}</p>}
        {loc.hours.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-medium text-foreground">{HOURS_SECTION_LABEL}</p>
            <HoursList hours={loc.hours} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={loc.verification_status ?? 'pending'} />
        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onAction(loc.id, 'approved')}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
            >
              {APPROVE_LABEL}
            </button>
            <button
              onClick={() => onAction(loc.id, 'rejected')}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              {REJECT_LABEL}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400',
    approved: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400',
    rejected: 'bg-destructive/10 border-destructive/30 text-destructive',
  };
  const cls = styles[status] ?? styles.pending;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ResourceCard({
  item,
  onResourceAction,
  onLocationAction,
  loadingIds,
}: {
  item: PendingResource;
  onResourceAction: (id: string, status: 'approved' | 'rejected') => void;
  onLocationAction: (resourceId: string, locationId: string, status: 'approved' | 'rejected') => void;
  loadingIds: Set<string>;
}) {
  const resourceLoading = loadingIds.has(item.id);

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-semibold text-base leading-tight">{item.name}</p>
          {item.created_at && (
            <p className="text-xs text-muted-foreground">
              Added {new Date(item.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <StatusBadge status={item.verification_status} />
      </div>

      {(item.description || item.offer_desc || item.offer_source) && (
        <div className="flex flex-col gap-1 text-sm">
          {item.description && <p className="text-foreground">{item.description}</p>}
          {item.offer_desc && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{OFFER_FIELD_LABEL}</span>
              {item.offer_desc}
            </p>
          )}
          {item.offer_source && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{SOURCE_FIELD_LABEL}</span>
              {item.offer_source}
            </p>
          )}
        </div>
      )}

      {item.benefits && item.benefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.benefits.map((b) => (
            <span
              key={b}
              className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted/40 text-muted-foreground"
            >
              {benefitLabel(b)}
            </span>
          ))}
        </div>
      )}

      {(item.expires_at || item.notes) && (
        <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
          {item.expires_at && <p>Expires: {item.expires_at}</p>}
          {item.notes && <p>Notes: {item.notes}</p>}
        </div>
      )}

      {item.locations.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Locations ({item.locations.length})
          </p>
          {item.locations.map((loc) => (
            <LocationCard
              key={loc.id}
              loc={loc}
              onAction={(locId, status) => onLocationAction(item.id, locId, status)}
              loading={loadingIds.has(loc.id)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-border">
        <Button
          size="sm"
          onClick={() => onResourceAction(item.id, 'approved')}
          disabled={resourceLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {resourceLoading ? SAVING_LABEL : APPROVE_RESOURCE_LABEL}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onResourceAction(item.id, 'rejected')}
          disabled={resourceLoading}
        >
          {REJECT_LABEL}
        </Button>
      </div>
    </div>
  );
}

export function ApprovalPanel({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<PendingResource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setItems(null);
    setError(null);
    const data = await getPendingResources();
    setItems(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addLoading = (id: string) =>
    setLoadingIds((prev) => new Set([...prev, id]));
  const removeLoading = (id: string) =>
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });

  const handleResourceAction = async (id: string, status: 'approved' | 'rejected') => {
    addLoading(id);
    const res = await setResourceVerificationStatus(id, status);
    removeLoading(id);
    if (res.error) {
      setError(res.error);
    } else {
      setItems((prev) => prev?.filter((item) => item.id !== id) ?? null);
    }
  };

  const handleLocationAction = async (
    resourceId: string,
    locationId: string,
    status: 'approved' | 'rejected'
  ) => {
    addLoading(locationId);
    const res = await setLocationVerificationStatus(locationId, status);
    removeLoading(locationId);
    if (res.error) {
      setError(res.error);
    } else {
      setItems((prev) =>
        prev?.map((item) =>
          item.id === resourceId
            ? {
                ...item,
                locations: item.locations.map((loc) =>
                  loc.id === locationId ? { ...loc, verification_status: status } : loc
                ),
              }
            : item
        ) ?? null
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        {BACK_LABEL}
      </button>

      <div>
        <h2 className="text-lg font-semibold">{APPROVAL_PANEL_TITLE}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {APPROVAL_PANEL_SUBTITLE}
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {items === null && (
        <p className="text-sm text-muted-foreground">{LOADING_LABEL}</p>
      )}

      {items !== null && items.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="font-medium">{ALL_CAUGHT_UP_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{ALL_CAUGHT_UP_MESSAGE}</p>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground -mt-3">
            {items.length} resource{items.length !== 1 ? 's' : ''} pending
          </p>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <ResourceCard
                key={item.id}
                item={item}
                onResourceAction={handleResourceAction}
                onLocationAction={handleLocationAction}
                loadingIds={loadingIds}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
