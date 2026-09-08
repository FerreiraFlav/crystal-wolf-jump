import React from 'react';
import { Expense } from '@/types/finance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FinancialTrendChartProps {
  expenses: Expense[];
  selectedYear: number;
  selectedMonth: number;
}

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({
  expenses,
  selectedYear,
  selectedMonth,
}) => {
  const { formatCurrency, currencySymbol, t } = useLanguage();

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const monthsData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(selectedYear, selectedMonth - i, 1);
    const y = date.getFullYear();
    const m = date.getMonth();
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;

    const monthExpenses = expenses.filter(e => e.date.startsWith(prefix));
    const income = monthExpenses.filter(e => e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const expense = monthExpenses.filter(e => e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

    monthsData.push({
      label: `${monthNames[m]} ${y.toString().slice(-2)}`,
      Receitas: income,
      Despesas: expense,
      Net: income - expense,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 rounded-xl shadow-xl text-xs border border-slate-200/90 dark:border-slate-700/80 space-y-1.5 min-w-[140px]">
          <p className="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
          <div className="flex items-center justify-between space-x-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('income')}:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(payload[0]?.value || 0)}</span>
          </div>
          <div className="flex items-center justify-between space-x-3">
            <span className="text-red-500 dark:text-red-400 font-semibold">{t('expense')}:</span>
            <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(payload[1]?.value || 0)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors">
      <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between transition-colors">
        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span>{t('financialTrend')}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 p-3 sm:p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} className="dark:fill-slate-400" />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${currencySymbol}${v}`}
                className="dark:fill-slate-400"
              />
              <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => value === 'Receitas' ? t('income') : t('expense')}
              />
              <Bar dataKey="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};