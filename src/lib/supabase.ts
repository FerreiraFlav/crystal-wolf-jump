import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Busca nas variáveis de ambiente padrão do Vite / Vercel / Next
const getEnvUrl = () => 
  (import.meta.env.VITE_SUPABASE_URL as string) || 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) || 
  (import.meta.env.SUPABASE_URL as string) || 
  '';

const getEnvKey = () => 
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 
  (import.meta.env.SUPABASE_ANON_KEY as string) || 
  (import.meta.env.SUPABASE_PUBLISHABLE_KEY as string) || 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) || 
  '';

// Busca também em chave salva pelo usuário na UI (se configurado manualmente)
export const getStoredSupabaseConfig = () => {
  try {
    const customUrl = localStorage.getItem('custom_supabase_url') || '';
    const customKey = localStorage.getItem('custom_supabase_key') || '';
    return {
      url: customUrl || getEnvUrl(),
      anonKey: customKey || getEnvKey(),
    };
  } catch {
    return {
      url: getEnvUrl(),
      anonKey: getEnvKey(),
    };
  }
};

export const saveCustomSupabaseConfig = (url: string, anonKey: string) => {
  try {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem('custom_supabase_url', url.trim());
      localStorage.setItem('custom_supabase_key', anonKey.trim());
    } else {
      localStorage.removeItem('custom_supabase_url');
      localStorage.removeItem('custom_supabase_key');
    }
  } catch (err) {
    console.error('Erro ao salvar credenciais do Supabase:', err);
  }
};

const currentConfig = getStoredSupabaseConfig();

export const isSupabaseConfigured = Boolean(
  currentConfig.url && 
  currentConfig.anonKey && 
  typeof currentConfig.url === 'string' &&
  currentConfig.url.startsWith('http') &&
  !currentConfig.url.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(currentConfig.url, currentConfig.anonKey)
  : null;