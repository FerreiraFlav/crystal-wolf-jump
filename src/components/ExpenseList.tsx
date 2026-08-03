import React, { useState } from 'react';
import { Expense, CategoryType } from '@/types/finance';
import { CATEGORIES } from '@/services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Receipt, 
  Trash2, 
  Search, 
  Filter, 
  Utensils, 
  Home, 
  Car, 
  Tv, 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  MoreHorizontal
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      default: return <Receipt className="w-4 h-4 text-teal-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <Receipt className="w-4 h-4" />
          </div>
          Últimos Gastos Registrados
        </CardTitle>

        {/* Busca e Filtro */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              placeholder="Buscar gasto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg border-slate-200"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-8 pl-2 pr-6 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 outline-none"
            >
              <option value="all">Todas Categorias</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Nenhum gasto encontrado</p>
            <p className="text-xs text-slate-400 mt-1">Tente mudar o filtro de busca ou adicionar novos lançamentos.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map(expense => (
              <div
                key={expense.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
              >
                {/* Ícone e Detalhes */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 shrink-0">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">
                      {expense.description}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                        {expense.category}
                      </span>
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Valor e Botão Deletar */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8"
                    title="Excluir este gasto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};