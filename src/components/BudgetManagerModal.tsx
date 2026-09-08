import React, { useState } from 'react';
import { CategoryBudget, Expense } from '@/types/finance';
import { EXPENSE_CATEGORIES } from '@/services/storage';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useLanguage } from '@/context/LanguageContext';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudget[];
  expenses: Expense[];
  onSaveBudgets: (updated: CategoryBudget[]) => void;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
  budgets,
  expenses,
  onSaveBudgets,
}) => {
  const { formatCurrency, currencySymbol, t } = useLanguage();

  const [localBudgets, setLocalBudgets] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    EXPENSE_CATEGORIES.forEach(c => {
      const found = budgets.find(b => b.category === c.name);
      initial[c.name] = found ? String(found.limitAmount) : '0';
    });
    return initial;
  });

  const handleChange = (categoryName: string, val: string) => {
    setLocalBudgets(prev => ({ ...prev, [categoryName]: val }));
  };

  const handleSave = () => {
    const updatedBudgets: CategoryBudget[] = EXPENSE_CATEGORIES.map(c => ({
      category: c.name,
      limitAmount: parseFloat(localBudgets[c.name] || '0') || 0,
    }));

    onSaveBudgets(updatedBudgets);
    showSuccess(`Limites em (${currencySymbol}) salvos com sucesso!`);
    onClose();
  };

  // Calculate expenses spent per category
  const categorySpentMap: Record<string, number> = {};
  expenses.filter(e => e.type === 'expense').forEach(e => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-0.5rem)] sm:w-[94vw] max-w-6xl h-[92dvh] sm:h-[86vh] max-h-[96dvh] sm:max-h-[88vh] flex flex-col gap-0 mx-auto bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 sm:p-6 pr-12 sm:pr-14 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-white truncate">
                {t('setBudgetLimits')} ({currencySymbol})
              </DialogTitle>
              <DialogDescription className="text-slate-200 text-[11px] sm:text-sm mt-0.5 line-clamp-2">
                {t('setBudgetDesc')}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-3.5 sm:p-6 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {EXPENSE_CATEGORIES.map(cat => {
            const limit = parseFloat(localBudgets[cat.name] || '0') || 0;
            const spent = categorySpentMap[cat.name] || 0;
            const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isExceeded = limit > 0 && spent > limit;

            return (
              <div key={cat.name} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 sm:space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs sm:text-base font-bold text-slate-800">{cat.name}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 w-32 sm:w-36">
                    <span className="text-xs sm:text-sm text-slate-500 font-semibold">{currencySymbol}</span>
                    <Input
                      type="number"
                      step="10"
                      value={localBudgets[cat.name] || ''}
                      onChange={e => handleChange(cat.name, e.target.value)}
                      className="h-8 sm:h-9 text-xs sm:text-sm font-bold rounded-lg border-slate-300 bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {limit > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="text-slate-500">
                        {t('spent')}: <strong>{formatCurrency(spent)}</strong> de {formatCurrency(limit)}
                      </span>
                      {isExceeded ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {t('exceededBy')} {formatCurrency(spent - limit)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> {percent}% {t('ofLimit')}
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isExceeded ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs sm:text-sm h-9 sm:h-10 px-4">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm h-9 sm:h-10 px-5 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {t('saveLimits')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};