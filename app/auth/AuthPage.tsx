'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Sign in failed.');
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">Sign In</h2>
      <p className="text-sm text-muted-foreground mb-6">Sign in to your account.</p>

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
            placeholder="you@example.com"
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
          {isPending ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <button
        onClick={onForgotPassword}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
      >
        Forgot your password?
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

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus('success');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to send reset email. Please try again.');
      setStatus('error');
    }
    setIsPending(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">Reset Password</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      {status === 'success' && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400"
        >
          Check your email for a password reset link.
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
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <button
        onClick={onBack}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
      >
        Back to sign in
      </button>
    </div>
  );
}

function SignedInView() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await fetch('/api/auth/signout', { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">You're signed in</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Click below to sign out of your account.
      </p>
      <Button variant="outline" disabled={isPending} onClick={handleSignOut}>
        {isPending ? 'Signing out…' : 'Sign Out'}
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
