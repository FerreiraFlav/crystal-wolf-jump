import React, { useState } from 'react';
import { Expense, CategoryType } from '@/types/finance';
import { ALL_CATEGORIES } from '@/services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  X
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { showSuccess, showError } from '@/utils/toast';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpenseAmount: (id: string, newAmount: number) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  onDeleteExpense,
  onEditExpenseAmount 
}) => {
  const { formatCurrency, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Estado para Edição de Valor
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmountInput, setEditAmountInput] = useState('');

  // Ordenar sempre por data: Mais recentes no topo, mais antigas no fundo
  const sortedExpenses = [...expenses].sort((a, b) => {
    // Comparar datas (YYYY-MM-DD)
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    // Se a data for igual, ordenar por data de criação mais recente
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
    setEditAmountInput(String(expense.amount));
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;
    const numericAmount = parseFloat(editAmountInput.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError('Por favor, insira um valor válido maior que zero.');
      return;
    }

    onEditExpenseAmount(editingExpense.id, numericAmount);
    showSuccess('Valor atualizado com sucesso!');
    setEditingExpense(null);
  };

  return (
    <>
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
            {t('history')}
          </CardTitle>

          {/* Busca e Filtros */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Tipo */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="h-8 pl-2 pr-6 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 outline-none"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="expense">{t('expense')}</option>
              <option value="income">{t('income')}</option>
            </select>

            {/* Categorias */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-8 pl-2 pr-6 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 outline-none"
            >
              <option value="all">{t('allCategories')}</option>
              {ALL_CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Busca por texto */}
            <div className="relative flex-1 sm:w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-lg border-slate-200"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">{t('noTransactions')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => {
                const isIncome = expense.type === 'income';

                return (
                  <div
                    key={expense.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        isIncome ? 'bg-emerald-50 border-emerald-200/60' : 'bg-slate-100 border-slate-200/60'
                      }`}>
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">
                            {expense.description}
                          </h4>
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isIncome ? t('income') : t('expense')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                            {expense.category}
                          </span>
                          <span>•</span>
                          <span>{formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                      <div className="text-right">
                        <span className={`font-bold text-sm sm:text-base ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isIncome ? '+ ' : '- '}{formatCurrency(expense.amount)}
                        </span>
                      </div>

                      {/* Botão de Editar Valor */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(expense)}
                        className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg h-8 w-8"
                        title="Editar Valor"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* Botão de Excluir */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Editar o Valor do Lançamento */}
      <Dialog open={Boolean(editingExpense)} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-xs bg-white border-slate-200 rounded-2xl p-5 shadow-xl">
          <DialogTitle className="text-base font-bold text-slate-800">
            Editar Valor
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Altere o valor para: <strong className="text-slate-700">{editingExpense?.description}</strong>
          </DialogDescription>

          <div className="space-y-4 pt-3">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">€</span>
              <Input
                type="text"
                value={editAmountInput}
                onChange={e => setEditAmountInput(e.target.value)}
                className="pl-8 font-bold text-slate-800 text-lg rounded-xl border-slate-200"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingExpense(null)}
                className="rounded-xl text-xs h-8"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-8 font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar Valor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};