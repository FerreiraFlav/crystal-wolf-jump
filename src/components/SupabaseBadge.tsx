import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, Wifi, Info, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const SupabaseBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (isSupabaseConfigured) {
    return (
      <div className="flex items-center space-x-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full font-semibold shadow-xs">
        <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>Supabase On-line (Nuvem)</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 text-xs bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/80 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer"
        title="Clique para entender sobre a conexão com a nuvem"
      >
        <Database className="w-3.5 h-3.5 text-amber-600" />
        <span>Modo Local (Aguardando Chaves Supabase)</span>
        <Info className="w-3 h-3 text-amber-600 ml-0.5" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-1">
              <Database className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Status da Conexão
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Atualmente seu aplicativo está no **Modo Local Seguro**.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Seus dados estão seguros!
              </p>
              <p className="text-emerald-700 text-[11px]">
                Mesmo em modo local, todos os seus lançamentos, receitas e limites ficam salvos no seu próprio navegador.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-semibold text-slate-800">Para conectar ao banco Supabase na nuvem:</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Adicione as duas variáveis de ambiente no seu projeto ou na Vercel:
              </p>
              <ul className="list-disc pl-4 text-[11px] font-mono text-slate-800 space-y-0.5 mt-1">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-2 font-medium"
            >
              Entendi, continuar navegando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};