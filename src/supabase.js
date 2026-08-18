import { createClient } from '@supabase/supabase-js';

// Reads from Vercel/Vite environment variables if set, or defaults to standard project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ibmaxujobojnpfyonqka.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibWF4dWpvYm9qbnBmeW9ucWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTMyOTQsImV4cCI6MjEwMTU2OTI5NH0.JLCfYz_W2gvKa8gt6WJPx5U3ZDqnQ9IwIurQFMaSO3s';

let supabaseInstance = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    if (!supabaseUrl) {
      throw new Error('Supabase URL is required. Please set VITE_SUPABASE_URL in Vercel environment variables.');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}
