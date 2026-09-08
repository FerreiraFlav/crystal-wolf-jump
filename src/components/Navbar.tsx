import React, { useState } from 'react';
import { User } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Sparkles, Globe, Coins, Sun, Moon } from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';
import { useLanguage, Language, CurrencyCode, POPULAR_CURRENCIES } from '@/context/LanguageContext';
import { useTheme } from '@/components/theme-provider';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt', label: 'Português (BR)', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <>
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto min-h-16 px-3 py-2 sm:px-6 sm:py-0 lg:px-8 flex items-center justify-between gap-2">
          {/* Logo e Nome */}
          <div className="flex shrink-0 items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2 rounded-xl text-white shadow-md shadow-emerald-500/20 sm:p-2.5">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
                  {t('appTitle')}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {t('aiAssist')}
                </span>
              </div>
            </div>
          </div>

          {/* Controles da Direita: Tema, Moeda, Idioma & Usuário */}
          <div className="flex min-w-0 flex-1 items-center justify-end space-x-1.5 sm:space-x-3">

            {/* Seletor de Tema (Claro / Escuro) - Versão Web Desktop (ao lado da Moeda) */}
            <div className="relative hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center p-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title={theme === 'dark' ? t('themeLight') : t('themeDark')}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-1" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 ml-1.5 mr-1" />
                )}
              </button>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1 py-0.5"
                title={theme === 'dark' ? t('themeLight') : t('themeDark')}
              >
                <option value="light" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {t('themeLight')}
                </option>
                <option value="dark" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {t('themeDark')}
                </option>
              </select>
            </div>

            {/* Seletor de Moeda Popular */}
            <div className="relative hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors">
              <Coins className="w-3.5 h-3.5 text-emerald-600 ml-1.5 mr-1 hidden sm:block" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1 py-0.5"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {c.symbol} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Idioma */}
            <div className="relative hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 hidden sm:block" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1 py-0.5"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Tema (Claro / Escuro) - Versão Celular (ao lado da letra F) */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex sm:hidden shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
              title={theme === 'dark' ? t('themeLight') : t('themeDark')}
              aria-label="Theme toggle"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Perfil Clicável do Usuário (Letra F no celular) */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex shrink-0 items-center space-x-2 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-200 dark:hover:border-slate-600 border border-slate-200/80 dark:border-slate-700 px-2 py-1.5 sm:px-3 rounded-full transition-all cursor-pointer group"
              title={t('myProfile')}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] transition-colors">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold text-xs max-w-[120px] truncate">
                {user.name}
              </span>
            </button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 rounded-lg transition-colors px-2 sm:px-2.5"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal de Detalhes do Perfil */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </>
  );
};
