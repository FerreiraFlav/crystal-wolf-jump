import React from 'react';
import { User } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Sparkles, Globe } from 'lucide-react';
import { SupabaseBadge } from './SupabaseBadge';
import { useLanguage, Language } from '@/context/LanguageContext';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo e Nome */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-xl text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-slate-800 tracking-tight">
                {t('appTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {t('aiAssist')}
              </span>
            </div>
          </div>
        </div>

        {/* Status do Supabase, Seletor de Idioma & Usuário */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden lg:block">
            <SupabaseBadge />
          </div>

          {/* Seletor de Idioma */}
          <div className="relative flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 hidden sm:block" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1 py-0.5"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-full">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-slate-700 text-xs max-w-[80px] sm:max-w-[130px] truncate">
              {user.name}
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors px-2.5"
            title={t('logout')}
          >
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">{t('logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};