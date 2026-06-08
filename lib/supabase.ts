import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function createSupabaseClient() {
  return createClient<Database>(
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
