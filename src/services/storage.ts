import { User, Expense, CategoryType, CategoryBudget, PiggyBank, RecurringTransaction } from '@/types/finance';
import { 
  findUserInSupabase, 
  registerUserInSupabase,
  updatePiggyBankAmountInSupabase,
  savePiggyBankToSupabase,
  deletePiggyBankFromSupabase,
  saveBudgetsToSupabase,
  saveRecurringTransactionToSupabase,
  deleteRecurringTransactionFromSupabase
} from './supabaseStorage';
import { checkIsConfigured, getSupabase } from '@/lib/supabase';

const CURRENT_USER_KEY = 'meu_orcamento_current_user';
const EXPENSES_KEY = 'meu_orcamento_expenses';
const BUDGETS_KEY = 'meu_orcamento_budgets';
const PIGGY_BANKS_KEY = 'meu_orcamento_piggy_banks';
const RECURRING_KEY = 'meu_orcamento_recurring';

const memoryStore: Record<string, string> = {};

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  }
};

const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return memoryStore['session_' + key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      memoryStore['session_' + key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      delete memoryStore['session_' + key];
    }
  }
};

export const EXPENSE_CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
  { name: 'Alimentação', color: '#10B981', icon: 'Utensils' },
  { name: 'Moradia', color: '#2563EB', icon: 'Home' },
  { name: 'Transporte', color: '#F59E0B', icon: 'Car' },
  { name: 'Lazer & Entretenimento', color: '#EC4899', icon: 'Tv' },
  { name: 'Saúde', color: '#EF4444', icon: 'HeartPulse' },
  { name: 'Educação', color: '#8B5CF6', icon: 'GraduationCap' },
  { name: 'Compras', color: '#06B6D4', icon: 'ShoppingBag' },
  { name: 'Contas & Serviços Irlanda', color: '#0284C7', icon: 'Receipt' },
  { name: 'Contas & Serviços Brasil', color: '#6366F1', icon: 'Receipt' },
  { name: 'Contas & Serviços', color: '#EAB308', icon: 'Receipt' },
  { name: 'Outros', color: '#64748B', icon: 'MoreHorizontal' },
];

