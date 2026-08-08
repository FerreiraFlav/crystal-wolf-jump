import React from 'react';
import { User } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Sparkles } from 'lucide-react';
import { SupabaseBadge } from './SupabaseBadge';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
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
                Meu Orçamento <span className="text-emerald-600 font-extrabold">Inteligente</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                IA Assist
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Controle financeiro pessoal</p>
          </div>
        </div>

        {/* Status do Supabase & Usuário */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden md:block">
            <SupabaseBadge />
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-slate-700 max-w-[100px] sm:max-w-[160px] truncate">
              {user.name}
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair do aplicativo"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};