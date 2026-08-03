import React from 'react';
import { AIAdvice } from '@/types/finance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingDown, Target, Lightbulb, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  advice: AIAdvice | null;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose, advice }) => {
  if (!advice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 text-white relative">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold text-white">
                  Diagnóstico Financeiro IA
                </DialogTitle>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Consultor Virtual
                </span>
              </div>
              <DialogDescription className="text-slate-300 text-xs mt-1">
                Análise personalizada do seu padrão de consumo no mês atual.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Pontuação da Saúde Financeira */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                  Score de Saúde Financeira
                </span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                  {advice.healthScore} <span className="text-xs font-normal text-emerald-700">/ 100</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {advice.healthScore > 75 ? 'A+' : advice.healthScore > 50 ? 'B' : 'C'}
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">
                  Potencial de Economia
                </span>
                <span className="text-2xl font-black text-teal-900 mt-1 block">
                  R$ {advice.savingsPotential.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 bg-teal-200 text-teal-800 rounded-xl">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Diagnóstico Geral */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Parecer do Especialista
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              {advice.diagnosis}
            </div>
          </div>

          {/* Recomendações Práticas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Dicas Práticas de Otimização
            </h4>
            <div className="space-y-2">
              {advice.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs sm:text-sm text-slate-800 flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold text-xs shrink-0 mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plano de Ação Imediato */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Plano de Ação Sugerido
            </h4>
            <div className="space-y-2">
              {advice.actionPlan.map((action, i) => (
                <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-xs sm:text-sm text-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs px-5"
          >
            Entendido, fechar análise
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};