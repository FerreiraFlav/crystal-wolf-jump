import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Expense, CategoryBudget, User, PiggyBank, RecurringTransaction } from '@/types/finance';

// ==================== USUÁRIOS (LOGIN & CADASTRO NA NUVEM) ====================

export const findUserInSupabase = async (email: string, passwordHash: string): Promise<User | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase().trim())
      .eq('password_hash', passwordHash)
      .maybeSingle();

    if (error) {
      console.warn('Busca de usuário no Supabase:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  } catch (err) {
    console.error('Erro ao buscar usuário no Supabase:', err);
    return null;
  }
};

export const registerUserInSupabase = async (name: string, email: string, passwordHash: string): Promise<User | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
        }
      ])
      .select('id, name, email');

    if (error) {
      console.warn('Aviso ao cadastrar usuário no Supabase:', error.message);
      // Retorna usuário mesmo se a tabela no Supabase não tiver sido criada ainda
      return { id: userId, name: name.trim(), email: email.toLowerCase().trim() };
    }

    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
      };
    }

    return { id: userId, name: name.trim(), email: email.toLowerCase().trim() };
  } catch (err) {
    console.error('Erro ao cadastrar usuário no Supabase:', err);
    return null;
  }
};

// ==================== LANÇAMENTOS (DESPESAS / RECEITAS) ====================

export const fetchExpensesFromSupabase = async (userId: string): Promise<Expense[]> => {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch expenses notice:', error.message);
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
      console.warn('Aviso Supabase ao salvar lançamento:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Erro ao salvar no Supabase:', err);
    return null;
  }
};

export const updateExpenseInSupabase = async (id: string, updatedFields: Partial<Omit<Expense, 'id' | 'userId'>>) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('expenses').update({
      description: updatedFields.description,
      amount: updatedFields.amount,
      category: updatedFields.category,
      type: updatedFields.type,
      date: updatedFields.date,
    }).eq('id', id);
  } catch (err) {
    console.error('Erro ao atualizar no Supabase:', err);
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