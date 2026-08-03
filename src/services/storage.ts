import { User, Expense, CategoryType } from '@/types/finance';

const USERS_KEY = 'meu_orcamento_users';
const CURRENT_USER_KEY = 'meu_orcamento_current_user';
const EXPENSES_KEY = 'meu_orcamento_expenses';

export const CATEGORIES: { name: CategoryType; color: string; icon: string }[] = [
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

  // Seed initial expenses for a realistic demo preview
  seedInitialExpenses(newUser.id);

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

// Funções de Despesas
export const getExpenses = (userId: string): Expense[] => {
  const data = localStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = data ? JSON.parse(data) : [];
  return all.filter(e => e.userId === userId);
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

// Dados de Demonstração
const seedInitialExpenses = (userId: string) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const demoExpenses: Omit<Expense, 'id' | 'userId' | 'createdAt'>[] = [
    { description: 'Supermercado Mensal', amount: 840.50, category: 'Alimentação', date: `${year}-${month}-02` },
    { description: 'Aluguel & Condomínio', amount: 1500.00, category: 'Moradia', date: `${year}-${month}-05` },
    { description: 'Conta de Luz e Água', amount: 285.30, category: 'Contas & Serviços', date: `${year}-${month}-08` },
    { description: 'Combustível / Uber', amount: 230.00, category: 'Transporte', date: `${year}-${month}-10` },
    { description: 'Jantar Restaurante', amount: 145.00, category: 'Lazer & Entretenimento', date: `${year}-${month}-12` },
    { description: 'Plano de Saúde', amount: 390.00, category: 'Saúde', date: `${year}-${month}-15` },
    { description: 'Curso de Especialização', amount: 290.00, category: 'Educação', date: `${year}-${month}-18` },
    { description: 'Feira Semanal', amount: 115.80, category: 'Alimentação', date: `${year}-${month}-20` },
    { description: 'Serviços de Streaming', amount: 55.90, category: 'Lazer & Entretenimento', date: `${year}-${month}-22` },
  ];

  demoExpenses.forEach(exp => addExpense(userId, exp));
};