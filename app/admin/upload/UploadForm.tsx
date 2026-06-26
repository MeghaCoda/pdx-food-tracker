'use client';

import { useState } from 'react';
import { SingleEntrySection } from './SingleEntrySection';
import { CSVSection } from './CSVSection';
import { ModifyOfferPanel } from './ModifyOfferPanel';
import { ApprovalPanel } from './ApprovalPanel';
import {
  BACK_LABEL,
  MODE_SELECTOR_HEADER,
  UPLOAD_NEW_TITLE,
  UPLOAD_NEW_DESC,
  MODIFY_TITLE,
  MODIFY_DESC,
  APPROVE_TITLE,
  APPROVE_DESC,
  UPLOAD_PANEL_TITLE,
  UPLOAD_PANEL_SUBTITLE,
  SINGLE_ENTRY_LABEL,
  CSV_UPLOAD_LABEL,
} from './uploadConstants';

type Mode = 'select' | 'upload' | 'modify' | 'approve';
type UploadSubMode = 'single' | 'csv';

export function UploadForm({ adminUserId }: { adminUserId: string }) {
  const [mode, setMode] = useState<Mode>('select');

  if (mode === 'upload') {
    return <UploadPanel adminUserId={adminUserId} onBack={() => setMode('select')} />;
  }

  if (mode === 'modify') {
    return <ModifyOfferPanel onBack={() => setMode('select')} />;
  }

  if (mode === 'approve') {
    return <ApprovalPanel onBack={() => setMode('select')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{MODE_SELECTOR_HEADER}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('upload')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors"
        >
          <p className="font-semibold">{UPLOAD_NEW_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{UPLOAD_NEW_DESC}</p>
        </button>
        <button
          onClick={() => setMode('modify')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors"
        >
          <p className="font-semibold">{MODIFY_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{MODIFY_DESC}</p>
        </button>
        <button
          onClick={() => setMode('approve')}
          className="rounded-xl border border-border bg-card p-6 text-left hover:border-ring transition-colors col-span-2"
        >
          <p className="font-semibold">{APPROVE_TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">{APPROVE_DESC}</p>
        </button>
      </div>
    </div>
  );
}

function UploadPanel({ adminUserId, onBack }: { adminUserId: string; onBack: () => void }) {
  const [subMode, setSubMode] = useState<UploadSubMode>('single');

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        {BACK_LABEL}
      </button>

      <div>
        <h2 className="text-lg font-semibold">{UPLOAD_PANEL_TITLE}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{UPLOAD_PANEL_SUBTITLE}</p>
      </div>

      <div className="flex gap-2 rounded-xl border border-border bg-muted/40 p-1 w-fit">
        <button
          onClick={() => setSubMode('single')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subMode === 'single'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {SINGLE_ENTRY_LABEL}
        </button>
        <button
          onClick={() => setSubMode('csv')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subMode === 'csv'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {CSV_UPLOAD_LABEL}
        </button>
      </div>

      {subMode === 'single' ? (
        <SingleEntrySection adminUserId={adminUserId} />
      ) : (
        <CSVSection adminUserId={adminUserId} />
      )}
    </div>
  );
}
