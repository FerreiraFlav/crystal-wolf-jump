import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Expense, User, PiggyBank, RecurringTransaction } from '@/types/finance';

// ==================== USUÁRIOS (LOGIN & CADASTRO NA NUVEM) ====================

export const findUserInSupabase = async (email: string, passwordHash: string): Promise<User | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const formattedEmail = email.toLowerCase().trim();
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', formattedEmail)
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
    const formattedEmail = email.toLowerCase().trim();
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    const { data, error } = await supabase
      .from('users')
      .upsert(
        [
          {
            id: userId,
            name: name.trim(),
            email: formattedEmail,
            password_hash: passwordHash,
          }
        ],
        { onConflict: 'email' }
      )
      .select('id, name, email');

    if (error) {
      console.error('Erro no Supabase:', error.message);
      throw new Error(`Erro ao salvar no Supabase: ${error.message}. Verifique se a tabela 'users' existe no Supabase.`);
    }

    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
      };
    }

    return null;
  } catch (err: any) {
    console.error('Erro ao cadastrar usuário no Supabase:', err);
    throw err;
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
      console.warn('Aviso do Supabase ao buscar despesas:', error.message);
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
    console.error('Erro ao buscar lançamentos no Supabase:', err);
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

// ==================== COFRINHOS ====================

export const fetchPiggyBanksFromSupabase = async (userId: string): Promise<PiggyBank[]> => {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('piggy_banks')
      .select('*')
      .eq('user_id', userId);

    if (error) return [];

    return (data || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      name: p.name,
      targetAmount: Number(p.target_amount),
      currentAmount: Number(p.current_amount),
      color: p.color || '#10B981',
    }));
  } catch (err) {
    return [];
  }
};

export const savePiggyBankToSupabase = async (userId: string, piggy: Omit<PiggyBank, 'id' | 'userId'>) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('piggy_banks').insert([
      {
        user_id: userId,
        name: piggy.name,
        target_amount: piggy.targetAmount,
        current_amount: piggy.currentAmount,
        color: piggy.color,
      }
    ]);
  } catch (err) {
    console.error('Erro ao salvar cofrinho no Supabase:', err);
  }
};

export const updatePiggyBankAmountInSupabase = async (id: string, newAmount: number) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('piggy_banks').update({ current_amount: newAmount }).eq('id', id);
  } catch (err) {
    console.error('Erro ao atualizar valor do cofrinho no Supabase:', err);
  }
};

export const deletePiggyBankFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('piggy_banks').delete().eq('id', id);
  } catch (err) {
    console.error('Erro ao remover cofrinho no Supabase:', err);
  }
};

// ==================== CONTAS FIXAS / RECORRENTES ====================

export const fetchRecurringTransactionsFromSupabase = async (userId: string): Promise<RecurringTransaction[]> => {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId);

    if (error) return [];

    return (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      description: r.description,
      amount: Number(r.amount),
      category: r.category,
      type: r.type || 'expense',
      frequency: r.frequency || 'monthly',
      dayOfMonth: r.day_of_month,
      dayOfWeek: r.day_of_week,
    }));
  } catch (err) {
    return [];
  }
};

export const saveRecurringTransactionToSupabase = async (userId: string, item: Omit<RecurringTransaction, 'id' | 'userId'>) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('recurring_transactions').insert([
      {
        user_id: userId,
        description: item.description,
        amount: item.amount,
        category: item.category,
        type: item.type,
        frequency: item.frequency,
        day_of_month: item.dayOfMonth,
        day_of_week: item.dayOfWeek,
      }
    ]);
  } catch (err) {
    console.error('Erro ao salvar conta fixa no Supabase:', err);
  }
};

export const deleteRecurringTransactionFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('recurring_transactions').delete().eq('id', id);
  } catch (err) {
    console.error('Erro ao deletar conta fixa no Supabase:', err);
  }
};