import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client using the Service Role Key.
 * 
 * WARNING: This client bypasses Row Level Security (RLS) policies completely.
 * It must ONLY be used on the server in secure contexts (like API routes, Cron jobs),
 * and NEVER exposed to the client-side or browser environment.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
