import { getSupabase, checkIsConfigured } from '@/lib/supabase';
import { Expense, User, PiggyBank, RecurringTransaction, CategoryBudget, CategoryType, TransactionType, RecurrenceFrequency } from '@/types/finance';

// ==================== TESTE DE CONEXÃO E TABELAS ====================

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabase();
  if (!client || !checkIsConfigured()) {
    return { 
      success: false, 
      message: 'As credenciais do Supabase não foram encontradas. Insira a URL e a Anon Key no painel ou nas variáveis de ambiente da Vercel.' 
    };
  }

  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: false, 
          message: 'As tabelas ainda não foram criadas no Supabase. Execute o script SQL no SQL Editor do Supabase.' 
        };
      }
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        return {
          success: false,
          message: 'Acesso bloqueado por RLS ou permissões. Certifique-se de executar o script com as policies de segurança corretas.'
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase 100% ativa! Usuários e despesas estão salvando na nuvem com segurança.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro de conexão com o Supabase.';
    return { success: false, message };
  }
};

// ==================== USUÁRIOS (LOGIN & CADASTRO NA NUVEM) ====================

export const findUserInSupabase = async (email: string, password: string): Promise<User | null> => {
  const client = getSupabase();
  if (!client) throw new Error('A conexão com o Supabase não está configurada.');

  const { data, error } = await client.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Não foi possível entrar na conta.');
  }

  let userName = data.user.user_metadata?.name;
  if (!userName) {
    try {
      const { data: profile } = await client
        .from('profiles')
        .select('name')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile?.name) {
        userName = profile.name;
      }
    } catch {
      // continua com o fallback
    }
  }

  return {
    id: data.user.id,
    name: userName || data.user.email?.split('@')[0] || 'Usuário',
    email: data.user.email || email.toLowerCase().trim(),
  };
};

export const registerUserInSupabase = async (name: string, email: string, password: string): Promise<User | null> => {
  const client = getSupabase();
  if (!client) throw new Error('A conexão com o Supabase não está configurada.');

  const formattedEmail = email.toLowerCase().trim();
  const { data, error } = await client.auth.signUp({
    email: formattedEmail,
    password,
    options: { data: { name: name.trim() } },
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Não foi possível criar a conta.');
  }

  // Se a sessão não vier de imediato no signUp, tenta iniciar a sessão com a senha cadastrada
  if (!data.session) {
    try {
      await client.auth.signInWithPassword({
        email: formattedEmail,
        password,
      });
    } catch {
      // Prossegue mesmo se falhar a tentativa imediata
    }
  }

  return { id: data.user.id, name: name.trim(), email: formattedEmail };
};

// ==================== LANÇAMENTOS (EXPENSES) ====================

export const fetchExpensesFromSupabase = async (userId: string): Promise<Expense[]> => {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) return [];

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      description: item.description,
      amount: Number(item.amount),
      category: item.category as CategoryType,
      type: (item.type || 'expense') as TransactionType,
      date: item.date,
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

export const saveExpenseToSupabase = async (userId: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
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

    if (error) return null;
    return data?.[0] || null;
  } catch {
    return null;
  }
};

export const updateExpenseInSupabase = async (id: string, updatedFields: Partial<Omit<Expense, 'id' | 'userId'>>) => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('expenses').update({
      description: updatedFields.description,
      amount: updatedFields.amount,
      category: updatedFields.category,
      type: updatedFields.type,
      date: updatedFields.date,
    }).eq('id', id);
  } catch {
    // Falha silenciosa
  }
};

export const deleteExpenseFromSupabase = async (id: string) => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('expenses').delete().eq('id', id);
  } catch {
    // Falha silenciosa
  }
};

// ==================== ORÇAMENTOS (BUDGETS) ====================

export const fetchBudgetsFromSupabase = async (userId: string): Promise<CategoryBudget[]> => {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) return [];

    return (data || []).map(item => ({
      category: item.category as CategoryType,
      limitAmount: Number(item.limit_amount) || 0,
    }));
  } catch {
    return [];
  }
};

