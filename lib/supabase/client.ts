import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Client Components (browser-side).
 * Falls back to placeholders during static pre-rendering builds if env vars are missing.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
