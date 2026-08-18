import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://ibmaxujobojnpfyonqka.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibWF4dWpvYm9qbnBmeW9ucWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTMyOTQsImV4cCI6MjEwMTU2OTI5NH0.JLCfYz_W2gvKa8gt6WJPx5U3ZDqnQ9IwIurQFMaSO3s';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

let supabaseInstance = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}
