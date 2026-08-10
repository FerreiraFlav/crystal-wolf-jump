import React, { useState } from 'react';
import { RecurringTransaction, CategoryType, TransactionType } from '@/types/finance';
import { 
  getRecurringTransactions, 
  addRecurringTransaction, 
  deleteRecurringTransaction, 
  applyRecurringToMonth,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES
} from '@/services/storage';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Repeat, Plus, Trash2, Calendar, Zap, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useLanguage } from '@/context/LanguageContext';

interface RecurringTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedYear: number;
  selectedMonth: number;
  onRefreshData: () => void;
}

export const RecurringTransactionsModal: React.FC<RecurringTransactionsModalProps> = ({
  isOpen,
  onClose,
  userId,
  selectedYear,
  selectedMonth,
  onRefreshData,
}) => {
  const { formatCurrency, t } = useLanguage();

  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>(() =>
    getRecurringTransactions(userId)
  );

  const [isAdding, setIsAdding] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Moradia');
  const [type, setType] = useState<TransactionType>('expense');
  const [dayOfMonth, setDayOfMonth] = useState('5');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const refreshList = () => {
    const data = getRecurringTransactions(userId);
    setRecurringList(data);
  };

  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Moradia' : 'Salário');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!desc.trim()) {
      showError('Informe uma descrição.');
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      showError('Informe um valor válido.');
      return;
    }

    const dayNum = parseInt(dayOfMonth, 10) || 1;

    addRecurringTransaction(userId, {
      description: desc.trim(),
      amount: numAmount,
      category,
      type,
      dayOfMonth: Math.min(31, Math.max(1, dayNum)),
    });

    showSuccess(`Conta fixa "${desc}" cadastrada com sucesso!`);
    setDesc('');
    setAmount('');
    setIsAdding(false);
    refreshList();
  };

  const handleDelete = (id: string, description: string) => {
    deleteRecurringTransaction(userId, id);
    showSuccess(`Item "${description}" removido das contas fixas.`);
    refreshList();
  };

  const handleApplyToCurrentMonth = () => {
    const addedCount = applyRecurringToMonth(userId, selectedYear, selectedMonth);
    if (addedCount > 0) {
      showSuccess(`${addedCount} ${t('itemAddedToMonth')}`);
      onRefreshData();
      onClose();
    } else {
      showError('Todas as suas contas fixas já foram lançadas neste mês!');
    }
  };

  const monthLabel = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {t('recurringBills')}
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-xs mt-0.5">
                {t('recurringDesc')}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Botão de Ação Rápida: Lançar no mês ativo */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                Mês Ativo: <span className="capitalize">{monthLabel}</span>
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Gere automaticamente as entradas e saídas recorrentes sem digitar novamente.
              </p>
            </div>

            <Button
              onClick={handleApplyToCurrentMonth}
              disabled={recurringList.length === 0}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md px-5 py-2.5 flex items-center justify-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4 fill-white" />
              {t('postCurrentMonth')}
            </Button>
          </div>

          {/* Form para Nova Conta Fixa */}
          {!isAdding ? (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              {t('addRecurring')}
            </Button>
          ) : (
            <form onSubmit={handleAdd} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t('addRecurring')}
                </h4>

                <div className="flex p-0.5 bg-slate-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleTypeSwitch('expense')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      type === 'expense' ? 'bg-red-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    {t('expense')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSwitch('income')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    {t('income')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-600">{t('description')}</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Renda, Gym, Netflix, Salário..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-600">{t('amount')}</Label>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="h-9 text-xs rounded-lg font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-600">{t('category')}</Label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CategoryType)}
                    className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-600">{t('dayOfMonth')}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAdding(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-semibold"
                >
                  Salvar
                </Button>
              </div>
            </form>
          )}

          {/* Lista de Contas Fixas Cadastradas */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contas Fixas Cadastradas ({recurringList.length})
            </h4>

            {recurringList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                {t('noRecurring')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {recurringList.map(item => {
                  const isIncome = item.type === 'income';

                  return (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl border ${
                          isIncome ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {isIncome ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-800">{item.description}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.category} • Dia {item.dayOfMonth}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`font-bold text-xs ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {formatCurrency(item.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.description)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};