import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Expense, CategoryBudget, User } from '@/types/finance';

// Tabela de Lançamentos no Supabase
export const fetchExpensesFromSupabase = async (userId: string): Promise<Expense[]> => {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch notice:', error.message);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      description: item.description,
      amount: Number(item.amount),
      category: item.category,
      type: item.type || 'expense',
      date: item.date,
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Erro ao conectar ao Supabase:', err);
    return [];
  }
};

export const saveExpenseToSupabase = async (userId: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userId,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          type: expense.type,
          date: expense.date,
        }
      ])
      .select();

    if (error) {
      console.warn('Aviso Supabase ao salvar:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Erro ao salvar no Supabase:', err);
    return null;
  }
};

export const deleteExpenseFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('expenses').delete().eq('id', id);
  } catch (err) {
    console.error('Erro ao deletar do Supabase:', err);
  }
};