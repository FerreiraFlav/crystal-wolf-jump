import { User, Expense, CategoryType, CategoryBudget, PiggyBank, RecurringTransaction } from '@/types/finance';
import { 
  findUserInSupabase, 
  registerUserInSupabase,
  updatePiggyBankAmountInSupabase
} from './supabaseStorage';
import { isSupabaseConfigured } from '@/lib/supabase';

const USERS_KEY = 'meu_orcamento_users';
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
  { name: 'Moradia', color: '#3B82F6', icon: 'Home' },
  { name: 'Transporte', color: '#F59E0B', icon: 'Car' },
  { name: 'Lazer & Entretenimento', color: '#EC4899', icon: 'Tv' },
  { name: 'Saúde', color: '#EF4444', icon: 'HeartPulse' },
  { name: 'Educação', color: '#8B5CF6', icon: 'GraduationCap' },
  { name: 'Compras', color: '#6366F1', icon: 'ShoppingBag' },
  { name: 'Contas & Serviços Irlanda', color: '#14B8A6', icon: 'Receipt' },
  { name: 'Contas & Serviços Brasil', color: '#059669', icon: 'Receipt' },
  { name: 'Outros', color: '#6B7280', icon: 'MoreHorizontal' },
];

export const INCOME_CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
  { name: 'Salário', color: '#059669', icon: 'Briefcase' },
  { name: 'Freelance', color: '#0284C7', icon: 'Laptop' },
  { name: 'Investimentos', color: '#7C3AED', icon: 'TrendingUp' },
  { name: 'Outros', color: '#4B5563', icon: 'PlusCircle' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const initDefaultAccounts = () => {
  try {
    const data = safeLocalStorage.getItem(USERS_KEY);
    if (!data) {
      const defaultUser: User & { passwordHash: string } = {
        id: 'usr_flavio',
        name: 'Flavio',
        email: 'flavio@email.com',
        passwordHash: '123456',
      };
      safeLocalStorage.setItem(USERS_KEY, JSON.stringify([defaultUser]));
      seedInitialData(defaultUser.id);
    }
  } catch (err) {
    console.warn('Aviso de inicialização de armazenamento:', err);
  }
};

initDefaultAccounts();

export const getUsers = (): (User & { passwordHash: string })[] => {
  const data = safeLocalStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCurrentUser = (): User | null => {
  initDefaultAccounts();
  const data = safeSessionStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

// Registro de Usuário Assíncrono com Supabase
export const registerUserAsync = async (<dyad-write path="src/services/storage.ts" description="Implementação completa do serviço de armazenamento com suporte a usuários, lançamentos, cofrinhos e contas recorrentes integrados ao Supabase">
import { User, Expense, CategoryType, CategoryBudget, PiggyBank, RecurringTransaction } from '@/types/finance';
import { 
  findUserInSupabase, 
  registerUserInSupabase,
  updatePiggyBankAmountInSupabase
} from './supabaseStorage';
import { isSupabaseConfigured } from '@/lib/supabase';

const USERS_KEY = 'meu_orcamento_users';
const CURRENT_USER_KEY = 'meu_orcamento_current_user';
const EXPENSES_KEY = 'meu_orcamento_expenses';
const BUDGETS_KEY = 'meu_orcamento_budgets';
const PIGGY_BANKS_KEY = 'meu_orcamento_piggy_banks';
const RECURRING_KEY = 'meu_orcamento_recurring';

const memoryStore: Record<string, string> = {};

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      <dyad-write path="src/services/storage.ts" description="Serviço completo de persistência local e nuvem com suporte a contas, lançamentos, cofrinhos e limites">
import { User, Expense, CategoryType, CategoryBudget, PiggyBank, RecurringTransaction } from '@/types/finance';
import { 
  findUserInSupabase, 
  registerUserInSupabase,
  updatePiggyBankAmountInSupabase
} from './supabaseStorage';
import { isSupabaseConfigured } from '@/lib/supabase';

const USERS_KEY = 'meu_orcamento_users';
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
  { name: 'Moradia', color: '#3B82F6', icon: 'Home' },
  { name: 'Transporte', color: '#F59E0B', icon: 'Car' },
  { name: 'Lazer & Entretenimento', color: '#EC4899', icon: 'Tv' },
  { name: 'Saúde', color: '#EF4444', icon: 'HeartPulse' },
  { name: 'Educação', color: '#8B5CF6', icon: 'GraduationCap' },
  { name: 'Compras', color: '#6366F1', icon: 'ShoppingBag' },
  { name: 'Contas & Serviços Irlanda', color: '#14B8A6', icon: 'Receipt' },
  { name: 'Contas & Serviços Brasil', color: '#059669', icon: 'Receipt' },
  { name: 'Outros', color: '#6B7280', icon: 'MoreHorizontal' },
];

export const INCOME_CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
  { name: 'Salário', color: '#059669', icon: 'Briefcase' },
  { name: 'Freelance', color: '#0284C7', icon: 'Laptop' },
  { name: 'Investimentos', color: '#7C3AED', icon: 'TrendingUp' },
  { name: 'Outros', color: '#4B5563', icon: 'PlusCircle' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const initDefaultAccounts = () => {
  try {
    const data = safeLocalStorage.getItem(USERS_KEY);
    if (!data) {
      const defaultUser: User & { passwordHash: string } = {
        id: 'usr_flavio',
        name: 'Flavio',
        email: 'flavio@email.com',
        passwordHash: '123456',
      };
      safeLocalStorage.setItem(USERS_KEY, JSON.stringify([defaultUser]));
      seedInitialData(defaultUser.id);
    }
  } catch (err) {
    console.warn('Aviso de inicialização de armazenamento:', err);
  }
};

initDefaultAccounts();

export const getUsers = (): (User & { passwordHash: string })[] => {
  const data = safeLocalStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCurrentUser = (): User | null => {
  initDefaultAccounts();
  const data = safeSessionStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

// Registro de Usuário Assíncrono com Supabase
export const registerUserAsync = async (name: string, email: string, passwordHash: string): Promise<User> => {
  const users = getUsers();

  let supabaseUser: User | null = null;
  if (isSupabaseConfigured) {
    try {
      supabaseUser = await registerUserInSupabase(name, email, passwordHash);
    } catch (err: any) {
      console.warn('Não foi possível gravar no Supabase, continuando localmente:', err);
    }
  }

  const newUser: User = supabaseUser || {
    id: 'usr_' + Date.now().toString(36),
    name,
    email,
  };

  const existingLocal = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existingLocal) {
    users.push({ ...newUser, passwordHash });
    safeLocalStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  seedInitialData(newUser.id);

  return newUser;
};

// Login de Usuário Assíncrono com Supabase
export const loginUserAsync = async (email: string, passwordHash: string): Promise<User> => {
  const formattedEmail = email.toLowerCase().trim();

  // 1. Tenta buscar no Supabase
  if (isSupabaseConfigured) {
    const cloudUser = await findUserInSupabase(formattedEmail, passwordHash);
    if (cloudUser) {
      const users = getUsers();
      if (!users.some(u => u.id === cloudUser.id)) {
        users.push({ ...cloudUser, passwordHash });
        safeLocalStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cloudUser));
      return cloudUser;
    }
  }

  // 2. Fallback: Busca localmente
  const users = getUsers();
  const localUser = users.find(
    u => u.email.toLowerCase() === formattedEmail && u.passwordHash === passwordHash
  );

  if (!localUser) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const userDTO: User = { id: localUser.id, name: localUser.name, email: localUser.email };
  safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDTO));

  if (isSupabaseConfigured) {
    registerUserInSupabase(localUser.name, localUser.email, passwordHash).catch(() => {});
  }

  return userDTO;
};

export const logoutUser = () => {
  safeSessionStorage.removeItem(CURRENT_USER_KEY);
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
    id: 'exp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    userId,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newExpense);
  safeLocalStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return newExpense;
};

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
  if (!data) return getDefaultBudgets();
  const allMap: Record<string, CategoryBudget[]> = JSON.parse(data);
  return allMap[userId] || getDefaultBudgets();
};

export const saveBudgets = (userId: string, budgets: CategoryBudget[]) => {
  const data = safeLocalStorage.getItem(BUDGETS_KEY);
  const allMap: Record<string, CategoryBudget[]> = data ? JSON.parse(data) : {};
  allMap[userId] = budgets;
  safeLocalStorage.setItem(BUDGETS_KEY, JSON.stringify(allMap));
};

const getDefaultBudgets = (): CategoryBudget[] => [
  { category: 'Alimentação', limitAmount: 450 },
  { category: 'Moradia', limitAmount: 900 },
  { category: 'Transporte', limitAmount: 150 },
  { category: 'Lazer & Entretenimento', limitAmount: 200 },
  { category: 'Saúde', limitAmount: 150 },
  { category: 'Compras', limitAmount: 250 },
  { category: 'Contas & Serviços Irlanda', limitAmount: 180 },
  { category: 'Contas & Serviços Brasil', limitAmount: 100 },
];

export const getPiggyBanks = (userId: string): PiggyBank[] => {
  const data = safeLocalStorage.getItem(PIGGY_BANKS_KEY);
  if (!data) return getDefaultPiggyBanks(userId);
  const allMap: Record<string, PiggyBank[]> = JSON.parse(data);
  return allMap[userId] || getDefaultPiggyBanks(userId);
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
    id: 'pgy_' + Date.now().toString(36),
    userId,
    name: item.name,
    targetAmount: item.targetAmount,
    currentAmount: 0,
    color: item.color || '#10B981',
  };
  current.push(newPiggy);
  savePiggyBanks(userId, current);
  return newPiggy;
};

export const updatePiggyBankAmount = (userId: string, id: string, amountChange: number) => {
  const current = getPiggyBanks(userId);
  const updated = current.map(p => {
    if (p.id === id) {
      const newAmount = Math.max(0, Math.round((p.currentAmount + amountChange) * 100) / 100);
      if (isSupabaseConfigured) {
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
};

export const getRecurringTransactions = (userId: string): RecurringTransaction[] => {
  const data = safeLocalStorage.getItem(RECURRING_KEY);
  if (!data) return getDefaultRecurring(userId);
  const allMap: Record<string, RecurringTransaction[]> = JSON.parse(data);
  return (allMap[userId] || getDefaultRecurring(userId)).map(r => ({
    ...r,
    frequency: r.frequency || 'monthly',
  }));
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
    id: 'rec_' + Date.now().toString(36),
    userId,
    ...item,
  };
  current.push(newRecurring);
  saveRecurringTransactions(userId, current);
  return newRecurring;
};

export const deleteRecurringTransaction = (userId: string, id: string) => {
  const current = getRecurringTransactions(userId);
  const filtered = current.filter(r => r.id !== id);
  saveRecurringTransactions(userId, filtered);
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

const getDefaultPiggyBanks = (userId: string): PiggyBank[] => [
  { id: 'pgy_reserva', userId, name: 'Reserva de Emergência', targetAmount: 3000, currentAmount: 1200, color: '#10B981' },
  { id: 'pgy_viagem', userId, name: 'Viagem / Férias', targetAmount: 1500, currentAmount: 450, color: '#3B82F6' },
];

const getDefaultRecurring = (userId: string): RecurringTransaction[] => [
  { id: 'rec_rent', userId, description: 'Renda / Aluguer Habitação', amount: 750, category: 'Moradia', type: 'expense', frequency: 'monthly', dayOfMonth: 5 },
  { id: 'rec_salary', userId, description: 'Salário Semanal (Irlanda)', amount: 650, category: 'Salário', type: 'income', frequency: 'weekly', dayOfWeek: 5 },
  { id: 'rec_gym', userId, description: 'Mensalidade Ginásio', amount: 35, category: 'Saúde', type: 'expense', frequency: 'monthly', dayOfMonth: 10 },
  { id: 'rec_net', userId, description: 'Netflix / Streaming', amount: 15.99, category: 'Lazer & Entretenimento', type: 'expense', frequency: 'monthly', dayOfMonth: 15 },
];

const seedInitialData = (userId: string) => {
  const existingExpenses = getExpenses(userId);
  if (existingExpenses.length > 0) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const prevMonth1 = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const ym1 = `${prevMonth1.getFullYear()}-${String(prevMonth1.getMonth() + 1).padStart(2, '0')}`;

  const prevMonth2 = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const ym2 = `${prevMonth2.getFullYear()}-${String(prevMonth2.getMonth() + 1).padStart(2, '0')}`;

  const demoTransactions: Omit<Expense, 'id' | 'userId' | 'createdAt'>[] = [
    { description: 'Salário Mensal', amount: 2800.00, category: 'Salário', type: 'income', date: `${year}-${month}-01` },
    { description: 'Projeto Freelance', amount: 650.00, category: 'Freelance', type: 'income', date: `${year}-${month}-10` },
    { description: 'Supermercado Mensal', amount: 320.50, category: 'Alimentação', type: 'expense', date: `${year}-${month}-02` },
    { description: 'Renda / Aluguer Habitação', amount: 750.00, category: 'Moradia', type: 'expense', date: `${year}-${month}-05` },
    { description: 'Eletricidade e Água (IE)', amount: 115.30, category: 'Contas & Serviços Irlanda', type: 'expense', date: `${year}-${month}-08` },
    { description: 'Apoio Familiar (BR)', amount: 150.00, category: 'Contas & Serviços Brasil', type: 'expense', date: `${year}-${month}-09` },
    { description: 'Passe Navegante / Combustível', amount: 80.00, category: 'Transporte', type: 'expense', date: `${year}-${month}-10` },
    { description: 'Jantar Restaurante', amount: 65.00, category: 'Lazer & Entretenimento', type: 'expense', date: `${year}-${month}-12` },
    { description: 'Seguro de Saúde', amount: 90.00, category: 'Saúde', type: 'expense', date: `${year}-${month}-15` },

    { description: 'Salário Mensal', amount: 2800.00, category: 'Salário', type: 'income', date: `${ym1}-01` },
    { description: 'Aluguer Habitação', amount: 750.00, category: 'Moradia', type: 'expense', date: `${ym1}-05` },
    { description: 'Supermercado', amount: 410.00, category: 'Alimentação', type: 'expense', date: `${ym1}-08` },
    { description: 'Compras de Vestuário', amount: 180.00, category: 'Compras', type: 'expense', date: `${ym1}-14` },

    { description: 'Salário Mensal', amount: 2800.00, category: 'Salário', type: 'income', date: `${ym2}-01` },
    { description: 'Projeto Freelance', amount: 500.00, category: 'Freelance', type: 'income', date: `${ym2}-12` },
    { description: 'Aluguer Habitação', amount: 750.00, category: 'Moradia', type: 'expense', date: `${ym2}-05` },
    { description: 'Supermercado', amount: 350.00, category: 'Alimentação', type: 'expense', date: `${ym2}-09` },
  ];

  demoTransactions.forEach(t => addExpense(userId, t));
  saveBudgets(userId, getDefaultBudgets());
  savePiggyBanks(userId, getDefaultPiggyBanks(userId));
  saveRecurringTransactions(userId, getDefaultRecurring(userId));
};