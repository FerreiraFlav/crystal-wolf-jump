import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvUrl = (): string => {
  try {
    return (
      (import.meta.env.VITE_SUPABASE_URL as string) ||
      (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
      (import.meta.env.SUPABASE_URL as string) ||
      ''
    );
  } catch {
    return '';
  }
};

const getEnvKey = (): string => {
  try {
    return (
      (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
      (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
      (import.meta.env.SUPABASE_ANON_KEY as string) ||
      (import.meta.env.SUPABASE_PUBLISHABLE_KEY as string) ||
      (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
      ''
    );
  } catch {
    return '';
  }
};

export const getStoredSupabaseConfig = () => {
  try {
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_url') || '' : '';
    const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_key') || '' : '';
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
    if (typeof window === 'undefined') return;
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

export const isSupabaseConfigured: boolean = Boolean(
  currentConfig.url &&
  currentConfig.anonKey &&
  typeof currentConfig.url === 'string' &&
  currentConfig.url.startsWith('http') &&
  !currentConfig.url.includes('placeholder')
);

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured && currentConfig.url && currentConfig.anonKey) {
  try {
    supabaseClient = createClient(currentConfig.url, currentConfig.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (e) {
    console.warn('Supabase não pôde ser inicializado no momento do build:', e);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;