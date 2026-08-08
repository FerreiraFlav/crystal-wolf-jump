import React from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, Wifi, ShieldAlert } from 'lucide-react';

export const SupabaseBadge: React.FC = () => {
  if (isSupabaseConfigured) {
    return (
      <div className="flex items-center space-x-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full font-semibold">
        <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>Supabase On-line (Nuvem)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full font-semibold">
      <Database className="w-3.5 h-3.5 text-amber-600" />
      <span>Modo Local (Aguardando Chaves Supabase)</span>
    </div>
  );
};