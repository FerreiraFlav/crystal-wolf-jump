import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, Wifi, Info, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';

export const SupabaseBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- SCRIPT DE CRIAÇÃO DE TABELAS PARA MEU ORÇAMENTO INTELIGENTE

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piggy_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL,
  current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  day_of_month INT,
  day_of_week INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DESATIVAR BLOQUEIO DE RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE piggy_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions DISABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    showSuccess('Script SQL copiado com sucesso!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded-full font-semibold shadow-xs cursor-pointer transition-all ${
          isSupabaseConfigured 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100' 
            : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
        }`}
        title="Clique para ver o status e script SQL do banco"
      >
        {isSupabaseConfigured ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Sincronizado (Nuvem)</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Modo Local (Off-line)</span>
            <Info className="w-3 h-3 text-amber-600 ml-0.5" />
          </>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
              <Database className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Banco de Dados Supabase Conectado
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              O projeto do Supabase está ativado para salvar suas receitas, despesas e cofrinhos na nuvem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sincronização em Nuvem Pronta!
              </p>
              <p className="text-emerald-700 text-[11px] leading-relaxed">
                Todas as alterações feitas por você no aplicativo são gravadas diretamente no seu projeto do Supabase.
              </p>
            </div>

            {/* Script SQL para criação rápida de tabelas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" /> Script SQL das Tabelas (Opcional):
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySql}
                  className="h-7 text-[11px] rounded-lg border-slate-300 font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar SQL'}
                </Button>
              </div>

              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-36 border border-slate-800 leading-normal">
                {sqlScript}
              </pre>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-2 font-medium"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};