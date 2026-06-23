import Link from 'next/link';
import { SignOutButton } from './SignOutButton';

export function Header({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Link href="/" className="text-2xl font-semibold">
        Food Map
      </Link>
      <nav>
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
