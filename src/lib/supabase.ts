import { createClient } from '@supabase/supabase-js';

// Suporta nomes de variáveis tanto do Vite (VITE_) quanto do Next.js (NEXT_PUBLIC_)
const supabaseUrl = 
  (import.meta.env.VITE_SUPABASE_URL as string) || 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) || 
  '';

const supabaseAnonKey = 
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 
  (import.meta.env.SUPABASE_ANON_KEY as string) || 
  (import.meta.env.SUPABASE_PUBLISHABLE_KEY as string) || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;