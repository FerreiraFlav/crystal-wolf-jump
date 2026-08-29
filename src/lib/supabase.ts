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
      url: (customUrl || getEnvUrl()).trim(),
      anonKey: (customKey || getEnvKey()).trim(),
    };
  } catch {
    return {
      url: getEnvUrl().trim(),
      anonKey: getEnvKey().trim(),
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

export const checkIsConfigured = (): boolean => {
  const cfg = getStoredSupabaseConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    typeof cfg.url === 'string' &&
    cfg.url.startsWith('http') &&
    !cfg.url.includes('placeholder')
  );
};

export const isSupabaseConfigured: boolean = checkIsConfigured();

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey || !config.url.startsWith('http')) {
    return null;
  }

  if (cachedClient && lastUsedUrl === config.url && lastUsedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
    return cachedClient;
  } catch (e) {
    console.warn('Erro ao criar cliente Supabase:', e);
    return null;
  }
};

export const supabase = getSupabase();