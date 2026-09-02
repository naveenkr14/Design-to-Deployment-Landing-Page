import { createClient } from '@supabase/supabase-js';
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnon) {
  console.warn('Missing Supabase env vars. Copy client/.env.local.example to client/.env.local and fill in your values.');
}
export const supabase = createClient(supabaseUrl || '', supabaseAnon || '');
