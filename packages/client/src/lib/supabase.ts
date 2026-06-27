import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing required environment variables:\n` +
    `  VITE_SUPABASE_URL: ${supabaseUrl ? '✓ set' : '✗ MISSING'}\n` +
    `  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ set' : '✗ MISSING'}\n` +
    `Please configure these in your .env file or Vercel environment variables.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
