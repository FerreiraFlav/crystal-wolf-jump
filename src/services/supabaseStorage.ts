import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Expense, User, PiggyBank, RecurringTransaction } from '@/types/finance';
import { showError } from '@/utils/toast';

// ==================== TESTE DE CONEXÃO E TABELAS ====================

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { 
      success: false, 
      message: 'As variáveis de ambiente do Supabase não estão ativas no Vercel. Lembre-se de fazer um Redeploy no Vercel!' 
    };
  }

  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: false, 
          message: 'As tabelas ainda não foram criadas no Supabase. Execute o script SQL no SQL Editor do Supabase.' 
        };
      }
      if (error.code === '42501' || error.message.includes('row-level security')) {
        return {
          success: false,
          message: 'As tabelas do Supabase estão bloqueadas por RLS. Execute o script SQL no painel do Supabase para liberar o acesso.'
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso e tabelas detectadas!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro de conexão com o Supabase.' };
  }
};

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
      console.error('Erro de busca no Supabase:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  } catch (err: any) {
    console.error('Erro ao buscar usuário no Supabase:', err);
    return null;
  }
};

export const registerUserInSupabase = async (name: string, email: string, passwordHash: string): Promise<User | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

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
      console.warn('Bloqueio no Supabase (RLS ou Tabela):', error.message);
      return null;
    }

    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
      };
    }

    return { id: userId, name: name.trim(), email: formattedEmail };
  } catch (err: any) {
    console.warn('Erro ao registrar no Supabase:', err);
    return null;
  }
};

// ==================== POVOAR DADOS DE TESTE NO SUPABASE ====================

export const seedSupabaseDataIfEmpty = async (userId: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // 1. Garante que o usuário existe na tabela users
    await supabase.from('users').upsert([
      {
        id: userId,
        name: 'Flavio',
        email: 'flavio@email.com',
        password_hash: '123456',
      }
    ], { onConflict: 'email' });

    // 2. Verifica se já existem lançamentos
    const { data: existing } = await supabase
      .from('expenses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) {
      return; // Já tem dados
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    const demoExpenses = [
      { user_id: userId, description: 'Salário Mensal', amount: 2800.00, category: 'Salário', type: 'income', date: `${year}-${month}-01` },
      { user_id: userId, description: 'Projeto Freelance', amount: 650.00, category: 'Freelance', type: 'income', date: `${year}-${month}-10` },
      { user_id: userId, description: 'Supermercado Tesco / Lidl', amount: 320.50, category: 'Alimentação', type: 'expense', date: `${year}-${month}-02` },
      { user_id: userId, description: 'Renda / Aluguer Habitação', amount: 750.00, category: 'Moradia', type: 'expense', date: `${year}-${month}-05` },
      { user_id: userId, description: 'Eletricidade e Água (IE)', amount: 115.30, category: 'Contas & Serviços Irlanda', type: 'expense', date: `${year}-${month}-08` },
      { user_id: userId, description: 'Apoio Familiar (BR)', amount: 150.00, category: 'Contas & Serviços Brasil', type: 'expense', date: `${year}-${month}-09` },
      { user_id: userId, description: 'Transporte / Leap Card', amount: 80.00, category: 'Transporte', type: 'expense', date: `${year}-${month}-10` },
      { user_id: userId, description: 'Jantar Restaurante', amount: 65.00, category: 'Lazer & Entretenimento', type: 'expense', date: `${year}-${month}-12` },
    ];

    await supabase.from('expenses').insert(demoExpenses);

    // Cofrinhos de exemplo
    await supabase.from('piggy_banks').insert([
      { user_id: userId, name: 'Reserva de Emergência', target_amount: 3000, current_amount: 1200, color: '#10B981' },
      { user_id: userId, name: 'Viagem / Férias', target_amount: 1500, current_amount: 450, color: '#3B82F6' },
    ]);

    // Contas fixas de exemplo
    await supabase.from('recurring_transactions').insert([
      { user_id: userId, description: 'Renda / Aluguer Habitação', amount: 750, category: 'Moradia', type: 'expense', frequency: 'monthly', day_of_month: 5 },
      { user_id: userId, description: 'Salário Semanal', amount: 650, category: 'Salário', type: 'income', frequency: 'weekly', day_of_week: 5 },
    ]);
  } catch (err) {
    console.warn('Erro ao popular dados iniciais no Supabase:', err);
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
      console.warn('Aviso Supabase:', error.message);
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
  } catch (err: any) {
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
      console.warn('Erro ao salvar no Supabase:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (err: any) {
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
  } catch (err: any) {
    console.error('Erro ao atualizar no Supabase:', err);
  }
};

export const deleteExpenseFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('expenses').delete().eq('id', id);
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
    console.error('Erro ao salvar cofrinho no Supabase:', err);
  }
};

export const updatePiggyBankAmountInSupabase = async (id: string, newAmount: number) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('piggy_banks').update({ current_amount: newAmount }).eq('id', id);
  } catch (err: any) {
    console.error('Erro ao atualizar valor do cofrinho no Supabase:', err);
  }
};

export const deletePiggyBankFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('piggy_banks').delete().eq('id', id);
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
    console.error('Erro ao salvar conta fixa no Supabase:', err);
  }
};

export const deleteRecurringTransactionFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('recurring_transactions').delete().eq('id', id);
  } catch (err: any) {
    console.error('Erro ao deletar conta fixa no Supabase:', err);
  }
};