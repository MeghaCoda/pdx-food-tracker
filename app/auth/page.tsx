import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { AuthPage } from './AuthPage';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let user: User | null = null;
  if (token) {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    const { data } = await client.auth.getUser(token);
    user = data.user;
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <AuthPage user={user} />
    </main>
  );
}