export const INCOME_CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
  { name: 'Salário', color: '#059669', icon: 'Briefcase' },
  { name: 'Freelance', color: '#0284C7', icon: 'Laptop' },
  { name: 'Investimentos', color: '#7C3AED', icon: 'TrendingUp' },
  { name: 'Outros', color: '#4B5563', icon: 'PlusCircle' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getExpenses = (userId: string): Expense[] => {
  const data = safeLocalStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = data ? JSON.parse(data) : [];
  return all
    .filter(e => e.userId === userId)
    .map(e => ({ ...e, type: e.type || 'expense' }));
};

export const addExpense = (userId: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Expense => {
  const data = safeLocalStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = data ? JSON.parse(data) : [];

  const newExpense: Expense = {
    ...expense,
    id: generateUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newExpense);
  safeLocalStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return newExpense;
};

export const getCurrentUser = (): User | null => {
  const localData = safeLocalStorage.getItem(CURRENT_USER_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      // Ignora erro de JSON mal formatado e tenta a chave de sessão
    }
  }
  const sessionData = safeSessionStorage.getItem(CURRENT_USER_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};

// Registro de Usuário Assíncrono com Supabase
export const registerUserAsync = async (name: string, email: string, password: string): Promise<User> => {
  if (!checkIsConfigured()) {
    throw new Error('O aplicativo ainda não está conectado ao Supabase.');
  }

  const newUser = await registerUserInSupabase(name, email, password);
  if (!newUser) throw new Error('Não foi possível criar a conta.');

  safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

// Login de Usuário Assíncrono com Supabase
export const loginUserAsync = async (email: string, password: string): Promise<User> => {
  if (!checkIsConfigured()) {
    throw new Error('O aplicativo ainda não está conectado ao Supabase.');
  }

  const user = await findUserInSupabase(email, password);
  if (!user) throw new Error('E-mail ou senha incorretos.');

  safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = async (): Promise<void> => {
  safeSessionStorage.removeItem(CURRENT_USER_KEY);
  safeLocalStorage.removeItem(CURRENT_USER_KEY);

  // Limpeza defensiva do cache financeiro no logout para proteção em computadores compartilhados
  safeLocalStorage.removeItem(EXPENSES_KEY);
  safeLocalStorage.removeItem(BUDGETS_KEY);
  safeLocalStorage.removeItem(PIGGY_BANKS_KEY);
  safeLocalStorage.removeItem(RECURRING_KEY);
  safeLocalStorage.removeItem('meu_orcamento_users');

  try {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
  } catch (error) {
    console.error('Erro ao realizar logout no Supabase:', error);
  }
};

export const logoutUserAsync = logoutUser;

export const updateExpenseAmount = (id: string, newAmount: number) => {
  const data = safeLocalStorage.getItem(EXPENSES_KEY);
  if (!data) return;
  const all: Expense[] = JSON.parse(data);
  const updated = all.map(e => e.id === id ? { ...e, amount: newAmount } : e);
  safeLocalStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
};

export const updateExpense = (id: string, updatedFields: Partial<Omit<Expense, 'id' | 'userId'>>) => {
  const data = safeLocalStorage.getItem(EXPENSES_KEY);
  if (!data) return;
  const all: Expense[] = JSON.parse(data);
  const updated = all.map(e => e.id === id ? { ...e, ...updatedFields } : e);
  safeLocalStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
};

export const deleteExpense = (id: string) => {
  const data = safeLocalStorage.getItem(EXPENSES_KEY);
  if (!data) return;
  const all: Expense[] = JSON.parse(data);
  const filtered = all.filter(e => e.id !== id);
  safeLocalStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
};

export const importExpenses = (userId: string, imported: Omit<Expense, 'id' | 'userId' | 'createdAt'>[]) => {
  imported.forEach(exp => addExpense(userId, exp));
};

export const getBudgets = (userId: string): CategoryBudget[] => {
  const data = safeLocalStorage.getItem(BUDGETS_KEY);
  if (!data) return [];
  try {
    const allMap: Record<string, CategoryBudget[]> = JSON.parse(data);
    return allMap[userId] || [];
  } catch {
    return [];
  }
};

export const saveBudgets = (userId: string, budgets: CategoryBudget[]) => {
  const data = safeLocalStorage.getItem(BUDGETS_KEY);
  const allMap: Record<string, CategoryBudget[]> = data ? JSON.parse(data) : {};
  allMap[userId] = budgets;
  safeLocalStorage.setItem(BUDGETS_KEY, JSON.stringify(allMap));

  if (checkIsConfigured()) {
    saveBudgetsToSupabase(userId, budgets).catch(err => console.warn('Aviso ao salvar orçamentos:', err));
  }
};

export const getPiggyBanks = (userId: string): PiggyBank[] => {
  const data = safeLocalStorage.getItem(PIGGY_BANKS_KEY);
  if (!data) return [];
  try {
    const allMap: Record<string, PiggyBank[]> = JSON.parse(data);
    return allMap[userId] || [];
  } catch {
    return [];
  }
};

export const savePiggyBanks = (userId: string, items: PiggyBank[]) => {
  const data = safeLocalStorage.getItem(PIGGY_BANKS_KEY);
  const allMap: Record<string, PiggyBank[]> = data ? JSON.parse(data) : {};
  allMap[userId] = items;
  safeLocalStorage.setItem(PIGGY_BANKS_KEY, JSON.stringify(allMap));
};

export const addPiggyBank = (userId: string, item: { name: string; targetAmount: number; color?: string }): PiggyBank => {
  const current = getPiggyBanks(userId);
  const newPiggy: PiggyBank = {
    id: generateUUID(),
    userId,
    name: item.name,
    targetAmount: item.targetAmount,
    currentAmount: 0,
    color: item.color || '#10B981',
  };
  current.push(newPiggy);
  savePiggyBanks(userId, current);

  if (checkIsConfigured()) {
    savePiggyBankToSupabase(userId, newPiggy).catch(err => console.warn('Aviso ao salvar cofrinho:', err));
  }

  return newPiggy;
};

export const updatePiggyBankAmount = (userId: string, id: string, amountChange: number) => {
  const current = getPiggyBanks(userId);
  const updated = current.map(p => {
    if (p.id === id) {
      const newAmount = Math.max(0, Math.round((p.currentAmount + amountChange) * 100) / 100);
      if (checkIsConfigured()) {
        updatePiggyBankAmountInSupabase(p.id, newAmount);
      }
      return { ...p, currentAmount: newAmount };
    }
    return p;
  });
  savePiggyBanks(userId, updated);
};

export const deletePiggyBank = (userId: string, id: string) => {
  const current = getPiggyBanks(userId);
  const filtered = current.filter(p => p.id !== id);
  savePiggyBanks(userId, filtered);

  if (checkIsConfigured()) {
    deletePiggyBankFromSupabase(id);
  }
};

export const getRecurringTransactions = (userId: string): RecurringTransaction[] => {
  const data = safeLocalStorage.getItem(RECURRING_KEY);
  if (!data) return [];
  try {
    const allMap: Record<string, RecurringTransaction[]> = JSON.parse(data);
    return (allMap[userId] || []).map(r => ({
      ...r,
      frequency: r.frequency || 'monthly',
    }));
  } catch {
    return [];
  }
};

export const saveRecurringTransactions = (userId: string, items: RecurringTransaction[]) => {
  const data = safeLocalStorage.getItem(RECURRING_KEY);
  const allMap: Record<string, RecurringTransaction[]> = data ? JSON.parse(data) : {};
  allMap[userId] = items;
  safeLocalStorage.setItem(RECURRING_KEY, JSON.stringify(allMap));
};

export const addRecurringTransaction = (userId: string, item: Omit<RecurringTransaction, 'id' | 'userId'>): RecurringTransaction => {
  const current = getRecurringTransactions(userId);
  const newRecurring: RecurringTransaction = {
    id: generateUUID(),
    userId,
    ...item,
  };
  current.push(newRecurring);
  saveRecurringTransactions(userId, current);

  if (checkIsConfigured()) {
    saveRecurringTransactionToSupabase(userId, newRecurring).catch(err => console.warn('Aviso ao salvar recorrente:', err));
  }

  return newRecurring;
};

export const deleteRecurringTransaction = (userId: string, id: string) => {
  const current = getRecurringTransactions(userId);
  const filtered = current.filter(r => r.id !== id);
  saveRecurringTransactions(userId, filtered);

  if (checkIsConfigured()) {
    deleteRecurringTransactionFromSupabase(id);
  }
};

export const applyRecurringToMonth = (userId: string, year: number, month: number): number => {
  const recurring = getRecurringTransactions(userId);
  if (recurring.length === 0) return 0;

  const yearMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthExpenses = getExpenses(userId).filter(e => e.date.startsWith(yearMonthStr));

  let addedCount = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  recurring.forEach(rec => {
    const freq = rec.frequency || 'monthly';

    if (freq === 'monthly') {
      const day = String(Math.min(daysInMonth, rec.dayOfMonth || 1)).padStart(2, '0');
      const dateStr = `${yearMonthStr}-${day}`;

      const exists = monthExpenses.some(
        e => e.description.toLowerCase() === rec.description.toLowerCase() && e.amount === rec.amount && e.date === dateStr
      );

      if (!exists) {
        addExpense(userId, {
          description: rec.description,
          amount: rec.amount,
          category: rec.category,
          type: rec.type,
          date: dateStr,
        });
        addedCount++;
      }
    } else if (freq === 'weekly' || freq === 'biweekly') {
      const targetDayOfWeek = rec.dayOfWeek !== undefined ? rec.dayOfWeek : 5;
      const matchingDates: string[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        if (dateObj.getDay() === targetDayOfWeek) {
          const dayStr = String(d).padStart(2, '0');
          matchingDates.push(`${yearMonthStr}-${dayStr}`);
        }
      }

      const datesToPost = freq === 'biweekly'
        ? matchingDates.filter((_, idx) => idx % 2 === 0)
        : matchingDates;

      datesToPost.forEach(dateStr => {
        const exists = monthExpenses.some(
          e => e.description.toLowerCase() === rec.description.toLowerCase() && e.amount === rec.amount && e.date === dateStr
        );

        if (!exists) {
          addExpense(userId, {
            description: rec.description,
            amount: rec.amount,
            category: rec.category,
            type: rec.type,
            date: dateStr,
          });
          addedCount++;
        }
      });
    }
  });

  return addedCount;
};
