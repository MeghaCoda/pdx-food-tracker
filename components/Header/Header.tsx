import Link from 'next/link';
import { cookies } from 'next/headers';
import { SignOutButton } from './SignOutButton';

export async function Header() {
  const cookieStore = await cookies();
  const isSignedIn = !!cookieStore.get('auth_token')?.value;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div>
        <p className="font-semibold leading-tight">Food Map</p>
        <p className="text-sm text-muted-foreground leading-tight">
          Free and Discounted Food near Portland, OR
        </p>
      </div>
      <nav className="shrink-0 ml-4">
        {isSignedIn ? (
          <SignOutButton />
        ) : (
          <Link
            href="/auth"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
