import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy Supabase client initialization.
 *
 * The client is NOT created during module loading. Instead, it's created
 * on first access via the Proxy. This prevents the serverless function
 * from crashing at cold-start when SUPABASE_SERVICE_ROLE_KEY is not yet
 * configured (the Supabase SDK throws "supabaseKey is required" if the
 * key is empty).
 *
 * Endpoints that don't use Supabase auth will work fine without the key.
 * Endpoints that do use Supabase auth will get a clear error from the
 * auth middleware's try-catch block.
 */

let _client: SupabaseClient | null = null;

function isValidSupabaseKey(key: string): boolean {
  if (key.startsWith('sb_publishable_') || key.startsWith('sb_secret_')) {
    return key.length > 20;
  }
  const parts = key.split('.');
  return parts.length === 3 && 
         parts[0].length > 0 && 
         parts[1].length > 0 && 
         parts[2].length > 0;
}

function getClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl) {
    throw new Error(
      `Supabase client not initialized: SUPABASE_URL is MISSING. ` +
      `Configure this environment variable in Vercel project settings.`
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      `Supabase client not initialized: SUPABASE_SERVICE_ROLE_KEY is MISSING. ` +
      `Configure this environment variable in Vercel project settings.`
    );
  }

  if (!isValidSupabaseKey(supabaseServiceKey)) {
    throw new Error(
      `Supabase client not initialized: SUPABASE_SERVICE_ROLE_KEY is not a valid Supabase key. ` +
      `Valid formats: JWT (header.payload.signature) or sb_publishable_/sb_secret_ prefix. ` +
      `Obtain the correct key from Supabase Dashboard > Project Settings > API.`
    );
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/**
 * Lazy proxy - delegates all property access to the real client,
 * which is created on first access.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
