import React, { useState } from 'react';
import { CategoryType } from '@/types/finance';
import { CATEGORIES } from '@/services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface ExpenseFormProps {
  onAddExpense: (expense: { description: string; amount: number; category: CategoryType; date: string }) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Alimentação');
  const [date, setDate] = useState(todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showError('Por favor, insira uma descrição para o gasto.');
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
      date,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(todayStr);
    showSuccess('Gasto adicionado com sucesso!');
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3.5">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <PlusCircle className="w-4 h-4" />
          </div>
          Adicionar Novo Gasto
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
            <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Descrição do Gasto</Label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                id="description"
                type="text"
                placeholder="Ex: Almoço de negócios, Mercado, Luz..."
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
                {CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs font-semibold text-slate-700">Data da Ocorrência</Label>
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Salvar Gasto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};