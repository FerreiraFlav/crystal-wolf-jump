import React from 'react';
import { Expense } from '@/types/finance';
import { CATEGORIES } from '@/services/storage';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ArrowUpRight, TrendingUp, Tag, ListFilter } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses }) => {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Maior gasto individual
  const highestExpense = expenses.length > 0 
    ? [...expenses].sort((a, b) => b.amount - a.amount)[0]
    : null;

  // Categoria mais custosa
  const categoryMap: Record<string, number> = {};
  expenses.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
  });

  const topCategoryPair = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategoryPair ? topCategoryPair[0] : 'Nenhum';
  const topCategoryAmount = topCategoryPair ? topCategoryPair[1] : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total do Mês */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md border-none overflow-hidden relative">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
              Total de Gastos (Mês Atual)
            </span>
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-100 block mt-1">
              {expenses.length} lançamento{expenses.length !== 1 ? 's' : ''} registrado{expenses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Categoria Mais Carregada */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Maior Categoria de Custo
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-slate-800 block truncate">
              {topCategoryName}
            </span>
            <span className="text-sm font-semibold text-slate-600 mt-0.5 block">
              R$ {topCategoryAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Maior Registro do Mês */}
      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Maior Lançamento
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-slate-800 block truncate">
              {highestExpense ? highestExpense.description : 'Sem lançamentos'}
            </span>
            <span className="text-sm font-semibold text-amber-700 mt-0.5 block">
              {highestExpense 
                ? `R$ ${highestExpense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                : 'R$ 0,00'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};