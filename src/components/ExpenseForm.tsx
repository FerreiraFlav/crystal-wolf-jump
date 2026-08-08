import React, { useState } from 'react';
import { CategoryType, TransactionType } from '@/types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Tag, FileText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface ExpenseFormProps {
  onAddExpense: (expense: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Alimentação');
  const [date, setDate] = useState(todayStr);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Alimentação' : 'Salário');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showError('Por favor, insira uma descrição.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError('Por favor, insira um valor válido maior que zero.');
      return;
    }

    onAddExpense({
      description: description.trim(),
      amount: numericAmount,
      category,
      type,
      date,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(todayStr);
    showSuccess(`${type === 'expense' ? 'Despesa' : 'Receita'} adicionada com sucesso!`);
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3.5">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <PlusCircle className="w-4 h-4" />
            </div>
            Novo Lançamento
          </div>

          {/* Toggle Despesa / Receita */}
          <div className="flex p-0.5 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                type === 'expense' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Receita
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">Valor (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">R$</span>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-10 font-bold text-slate-800 text-lg rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Descrição</Label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                id="description"
                type="text"
                placeholder={type === 'expense' ? 'Ex: Mercado, Aluguel, Uber...' : 'Ex: Salário, Projeto Freela...'}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="pl-9 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-semibold text-slate-700">Categoria</Label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs font-semibold text-slate-700">Data</Label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="pl-9 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
              type === 'expense'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {type === 'expense' ? 'Salvar Despesa' : 'Salvar Receita'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};