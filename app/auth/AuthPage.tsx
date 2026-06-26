'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_ROUTES, ROUTES } from '@/lib/constants';
import {
  SIGN_IN_TITLE,
  SIGN_IN_SUBTITLE,
  SIGN_IN_LABEL,
  SIGNING_IN_LABEL,
  SIGN_IN_DEFAULT_ERROR,
  FORGOT_PASSWORD_LABEL,
  EMAIL_PLACEHOLDER,
  RESET_PASSWORD_TITLE,
  RESET_PASSWORD_SUBTITLE,
  RESET_SUCCESS_MESSAGE,
  RESET_DEFAULT_ERROR,
  SEND_RESET_LABEL,
  SENDING_LABEL,
  BACK_TO_SIGN_IN,
  SIGNED_IN_TITLE,
  SIGNED_IN_SUBTITLE,
  SIGN_OUT_LABEL,
  SIGNING_OUT_LABEL,
} from './constants';

type View = 'signin' | 'reset';

function SignInForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const res = await fetch(API_ROUTES.AUTH_SIGNIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push(ROUTES.HOME);
    } else {
      const data = await res.json();
      setError(data.error ?? SIGN_IN_DEFAULT_ERROR);
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">{SIGN_IN_TITLE}</h2>
      <p className="text-sm text-muted-foreground mb-6">{SIGN_IN_SUBTITLE}</p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={EMAIL_PLACEHOLDER}
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

      <button
        onClick={onForgotPassword}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
      >
        {FORGOT_PASSWORD_LABEL}
      </button>
    </div>
  );
}

function ResetPasswordForm({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    const res = await fetch(API_ROUTES.AUTH_RESET_PASSWORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus('success');
    } else {
      const data = await res.json();
      setError(data.error ?? RESET_DEFAULT_ERROR);
      setStatus('error');
    }
    setIsPending(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">{RESET_PASSWORD_TITLE}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {RESET_PASSWORD_SUBTITLE}
      </p>

      {status === 'success' && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400"
        >
          {RESET_SUCCESS_MESSAGE}
        </div>
      )}

      {status === 'error' && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {status !== 'success' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              placeholder={EMAIL_PLACEHOLDER}
              required
              autoComplete="email"
            />
          </div>

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? SENDING_LABEL : SEND_RESET_LABEL}
          </Button>
        </form>
      )}

      <button
        onClick={onBack}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
      >
        {BACK_TO_SIGN_IN}
      </button>
    </div>
  );
}

function SignedInView() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await fetch(API_ROUTES.AUTH_SIGNOUT, { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">{SIGNED_IN_TITLE}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {SIGNED_IN_SUBTITLE}
      </p>
      <Button variant="outline" disabled={isPending} onClick={handleSignOut}>
        {isPending ? SIGNING_OUT_LABEL : SIGN_OUT_LABEL}
      </Button>
    </div>
  );
}

export function AuthPage({ user }: { user: User | null }) {
  const [view, setView] = useState<View>('signin');

  if (user) {
    return <SignedInView />;
  }

  return view === 'signin' ? (
    <SignInForm onForgotPassword={() => setView('reset')} />
  ) : (
    <ResetPasswordForm onBack={() => setView('signin')} />
  );
}
