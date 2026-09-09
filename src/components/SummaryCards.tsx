import React from 'react';
import { Expense, PiggyBank } from '@/types/finance';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank as PiggyIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  expenses: Expense[];
  piggyBanks?: PiggyBank[];
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, piggyBanks = [], isLoading = false }) => {
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
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:border-emerald-200 dark:hover:border-emerald-500/40 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('entries')}
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalIncome)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Despesas */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:border-red-200 dark:hover:border-red-500/40 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('exits')}
            </span>
            <div className="p-2 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalSpent)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saldo Líquido Disponível */}
      <Card className={`rounded-2xl shadow-sm border ${
        netBalance >= 0
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 text-white border-none shadow-lg shadow-emerald-950/20'
          : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${netBalance >= 0 ? 'text-emerald-100' : 'text-red-700 dark:text-red-300'}`}>
              {t('netBalance')}
            </span>
            <div className={`p-2 rounded-xl ${netBalance >= 0 ? 'bg-white/10 text-white' : 'bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-36 rounded-lg bg-white/20 dark:bg-white/10" />
            ) : (
              <>
                <span className="text-2xl font-black tracking-tight">
                  {formatCurrency(netBalance)}
                </span>
                {totalSavedInPiggy > 0 && (
                  <span className={`block text-[11px] font-medium mt-1 ${netBalance >= 0 ? 'text-emerald-100' : 'text-red-700 dark:text-red-300'}`}>
                    ({formatCurrency(totalSavedInPiggy)} {t('savedInPiggies')})
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Poupança */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('savingsRate')}
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <PiggyIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <>
                <span className={`text-2xl font-extrabold ${savingsRate >= 15 ? 'text-emerald-600 dark:text-emerald-400' : savingsRate >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                  {savingsRate.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t('incomeRetained')}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};