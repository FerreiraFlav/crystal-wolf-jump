import { getSupabase, checkIsConfigured } from '@/lib/supabase';
import { Expense, User, PiggyBank, RecurringTransaction } from '@/types/finance';

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
    const { error } = await client.from('users').select('id').limit(1);
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
          message: 'As tabelas do Supabase estão com RLS ativo. Execute o script SQL no painel para desativar o RLS ou liberar o acesso.'
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase 100% ativa! Usuários e despesas estão salvando na nuvem.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro de conexão com o Supabase.' };
  }
};

// ==================== USUÁRIOS (LOGIN & CADASTRO NA NUVEM) ====================

export const findUserInSupabase = async (email: string, passwordHash: string): Promise<User | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const formattedEmail = email.toLowerCase().trim();
    const { data, error } = await client
      .from('users')
      .select('id, name, email')
      .eq('email', formattedEmail)
      .eq('password_hash', passwordHash)
      .maybeSingle();

    if (error) {
      console.warn('Aviso de busca de usuário no Supabase:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  } catch {
    return null;
  }
};

export const registerUserInSupabase = async (name: string, email: string, passwordHash: string): Promise<User | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const formattedEmail = email.toLowerCase().trim();
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    
    const { data, error } = await client
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
      console.error('Erro ao gravar usuário no Supabase:', error.message);
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
  } catch (err) {
    console.error('Erro de conexão ao registrar usuário:', err);
    return null;
  }
};

// ==================== POVOAR DADOS INICIAIS NO SUPABASE ====================

export const seedSupabaseDataIfEmpty = async (userId: string) => {
  const client = getSupabase();
  if (!client) return;

  try {
    const { data: existing } = await client
      .from('expenses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) {
      return;
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

    await client.from('expenses').insert(demoExpenses);

    // Cofrinhos
    await client.from('piggy_banks').insert([
      { user_id: userId, name: 'Reserva de Emergência', target_amount: 3000, current_amount: 1200, color: '#10B981' },
      { user_id: userId, name: 'Viagem / Férias', target_amount: 1500, current_amount: 450, color: '#3B82F6' },
    ]);

    // Contas fixas
    await client.from('recurring_transactions').insert([
      { user_id: userId, description: 'Renda / Aluguer Habitação', amount: 750, category: 'Moradia', type: 'expense', frequency: 'monthly', day_of_month: 5 },
      { user_id: userId, description: 'Salário Semanal', amount: 650, category: 'Salário', type: 'income', frequency: 'weekly', day_of_week: 5 },
    ]);
  } catch (err) {
    console.warn('Aviso ao popular dados iniciais no Supabase:', err);
  }
};

// ==================== LANÇAMENTOS ====================

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
      category: item.category,
      type: item.type || 'expense',
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

// ==================== COFRINHOS ====================

export const updatePiggyBankAmountInSupabase = async (id: string, newAmount: number) => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('piggy_banks').update({ current_amount: newAmount }).eq('id', id);
  } catch {
    // Falha silenciosa
  }
};