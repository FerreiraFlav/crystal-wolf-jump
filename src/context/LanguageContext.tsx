import React, { createContext, useContext, useState } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    appTitle: "Meu Orçamento Inteligente",
    aiAssist: "IA Assist",
    logout: "Sair",
    entries: "Entradas (Receitas)",
    exits: "Saídas (Despesas)",
    netBalance: "Saldo Líquido",
    savingsRate: "Taxa de Poupança",
    incomeRetained: "da renda retida",
    newTransaction: "Novo Lançamento",
    expense: "Despesa",
    income: "Receita",
    amount: "Valor (€)",
    description: "Descrição",
    category: "Categoria",
    date: "Data",
    saveExpense: "Salvar Despesa",
    saveIncome: "Salvar Receita",
    history: "Histórico de Lançamentos",
    allTypes: "Todos os Tipos",
    allCategories: "Todas Categorias",
    searchPlaceholder: "Buscar por descrição...",
    noTransactions: "Nenhum lançamento encontrado",
    expenseBreakdown: "Divisão de Despesas",
    noExpensesMonth: "Nenhuma despesa registrada neste mês",
    aiBannerTitle: "Quer saber onde economizar?",
    aiBannerDesc: "Análise inteligente das suas entradas e saídas para indicar cortes no orçamento, pontuação financeira e sugestões de economia em Euro.",
    analyzeBtn: "Analisar Gastos com IA",
    analyzingBtn: "Analisando gastos...",
    categoryGoals: "Metas por Categoria",
    exportImport: "Exportar / Importar",
    today: "Hoje",
    setBudgetLimits: "Definir Limites de Gastos em Euro",
    setBudgetDesc: "Configure limites mensais em € por categoria para monitorar estouros de orçamento.",
    spent: "Gasto",
    ofLimit: "do limite",
    exceededBy: "Excedido em",
    saveLimits: "Salvar Limites",
    cancel: "Cancelar",
    healthScore: "Score de Saúde",
    estimatedSavings: "Economia Estimada",
    advisorOpinion: "Parecer do Consultor Virtual",
    optimizationTips: "Dicas de Otimização",
    actionPlan: "Plano de Ação",
    closeAnalysis: "Fechar Análise",
    food: "Alimentação",
    housing: "Moradia",
    transport: "Transporte",
    leisure: "Lazer & Entretenimento",
    health: "Saúde",
    education: "Educação",
    shopping: "Compras",
    bills: "Contas & Serviços",
    salary: "Salário",
    freelance: "Freelance",
    investments: "Investimentos",
    others: "Outros",
    myProfile: "Meu Perfil",
    accountDetails: "Detalhes da Conta"
  },
  en: {
    appTitle: "Smart Budget Planner",
    aiAssist: "AI Assist",
    logout: "Logout",
    entries: "Incomes (Receivables)",
    exits: "Expenses (Outflows)",
    netBalance: "Net Balance",
    savingsRate: "Savings Rate",
    incomeRetained: "of income saved",
    newTransaction: "New Transaction",
    expense: "Expense",
    income: "Income",
    amount: "Amount (€)",
    description: "Description",
    category: "Category",
    date: "Date",
    saveExpense: "Save Expense",
    saveIncome: "Save Income",
    history: "Transaction History",
    allTypes: "All Types",
    allCategories: "All Categories",
    searchPlaceholder: "Search...",
    noTransactions: "No transactions found",
    expenseBreakdown: "Expense Breakdown",
    noExpensesMonth: "No expenses recorded this month",
    aiBannerTitle: "Want to know where to save?",
    aiBannerDesc: "Smart analysis of your income and expenses to spot budget leaks, financial score, and tailored savings suggestions in Euro.",
    analyzeBtn: "Analyze Expenses with AI",
    analyzingBtn: "Analyzing expenses...",
    categoryGoals: "Category Goals",
    exportImport: "Export / Import",
    today: "Today",
    setBudgetLimits: "Set Expense Limits in Euro",
    setBudgetDesc: "Set monthly limits in € per category to monitor budget overruns.",
    spent: "Spent",
    ofLimit: "of limit",
    exceededBy: "Exceeded by",
    saveLimits: "Save Limits",
    cancel: "Cancel",
    healthScore: "Health Score",
    estimatedSavings: "Estimated Savings",
    advisorOpinion: "Virtual Advisor Opinion",
    optimizationTips: "Optimization Tips",
    actionPlan: "Action Plan",
    closeAnalysis: "Close Analysis",
    food: "Food & Grocery",
    housing: "Housing",
    transport: "Transportation",
    leisure: "Leisure & Entertainment",
    health: "Health & Care",
    education: "Education",
    shopping: "Shopping",
    bills: "Bills & Utilities",
    salary: "Salary",
    freelance: "Freelance",
    investments: "Investments",
    others: "Others",
    myProfile: "My Profile",
    accountDetails: "Account Details"
  },
  es: {
    appTitle: "Mi Presupuesto Inteligente",
    aiAssist: "IA Asistente",
    logout: "Cerrar sesión",
    entries: "Ingresos (Entradas)",
    exits: "Gastos (Salidas)",
    netBalance: "Saldo Neto",
    savingsRate: "Tasa de Ahorro",
    incomeRetained: "del ingreso guardado",
    newTransaction: "Nuevo Registro",
    expense: "Gasto",
    income: "Ingreso",
    amount: "Monto (€)",
    description: "Descripción",
    category: "Categoría",
    date: "Fecha",
    saveExpense: "Guardar Gasto",
    saveIncome: "Guardar Ingreso",
    history: "Historial de Transacciones",
    allTypes: "Todos los Tipos",
    allCategories: "Todas las Categorías",
    searchPlaceholder: "Buscar...",
    noTransactions: "No se encontraron transacciones",
    expenseBreakdown: "Desglose de Gastos",
    noExpensesMonth: "No hay gastos registrados este mes",
    aiBannerTitle: "¿Quieres saber dónde ahorrar?",
    aiBannerDesc: "Análisis inteligente de sus ingresos y gastos para identificar oportunidades de ahorro, puntuación financiera y recomendaciones en Euros.",
    analyzeBtn: "Analizar Gastos con IA",
    analyzingBtn: "Analizando gastos...",
    categoryGoals: "Metas por Categoría",
    exportImport: "Exportar / Importar",
    today: "Hoy",
    setBudgetLimits: "Definir Límites de Gastos en Euro",
    setBudgetDesc: "Configure límites mensuales en € por categoría para controlar su presupuesto.",
    spent: "Gastado",
    ofLimit: "del límite",
    exceededBy: "Excedido por",
    saveLimits: "Guardar Límites",
    cancel: "Cancelar",
    healthScore: "Puntaje de Salud",
    estimatedSavings: "Ahorro Estimado",
    advisorOpinion: "Dictamen del Asesor Virtual",
    optimizationTips: "Consejos de Optimización",
    actionPlan: "Plan de Acción",
    closeAnalysis: "Cerrar Análisis",
    food: "Alimentación",
    housing: "Vivienda",
    transport: "Transporte",
    leisure: "Ocio & Entretenimiento",
    health: "Salud",
    education: "Educación",
    shopping: "Compras",
    bills: "Servicios y Cuentas",
    salary: "Salario",
    freelance: "Freelance",
    investments: "Inversiones",
    others: "Otros",
    myProfile: "Mi Perfil",
    accountDetails: "Detalles de la Cuenta"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language;
    return saved && ['pt', 'en', 'es'].includes(saved) ? saved : 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const formatCurrency = (amount: number): string => {
    const localeMap: Record<Language, string> = {
      pt: 'pt-BR',
      en: 'en-IE',
      es: 'es-ES'
    };
    return new Intl.NumberFormat(localeMap[language] || 'pt-BR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['pt']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, formatCurrency, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
};