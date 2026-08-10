export interface User {
  id: string;
  name: string;
  email: string;
}

export type TransactionType = 'expense' | 'income';

export type CategoryType = 
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer & Entretenimento'
  | 'Saúde'
  | 'Educação'
  | 'Compras'
  | 'Contas & Serviços Irlanda'
  | 'Contas & Serviços Brasil'
  | 'Contas & Serviços'
  | 'Salário'
  | 'Freelance'
  | 'Investimentos'
  | 'Outros';

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: CategoryType;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface CategoryBudget {
  category: CategoryType;
  limitAmount: number;
}

export interface PiggyBank {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: CategoryType;
  type: TransactionType;
  dayOfMonth: number;
}

export interface AIAdvice {
  diagnosis: string;
  healthScore: number; // 0-100
  topCategoryWarning: string;
  savingsPotential: number;
  savingsRate: number; // percentage
  recommendations: string[];
  actionPlan: string[];
}