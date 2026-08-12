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
      <DialogContent className="max-w-xl bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {t('setBudgetLimits')} ({currencySymbol})
              </DialogTitle>
              <DialogDescription className="text-slate-200 text-xs mt-0.5">
                {t('setBudgetDesc')}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {EXPENSE_CATEGORIES.map(cat => {
            const limit = parseFloat(localBudgets[cat.name] || '0') || 0;
            const spent = categorySpentMap[cat.name] || 0;
            const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isExceeded = limit > 0 && spent > limit;

            return (
              <div key={cat.name} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                  </div>

                  <div className="flex items-center space-x-1 w-32">
                    <span className="text-xs text-slate-500 font-semibold">{currencySymbol}</span>
                    <Input
                      type="number"
                      step="10"
                      value={localBudgets[cat.name] || ''}
                      onChange={e => handleChange(cat.name, e.target.value)}
                      className="h-8 text-xs font-bold rounded-lg border-slate-300 bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {limit > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {t('spent')}: <strong>{formatCurrency(spent)}</strong> de {formatCurrency(limit)}
                      </span>
                      {isExceeded ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {t('exceededBy')} {formatCurrency(spent - limit)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {percent}% {t('ofLimit')}
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
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

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {t('saveLimits')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};