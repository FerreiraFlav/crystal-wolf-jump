import React from 'react';
import { PiggyBank } from '@/types/finance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PiggyBank as PiggyIcon, ChevronRight, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PiggyBankWidgetProps {
  piggyBanks: PiggyBank[];
  onOpenModal: () => void;
}

export const PiggyBankWidget: React.FC<PiggyBankWidgetProps> = ({
  piggyBanks,
  onOpenModal,
}) => {
  const { formatCurrency, t } = useLanguage();

  const totalSaved = piggyBanks.reduce((acc, p) => acc + p.currentAmount, 0);

  return (
    <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <PiggyIcon className="w-4 h-4" />
          </div>
          <span>{t('piggyBanks')}</span>
        </CardTitle>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenModal}
          className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold h-8 rounded-lg flex items-center gap-1"
        >
          <span>Gerenciar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Resumo Total Guardado */}
        <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              {t('totalInPiggyBanks')}
            </span>
            <span className="text-xl font-black text-emerald-950 mt-0.5 block">
              {formatCurrency(totalSaved)}
            </span>
          </div>
          <Button
            size="sm"
            onClick={onOpenModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm h-8 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('newPiggyBank')}
          </Button>
        </div>

        {/* Lista de Cofrinhos (Mini Cards) */}
        {piggyBanks.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-xs">
            Nenhum cofrinho criado ainda. Clique em "Gerenciar" para criar sua primeira meta.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {piggyBanks.slice(0, 4).map(piggy => {
              const percent = piggy.targetAmount > 0
                ? Math.min(100, Math.round((piggy.currentAmount / piggy.targetAmount) * 100))
                : 0;

              return (
                <div
                  key={piggy.id}
                  onClick={onOpenModal}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors truncate max-w-[130px]">
                      {piggy.name}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      {percent >= 100 && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {percent}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {formatCurrency(piggy.currentAmount)}
                      </span>
                      <span className="text-slate-400">
                        Meta: {formatCurrency(piggy.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};