'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ADMIN_SIGN_IN_TITLE,
  ADMIN_SIGN_IN_SUBTITLE,
  ADMIN_EMAIL_PLACEHOLDER,
  SIGN_IN_LABEL,
  SIGNING_IN_LABEL,
} from './uploadConstants';

const initialState: SignInState = {};

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm">
      <h2 className="text-lg font-semibold mb-1">{ADMIN_SIGN_IN_TITLE}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {ADMIN_SIGN_IN_SUBTITLE}
      </p>

      {state.error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={ADMIN_EMAIL_PLACEHOLDER}
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2">
          {isPending ? SIGNING_IN_LABEL : SIGN_IN_LABEL}
        </Button>
      </form>
    </div>
  );
}
