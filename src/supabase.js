import { createClient } from '@supabase/supabase-js';

// Environment Variables (Vite reads from .env.local locally or Vercel Environment Variables in production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase Environment Variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing!');
    }
    supabaseInstance = createClient(supabaseUrl || '', supabaseKey || '');
  }
  return supabaseInstance;
}