export const saveBudgetsToSupabase = async (userId: string, budgets: CategoryBudget[]): Promise<void> => {
  const client = getSupabase();
  if (!client) return;

  try {
    const payload = budgets.map(b => ({
      user_id: userId,
      category: b.category,
      limit_amount: b.limitAmount,
    }));

    await client
      .from('budgets')
      .upsert(payload, { onConflict: 'user_id,category' });
  } catch (err) {
    console.warn('Erro ao salvar orçamentos no Supabase:', err);
  }
};

// ==================== COFRINHOS (PIGGY BANKS) ====================

export const fetchPiggyBanksFromSupabase = async (userId: string): Promise<PiggyBank[]> => {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('piggy_banks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return [];

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      targetAmount: Number(item.target_amount) || 0,
      currentAmount: Number(item.current_amount) || 0,
      color: item.color || '#10B981',
    }));
  } catch {
    return [];
  }
};

export const savePiggyBankToSupabase = async (userId: string, item: Omit<PiggyBank, 'userId'>): Promise<PiggyBank | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('piggy_banks')
      .insert([
        {
          id: item.id,
          user_id: userId,
          name: item.name,
          target_amount: item.targetAmount,
          current_amount: item.currentAmount,
          color: item.color || '#10B981',
        }
      ])
      .select();

    if (error) return null;
    const inserted = data?.[0];
    if (!inserted) return null;
    return {
      id: inserted.id,
      userId: inserted.user_id,
      name: inserted.name,
      targetAmount: Number(inserted.target_amount),
      currentAmount: Number(inserted.current_amount),
      color: inserted.color,
    };
  } catch {
    return null;
  }
};

export const updatePiggyBankAmountInSupabase = async (id: string, newAmount: number) => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('piggy_banks').update({ current_amount: newAmount }).eq('id', id);
  } catch {
    // Falha silenciosa
  }
};

export const deletePiggyBankFromSupabase = async (id: string) => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('piggy_banks').delete().eq('id', id);
  } catch {
    // Falha silenciosa
  }
};

// ==================== TRANSAÇÕES RECORRENTES ====================

export const fetchRecurringTransactionsFromSupabase = async (userId: string): Promise<RecurringTransaction[]> => {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return [];

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      description: item.description,
      amount: Number(item.amount) || 0,
      category: item.category as CategoryType,
      type: (item.type || 'expense') as TransactionType,
      frequency: (item.frequency || 'monthly') as RecurrenceFrequency,
      dayOfMonth: item.day_of_month ?? undefined,
      dayOfWeek: item.day_of_week ?? undefined,
    }));
  } catch {
    return [];
  }
};

export const saveRecurringTransactionToSupabase = async (userId: string, item: RecurringTransaction): Promise<RecurringTransaction | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('recurring_transactions')
      .insert([
        {
          id: item.id,
          user_id: userId,
          description: item.description,
          amount: item.amount,
          category: item.category,
          type: item.type,
          frequency: item.frequency,
          day_of_month: item.dayOfMonth ?? null,
          day_of_week: item.dayOfWeek ?? null,
        }
      ])
      .select();

    if (error) return null;
    const inserted = data?.[0];
    if (!inserted) return null;
    return {
      id: inserted.id,
      userId: inserted.user_id,
      description: inserted.description,
      amount: Number(inserted.amount),
      category: inserted.category as CategoryType,
      type: inserted.type as TransactionType,
      frequency: inserted.frequency as RecurrenceFrequency,
      dayOfMonth: inserted.day_of_month ?? undefined,
      dayOfWeek: inserted.day_of_week ?? undefined,
    };
  } catch {
    return null;
  }
};

export const deleteRecurringTransactionFromSupabase = async (id: string) => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('recurring_transactions').delete().eq('id', id);
  } catch {
    // Falha silenciosa
  }
};
