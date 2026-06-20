import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { SignInForm } from './SignInForm';
import { UploadForm } from './UploadForm';
import { signOut } from './actions';

type Session =
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'admin'; email: string; userId: string };

async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return { status: 'unauthenticated' };

  const authClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) return { status: 'unauthenticated' };

  if (user.app_metadata?.role !== 'admin') return { status: 'unauthorized' };

  return { status: 'admin', email: user.email!, userId: user.id };
}

export default async function AdminUploadPage() {
  const session = await getSession();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin: Upload Location</h1>
        {session.status === 'admin' && (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Signed in as {session.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>

      {session.status === 'unauthenticated' && <SignInForm />}

      {session.status === 'unauthorized' && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">Access denied</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account does not have admin permissions.
          </p>
          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-2 block text-sm underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Go home
          </Link>
        </div>
      )}

      {session.status === 'admin' && <UploadForm adminUserId={session.userId} />}
    </main>
  );
}
