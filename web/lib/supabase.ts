import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
}

// Client for unauthenticated / anon operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates an authenticated Supabase client for Route Handlers.
 * Extracts the JWT token from the Authorization header or sb-access-token cookie.
 * This guarantees PostgREST enforces RLS (auth.uid() = user_id).
 */
export async function getSupabaseServerClient(req?: Request): Promise<{
  supabase: SupabaseClient;
  token?: string;
}> {
  let token: string | undefined;

  // 1. Check Authorization Bearer header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  // 2. Check Cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('sb-access-token')?.value;
    } catch {
      // Cookie store inaccessible in some contexts
    }
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return { supabase: client, token };
}
