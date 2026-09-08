import React from 'react';
import { Expense, CategoryBudget } from '@/types/finance';
import { ALL_CATEGORIES } from '@/services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ExpensePieChartProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  currentMonthLabel: string;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses, budgets, currentMonthLabel }) => {
  const { formatCurrency, t, getCategoryLabel } = useLanguage();
  const expenseItems = expenses.filter(e => e.type === 'expense');

  const categoryMap: Record<string, number> = {};
  let totalSpent = 0;

  expenseItems.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    totalSpent += exp.amount;
  });

  const chartData = Object.entries(categoryMap).map(([categoryName, value]) => {
    const categoryObj = ALL_CATEGORIES.find(c => c.name === categoryName);
    const percentage = totalSpent > 0 ? ((value / totalSpent) * 100).toFixed(1) : '0';
    const budgetObj = budgets.find(b => b.category === categoryName);
    const limit = budgetObj ? budgetObj.limitAmount : 0;

    return {
      name: categoryName,
      value: value,
      percentage: Number(percentage),
      limit: limit,
      color: categoryObj ? categoryObj.color : '#6B7280',
    };
  }).sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 rounded-xl shadow-xl text-xs border border-slate-200/90 dark:border-slate-700/80 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">{getCategoryLabel(data.name)}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
            {formatCurrency(data.value)}
          </p>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{data.percentage}%</p>
          {data.limit > 0 && (
            <p className="text-amber-700 dark:text-amber-400 font-medium text-[11px] border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
              {t('limit')}: {formatCurrency(data.limit)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col transition-colors">
      <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 pb-3.5 flex flex-row items-center justify-between transition-colors">
        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-lg">
            <PieChartIcon className="w-4 h-4" />
          </div>
          {t('expenseBreakdown')}
        </CardTitle>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full capitalize border border-slate-200/60 dark:border-slate-700/60">
          {currentMonthLabel}
        </span>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 text-center flex-1">
            <AlertCircle className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-600 dark:text-slate-400 text-sm">{t('noExpensesMonth')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full outline-none focus:outline-none select-none [&_*]:outline-none [&_*]:focus:outline-none">
              <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
                <PieChart className="outline-none focus:outline-none">
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    className="outline-none focus:outline-none cursor-pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2.5} className="outline-none focus:outline-none dark:stroke-slate-900" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto pr-1">
              {chartData.map(item => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700/40 transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{getCategoryLabel(item.name)}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};