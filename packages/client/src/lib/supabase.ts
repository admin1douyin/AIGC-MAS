import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

function validateConfig(url: string, key: string): void {
  if (!url) {
    throw new Error(
      `Missing required environment variable:\n` +
      `  VITE_SUPABASE_URL: ✗ MISSING\n` +
      `Please configure this in your .env file or Vercel environment variables.`
    );
  }

  if (!key) {
    throw new Error(
      `Missing required environment variable:\n` +
      `  VITE_SUPABASE_ANON_KEY: ✗ MISSING\n` +
      `Please configure this in your .env file or Vercel environment variables.`
    );
  }

  if (!isValidSupabaseKey(key)) {
    throw new Error(
      `Invalid Supabase API key format:\n` +
      `  VITE_SUPABASE_ANON_KEY is not a valid Supabase key\n` +
      `Valid formats: JWT (header.payload.signature) or sb_publishable_/sb_secret_ prefix\n` +
      `Please obtain the correct key from Supabase Dashboard > Project Settings > API`
    );
  }
}

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  validateConfig(supabaseUrl, supabaseAnonKey);

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
