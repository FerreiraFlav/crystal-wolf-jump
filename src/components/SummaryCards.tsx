import React from 'react';
import { Expense, PiggyBank } from '@/types/finance';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank as PiggyIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SummaryCardsProps {
  expenses: Expense[];
  piggyBanks?: PiggyBank[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, piggyBanks = [] }) => {
  const { formatCurrency, t } = useLanguage();

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSpent = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSavedInPiggy = piggyBanks.reduce((acc, curr) => acc + curr.currentAmount, 0);

  // Saldo Líquido Disponível (Receitas - Despesas - Guardado nos Cofrinhos)
  const netBalance = totalIncome - totalSpent - totalSavedInPiggy;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Receitas */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-200 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('entries')}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalIncome)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Despesas */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-red-200 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('exits')}
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Líquido Disponível */}
      <Card className={`rounded-2xl shadow-sm border ${
        netBalance >= 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none' : 'bg-red-50 border-red-200 text-red-900'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${netBalance >= 0 ? 'text-emerald-100' : 'text-red-700'}`}>
              {t('netBalance')}
            </span>
            <div className={`p-2 rounded-xl ${netBalance >= 0 ? 'bg-white/10 text-white' : 'bg-red-200 text-red-800'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black tracking-tight">
              {formatCurrency(netBalance)}
            </span>
            {totalSavedInPiggy > 0 && (
              <span className={`block text-[11px] font-medium mt-1 ${netBalance >= 0 ? 'text-emerald-100' : 'text-red-700'}`}>
                ({formatCurrency(totalSavedInPiggy)} guardados nos cofrinhos)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Poupança */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('savingsRate')}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PiggyIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-2xl font-extrabold ${savingsRate >= 15 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {savingsRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">{t('incomeRetained')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};