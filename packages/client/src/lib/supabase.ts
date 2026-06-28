import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function isValidJwtToken(key: string): boolean {
  const parts = key.split('.');
  return parts.length === 3 && 
         parts[0].length > 0 && 
         parts[1].length > 0 && 
         parts[2].length > 0;
}

if (!supabaseUrl) {
  throw new Error(
    `Missing required environment variable:\n` +
    `  VITE_SUPABASE_URL: ✗ MISSING\n` +
    `Please configure this in your .env file or Vercel environment variables.`
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    `Missing required environment variable:\n` +
    `  VITE_SUPABASE_ANON_KEY: ✗ MISSING\n` +
    `Please configure this in your .env file or Vercel environment variables.`
  );
}

if (!isValidJwtToken(supabaseAnonKey)) {
  throw new Error(
    `Invalid Supabase API key format:\n` +
    `  VITE_SUPABASE_ANON_KEY is not a valid JWT token\n` +
    `Valid JWT format: header.payload.signature (3 Base64-encoded parts separated by dots)\n` +
    `Please obtain the correct key from Supabase Dashboard > Project Settings > API`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
