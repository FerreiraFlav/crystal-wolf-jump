import React, { useState } from 'react';
import { Expense, CategoryType, TransactionType } from '@/types/finance';
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Receipt, 
  Trash2, 
  Search, 
  Utensils, 
  Home, 
  Car, 
  Tv, 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  Briefcase,
  Laptop,
  TrendingUp,
  Pencil,
  Check,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { showSuccess, showError } from '@/utils/toast';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, updated: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  onDeleteExpense,
  onEditExpense 
}) => {
  const { formatCurrency, currencySymbol, t, getCategoryLabel } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Estado para Edição Completa
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryType>('Alimentação');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editDate, setEditDate] = useState('');

  // Ordenar sempre por data: Mais recentes no topo, mais antigas no fundo
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  const filteredExpenses = sortedExpenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesType = selectedType === 'all' || exp.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryIcon = (categoryName: CategoryType) => {
    switch (categoryName) {
      case 'Alimentação': return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'Moradia': return <Home className="w-4 h-4 text-blue-600" />;
      case 'Transporte': return <Car className="w-4 h-4 text-amber-600" />;
      case 'Lazer & Entretenimento': return <Tv className="w-4 h-4 text-pink-600" />;
      case 'Saúde': return <HeartPulse className="w-4 h-4 text-red-600" />;
      case 'Educação': return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'Compras': return <ShoppingBag className="w-4 h-4 text-indigo-600" />;
      case 'Contas & Serviços Irlanda': return <Receipt className="w-4 h-4 text-teal-600" />;
      case 'Contas & Serviços Brasil': return <Receipt className="w-4 h-4 text-emerald-700" />;
      case 'Contas & Serviços': return <Receipt className="w-4 h-4 text-teal-600" />;
      case 'Salário': return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'Freelance': return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Investimentos': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default: return <Receipt className="w-4 h-4 text-teal-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditDesc(expense.description);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditType(expense.type);
    setEditDate(expense.date);
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;

    if (!editDesc.trim()) {
      showError(t('fillDescription'));
      return;
    }

    const numericAmount = parseFloat(editAmount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError(t('fillValidAmount'));
      return;
    }

    onEditExpense(editingExpense.id, {
      description: editDesc.trim(),
      amount: numericAmount,
      category: editCategory,
      type: editType,
      date: editDate,
    });

    showSuccess(t('transactionUpdated'));
    setEditingExpense(null);
  };

  const editCategoriesList = editType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <>
      <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors">
        <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 pb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
            {t('history')}
          </CardTitle>

          {/* Busca e Filtros */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Tipo */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full sm:w-auto h-8 pl-2 pr-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{t('allTypes')}</option>
              <option value="expense" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{t('expense')}</option>
              <option value="income" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{t('income')}</option>
            </select>

            {/* Categorias */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto h-8 pl-2 pr-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{t('allCategories')}</option>
              {ALL_CATEGORIES.map(c => (
                <option key={c.name} value={c.name} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{getCategoryLabel(c.name)}</option>
              ))}
            </select>

            {/* Busca por texto */}
            <div className="relative col-span-2 sm:col-span-1 sm:w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 w-full"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 dark:text-slate-500">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('noTransactions')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map(expense => {
                const isIncome = expense.type === 'income';

                return (
                  <div
                    key={expense.id}
                    className="p-3 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-2 sm:gap-4"
                  >
                    {/* Lado Esquerdo: Ícone + Descrição + Categoria + Data */}
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                      <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
                        isIncome ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60'
                      }`}>
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                            {expense.description}
                          </h4>
                          <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            isIncome ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                          }`}>
                            {isIncome ? t('income') : t('expense')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 min-w-0">
                          <span className="font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] truncate max-w-[100px] sm:max-w-none">
                            {getCategoryLabel(expense.category)}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
                          <span className="text-slate-400 dark:text-slate-500 shrink-0 text-[10px] sm:text-xs">
                            {formatDate(expense.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Valor + Botões de Ação */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="text-right shrink-0 mr-0.5 sm:mr-1">
                        <span className={`font-bold text-xs sm:text-base whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {isIncome ? '+ ' : '- '}{formatCurrency(expense.amount)}
                        </span>
                      </div>

                      <div className="flex items-center shrink-0">
                        {/* Botão de Editar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(expense)}
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg h-7 w-7 sm:h-8 sm:w-8 transition-colors"
                          title={t('editTransaction')}
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>

                        {/* Botão de Excluir */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteExpense(expense.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg h-7 w-7 sm:h-8 sm:w-8 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Edição Completa do Lançamento */}
      <Dialog open={Boolean(editingExpense)} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors">
          <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {t('editTransaction')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {t('editModalDesc')}
          </DialogDescription>

          <div className="space-y-4 pt-3">
            {/* Toggle Despesa / Receita */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEditType('expense');
                  setEditCategory('Alimentação');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                  editType === 'expense' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t('expense')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditType('income');
                  setEditCategory('Salário');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                  editType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t('income')}
              </button>
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('description')}</Label>
              <Input
                type="text"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="text-xs rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Valor */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('amount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 font-bold text-sm">{currencySymbol}</span>
                <Input
                  type="text"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="pl-8 font-bold text-slate-800 dark:text-white text-base rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('category')}</Label>
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value as CategoryType)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
              >
                {editCategoriesList.map(cat => (
                  <option key={cat.name} value={cat.name} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {getCategoryLabel(cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('date')}</Label>
              <Input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="text-xs rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingExpense(null)}
                className="rounded-xl text-xs h-9"
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 font-semibold flex items-center gap-1.5 px-4"
              >
                <Check className="w-4 h-4" />
                {t('saveChanges')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};