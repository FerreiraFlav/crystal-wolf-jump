import { User, Expense, CategoryType, CategoryBudget, PiggyBank } from '@/types/finance';

const USERS_KEY = 'meu_orcamento_users';
const CURRENT_USER_KEY = 'meu_orcamento_current_user';
const EXPENSES_KEY = 'meu_orcamento_expenses';
const BUDGETS_KEY = 'meu_orcamento_budgets';
const PIGGY_BANKS_KEY = 'meu_orcamento_piggy_banks';

// Fallback em memória caso o navegador bloqueie localStorage/sessionStorage (ex: abas anônimas estritas)
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

export const registerUser = (name: string, email: string, passwordHash: string): User => {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.');
  }

  const newUser: User = {
    id: 'usr_' + Date.now().toString(36),
    name,
    email,
  };

  users.push({ ...newUser, passwordHash });
  safeLocalStorage.setItem(USERS_KEY, JSON.stringify(users));
  safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  seedInitialData(newUser.id);

  return newUser;
};

export const loginUser = (email: string, passwordHash: string): User => {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
  );

  if (!user) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const userDTO: User = { id: user.id, name: user.name, email: user.email };
  safeSessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDTO));
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
      const newAmount = Math.max(0, p.currentAmount + amountChange);
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

const getDefaultPiggyBanks = (userId: string): PiggyBank[] => [
  { id: 'pgy_reserva', userId, name: 'Reserva de Emergência', targetAmount: 3000, currentAmount: 1200, color: '#10B981' },
  { id: 'pgy_viagem', userId, name: 'Viagem / Férias', targetAmount: 1500, currentAmount: 450, color: '#3B82F6' },
];

const seedInitialData = (userId: string) => {
  const existingExpenses = getExpenses(userId);
  if (existingExpenses.length > 0) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

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
  ];

  demoTransactions.forEach(t => addExpense(userId, t));
  saveBudgets(userId, getDefaultBudgets());
  savePiggyBanks(userId, getDefaultPiggyBanks(userId));
};