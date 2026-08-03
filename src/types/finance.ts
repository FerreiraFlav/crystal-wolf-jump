export interface User {
  id: string;
  name: string;
  email: string;
}

export type CategoryType = 
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer & Entretenimento'
  | 'Saúde'
  | 'Educação'
  | 'Compras'
  | 'Contas & Serviços'
  | 'Outros';

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface AIAdvice {
  diagnosis: string;
  healthScore: number; // 0-100
  topCategoryWarning: string;
  savingsPotential: number;
  recommendations: string[];
  actionPlan: string[];
}