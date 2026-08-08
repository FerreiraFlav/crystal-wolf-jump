import { User, Expense, CategoryType, CategoryBudget } from '@/types/finance';

const USERS_KEY = 'meu_orcamento_users';
const CURRENT_USER_KEY = 'meu_orcamento_current_user';
const EXPENSES_KEY = 'meu_orcamento_expenses';
const BUDGETS_KEY = 'meu_orcamento_budgets';

export const EXPENSE_CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
  { name: 'Alimentação', color: '#10B981', icon: 'Utensils' },
  { name: 'Moradia', color: '#3B82F6', icon: 'Home' },
  { name: 'Transporte', color: '#F59E0B', icon: 'Car' },
  { name: 'Lazer & Entretenimento', color: '#EC4899', icon: 'Tv' },
  { name: 'Saúde', color: '#EF4444', icon: 'HeartPulse' },
  { name: 'Educação', color: '#8B5CF6', icon: 'GraduationCap' },
  { name: 'Compras', color: '#6366F1', icon: 'ShoppingBag' },
  { name: 'Contas & Serviços', color: '#14B8A6', icon: 'Receipt' },
  { name: 'Outros', color: '#6B7280', icon: 'MoreHorizontal' },
];

export const INCOME_CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
  { name: 'Salário', color: '#059669', icon: 'Briefcase' },
  { name: 'Freelance', color: '#0284C7', icon: 'Laptop' },
  { name: 'Investimentos', color: '#7C3AED', icon: 'TrendingUp' },
  { name: 'Outros', color: '#4B5563', icon: 'PlusCircle' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

// Funções de Usuário
export const getUsers = (): (User & { passwordHash: string })[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
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
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  // Seed initial expenses and income for demo in EUR
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
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDTO));
  return userDTO;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Funções de Despesas / Receitas
export const getExpenses = (userId: string): Expense[] => {
  const data = localStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = data ? JSON.parse(data) : [];
  return all
    .filter(e => e.userId === userId)
    .map(e => ({ ...e, type: e.type || 'expense' }));
};

export const addExpense = (userId: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Expense => {
  const data = localStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = data ? JSON.parse(data) : [];

  const newExpense: Expense = {
    ...expense,
    id: 'exp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    userId,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newExpense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return newExpense;
};

export const deleteExpense = (id: string) => {
  const data = localStorage.getItem(EXPENSES_KEY);
  if (!data) return;
  const all: Expense[] = JSON.parse(data);
  const filtered = all.filter(e => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
};

export const importExpenses = (userId: string, imported: Omit<Expense, 'id' | 'userId' | 'createdAt'>[]) => {
  imported.forEach(exp => addExpense(userId, exp));
};

// Funções de Orçamento por Categoria em Euro (€)
export const getBudgets = (userId: string): CategoryBudget[] => {
  const data = localStorage.getItem(BUDGETS_KEY);
  if (!data) return getDefaultBudgets();
  const allMap: Record<string, CategoryBudget[]> = JSON.parse(data);
  return allMap[userId] || getDefaultBudgets();
};

export const saveBudgets = (userId: string, budgets: CategoryBudget[]) => {
  const data = localStorage.getItem(BUDGETS_KEY);
  const allMap: Record<string, CategoryBudget[]> = data ? JSON.parse(data) : {};
  allMap[userId] = budgets;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(allMap));
};

const getDefaultBudgets = (): CategoryBudget[] => [
  { category: 'Alimentação', limitAmount: 450 },
  { category: 'Moradia', limitAmount: 900 },
  { category: 'Transporte', limitAmount: 150 },
  { category: 'Lazer & Entretenimento', limitAmount: 200 },
  { category: 'Saúde', limitAmount: 150 },
  { category: 'Compras', limitAmount: 250 },
  { category: 'Contas & Serviços', limitAmount: 180 },
];

// Dados de Demonstração em Euro (€)
const seedInitialData = (userId: string) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const demoTransactions: Omit<Expense, 'id' | 'userId' | 'createdAt'>[] = [
    // Receitas (€)
    { description: 'Salário Mensal', amount: 2800.00, category: 'Salário', type: 'income', date: `${year}-${month}-01` },
    { description: 'Projeto Freelance', amount: 650.00, category: 'Freelance', type: 'income', date: `${year}-${month}-10` },

    // Despesas (€)
    { description: 'Supermercado Mensal', amount: 320.50, category: 'Alimentação', type: 'expense', date: `${year}-${month}-02` },
    { description: 'Renda / Aluguer Habitação', amount: 750.00, category: 'Moradia', type: 'expense', date: `${year}-${month}-05` },
    { description: 'Eletricidade e Água', amount: 115.30, category: 'Contas & Serviços', type: 'expense', date: `${year}-${month}-08` },
    { description: 'Passe Navegante / Combustível', amount: 80.00, category: 'Transporte', type: 'expense', date: `${year}-${month}-10` },
    { description: 'Jantar Restaurante', amount: 65.00, category: 'Lazer & Entretenimento', type: 'expense', date: `${year}-${month}-12` },
    { description: 'Seguro de Saúde', amount: 90.00, category: 'Saúde', type: 'expense', date: `${year}-${month}-15` },
    { description: 'Curso de Especialização', amount: 120.00, category: 'Educação', type: 'expense', date: `${year}-${month}-18` },
    { description: 'Compras de Mercearia', amount: 48.80, category: 'Alimentação', type: 'expense', date: `${year}-${month}-20` },
    { description: 'Serviços de Streaming', amount: 22.90, category: 'Lazer & Entretenimento', type: 'expense', date: `${year}-${month}-22` },
  ];

  demoTransactions.forEach(t => addExpense(userId, t));
  saveBudgets(userId, getDefaultBudgets());
};