import React, { createContext, useContext, useState } from 'react';

export type Language = 'pt' | 'en' | 'es';
export type CurrencyCode = 'EUR' | 'USD' | 'BRL' | 'GBP' | 'CHF';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: 'EUR', symbol: '€', name: 'Euro (€)', locale: 'pt-PT' },
  { code: 'USD', symbol: '$', name: 'Dólar ($)', locale: 'en-US' },
  { code: 'BRL', symbol: 'R$', name: 'Real (R$)', locale: 'pt-BR' },
  { code: 'GBP', symbol: '£', name: 'Libra (£)', locale: 'en-GB' },
  { code: 'CHF', symbol: 'CHF', name: 'Franco Suíço (CHF)', locale: 'de-CH' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  getCategoryLabel: (category: string) => string;
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
    amount: "Valor",
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
    aiBannerDesc: "Análise inteligente das suas entradas e saídas para indicar cortes no orçamento, pontuação financeira e sugestões de economia.",
    analyzeBtn: "Analisar Gastos com IA",
    analyzingBtn: "Analisando gastos...",
    categoryGoals: "Metas por Categoria",
    exportImport: "Exportar / Importar",
    today: "Hoje",
    setBudgetLimits: "Definir Limites de Gastos por Categoria",
    setBudgetDesc: "Configure limites mensais por categoria para monitorar estouros de orçamento.",
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
    accountDetails: "Detalhes da Conta",
    piggyBanks: "Cofrinhos & Metas",
    newPiggyBank: "Novo Cofrinho",
    piggyBankDesc: "Separe dinheiro guardado para objetivos específicos como Viagens, Reserva de Emergência ou Compras.",
    deposit: "Guardar",
    withdraw: "Resgatar",
    targetAmount: "Meta",
    savedAmount: "Guardado",
    totalInPiggyBanks: "Total Guardado em Cofrinhos",
    cofrinhoName: "Nome do Objetivo",
    createCofrinho: "Criar Cofrinho",
    financialTrend: "Evolução Financeira (6 Meses)",
    editTransaction: "Editar Lançamento",
    saveChanges: "Salvar Alterações",
    recurringBills: "Contas Fixas & Assinaturas",
    recurringDesc: "Cadastre despesas e pagamentos (mensais, semanais ou quinzenais) para lançá-los com 1 clique no mês atual.",
    postCurrentMonth: "Lançar no Mês Atual",
    dayOfMonth: "Dia do Mês",
    dayOfWeek: "Dia da Semana",
    frequency: "Frequência de Pagamento",
    addRecurring: "Adicionar Conta Fixa",
    noRecurring: "Nenhuma conta fixa cadastrada.",
    itemAddedToMonth: "lançamento(s) recorrente(s) adicionado(s) a este mês!",
    freqMonthly: "Mensal (Dia do Mês)",
    freqWeekly: "Toda Semana (Dia da Semana)",
    freqBiweekly: "A cada 15 dias (Quinzenal)",
    sunday: "Domingo",
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    billsIreland: "Contas & Serviços Irlanda",
    billsBrazil: "Contas & Serviços Brasil",
    manage: "Gerenciar",
    noPiggyBanksYet: "Nenhum cofrinho criado ainda. Clique em \"Gerenciar\" para criar sua primeira meta.",
    expensePlaceholder: "Ex: Supermercado, Renda, Restauração...",
    incomePlaceholder: "Ex: Salário, Freelance, Investimentos...",
    limit: "Limite",
    delete: "Excluir",
    editModalDesc: "Modifique os dados do seu lançamento financeiro.",
    fillDescription: "Por favor, insira uma descrição.",
    fillValidAmount: "Por favor, insira um valor válido maior que zero.",
    savedInPiggies: "guardados nos cofrinhos",
    transactionSaved: "Lançamento salvo!",
    transactionUpdated: "Lançamento atualizado com sucesso!",
    transactionDeleted: "Lançamento removido.",
    prevMonth: "Mês Anterior",
    nextMonth: "Próximo Mês",
    themeLight: "Claro",
    themeDark: "Escuro",
    of: "de",
    confirm: "Confirmar",
    save: "Salvar",
    availableBalance: "Saldo livre",
    savedInPiggy: "Guardado no cofrinho",
    saveAllAvailable: "Guardar todo o saldo disponível",
    registeredRecurring: "Contas Fixas Cadastradas",
    everyWeek: "Toda Semana",
    everyTwoWeeks: "A cada 15 dias",
    monthly: "Mensal",
    day: "Dia",
    budgetsSaved: "Limites salvos com sucesso!",
    exportImportData: "Exportar e Importar Dados",
    exportImportDesc: "Gere relatórios visuais em PDF, planilhas CSV ou faça backup em JSON.",
    exportTitle: "1. Exportar Relatório / Backup",
    generatePdfReport: "Gerar Relatório PDF",
    csvSpreadsheet: "Planilha CSV",
    jsonBackup: "Backup JSON",
    pdfTipTitle: "Dica para salvar o PDF:",
    pdfTipDesc: "Ao clicar no botão verde de PDF, a janela de impressão abrirá. Selecione a opção \"Salvar como PDF\" no seu navegador para salvar o arquivo no computador.",
    importTitle: "2. Importar Lançamentos (JSON)",
    downloadTemplate: "Baixar Modelo",
    chooseJsonFile: "Escolher Arquivo .JSON",
    orPasteBelow: "— Ou cole o conteúdo abaixo —",
    importPastedText: "Importar Texto Colado"
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
    amount: "Amount",
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
    aiBannerDesc: "Smart analysis of your income and expenses to spot budget leaks, financial score, and tailored savings suggestions.",
    analyzeBtn: "Analyze Expenses with AI",
    analyzingBtn: "Analyzing expenses...",
    categoryGoals: "Category Goals",
    exportImport: "Export / Import",
    today: "Today",
    setBudgetLimits: "Set Expense Limits per Category",
    setBudgetDesc: "Set monthly limits per category to monitor budget overruns.",
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
    accountDetails: "Account Details",
    piggyBanks: "Piggy Banks & Goals",
    newPiggyBank: "New Piggy Bank",
    piggyBankDesc: "Set money aside for specific goals like Vacations, Emergency Fund, or Big Purchases.",
    deposit: "Deposit",
    withdraw: "Withdraw",
    targetAmount: "Goal",
    savedAmount: "Saved",
    totalInPiggyBanks: "Total Saved in Piggy Banks",
    cofrinhoName: "Goal Name",
    createCofrinho: "Create Piggy Bank",
    financialTrend: "Financial Evolution (6 Months)",
    editTransaction: "Edit Transaction",
    saveChanges: "Save Changes",
    recurringBills: "Fixed Bills & Subscriptions",
    recurringDesc: "Manage fixed expenses and payments (monthly, weekly, or fortnightly) to post them into the active month with 1 click.",
    postCurrentMonth: "Post into Selected Month",
    dayOfMonth: "Day of Month",
    dayOfWeek: "Day of Week",
    frequency: "Payment Frequency",
    addRecurring: "Add Fixed Item",
    noRecurring: "No fixed bills registered.",
    itemAddedToMonth: "recurring item(s) added to this month!",
    freqMonthly: "Monthly (Day of Month)",
    freqWeekly: "Weekly (Day of Week)",
    freqBiweekly: "Fortnightly (Every 2 Weeks)",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    billsIreland: "Bills & Services Ireland",
    billsBrazil: "Bills & Services Brazil",
    manage: "Manage",
    noPiggyBanksYet: "No piggy banks created yet. Click \"Manage\" to create your first goal.",
    expensePlaceholder: "e.g. Groceries, Rent, Dining out...",
    incomePlaceholder: "e.g. Salary, Freelance, Investments...",
    limit: "Limit",
    delete: "Delete",
    editModalDesc: "Edit your transaction details.",
    fillDescription: "Please enter a description.",
    fillValidAmount: "Please enter a valid amount greater than zero.",
    savedInPiggies: "saved in piggy banks",
    transactionSaved: "Transaction saved!",
    transactionUpdated: "Transaction updated successfully!",
    transactionDeleted: "Transaction removed.",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    themeLight: "Light",
    themeDark: "Dark",
    of: "of",
    confirm: "Confirm",
    save: "Save",
    availableBalance: "Available balance",
    savedInPiggy: "Saved in piggy bank",
    saveAllAvailable: "Save entire available balance",
    registeredRecurring: "Registered Recurring Items",
    everyWeek: "Every Week",
    everyTwoWeeks: "Every 2 Weeks",
    monthly: "Monthly",
    day: "Day",
    budgetsSaved: "Limits saved successfully!",
    exportImportData: "Export and Import Data",
    exportImportDesc: "Generate visual PDF reports, CSV spreadsheets, or JSON backups.",
    exportTitle: "1. Export Report / Backup",
    generatePdfReport: "Generate PDF Report",
    csvSpreadsheet: "CSV Spreadsheet",
    jsonBackup: "JSON Backup",
    pdfTipTitle: "Tip for saving PDF:",
    pdfTipDesc: "When clicking the green PDF button, the print window will open. Select \"Save as PDF\" in your browser to save the file to your computer.",
    importTitle: "2. Import Transactions (JSON)",
    downloadTemplate: "Download Template",
    chooseJsonFile: "Choose .JSON File",
    orPasteBelow: "— Or paste the content below —",
    importPastedText: "Import Pasted Text"
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
    amount: "Monto",
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
    aiBannerDesc: "Análisis inteligente de sus ingresos y gastos para identificar oportunidades de ahorro, puntuación financiera y recomendaciones.",
    analyzeBtn: "Analizar Gastos con IA",
    analyzingBtn: "Analizando gastos...",
    categoryGoals: "Metas por Categoría",
    exportImport: "Exportar / Importar",
    today: "Hoy",
    setBudgetLimits: "Definir Límites de Gastos por Categoría",
    setBudgetDesc: "Configure límites mensuales por categoría para controlar su presupuesto.",
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
    accountDetails: "Detalles de la Cuenta",
    piggyBanks: "Huchas y Metas",
    newPiggyBank: "Nueva Hucha",
    piggyBankDesc: "Guarde dinero para metas específicas como Fondo de Emergencia, Viajes o Compras.",
    deposit: "Depositar",
    withdraw: "Retirar",
    targetAmount: "Meta",
    savedAmount: "Guardado",
    totalInPiggyBanks: "Total Guardado en Huchas",
    cofrinhoName: "Nombre de la Meta",
    createCofrinho: "Crear Hucha",
    financialTrend: "Evolución Financiera (6 Meses)",
    editTransaction: "Editar Transacción",
    saveChanges: "Guardar Cambios",
    recurringBills: "Cuentas Fijas y Suscripciones",
    recurringDesc: "Gestione sus gastos fijos e ingresos (mensuales, semanales o quincenales) para publicarlos en el mes activo en 1 clic.",
    postCurrentMonth: "Publicar en el Mes Seleccionado",
    dayOfMonth: "Día del Mes",
    dayOfWeek: "Día de la Semana",
    frequency: "Frecuencia de Pago",
    addRecurring: "Añadir Cuenta Fija",
    noRecurring: "No hay cuentas fijas registradas.",
    itemAddedToMonth: "registro(s) recurrente(s) añadido(s) a este mes!",
    freqMonthly: "Mensual (Día del Mes)",
    freqWeekly: "Semanal (Día de la Semana)",
    freqBiweekly: "Cada 15 días (Quincenal)",
    sunday: "Domingo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    billsIreland: "Cuentas y Servicios Irlanda",
    billsBrazil: "Cuentas y Servicios Brasil",
    manage: "Gestionar",
    noPiggyBanksYet: "No hay alcancías creadas aún. Haga clic en \"Gestionar\" para crear su primera meta.",
    expensePlaceholder: "Ej: Supermercado, Alquiler, Restaurante...",
    incomePlaceholder: "Ej: Salario, Freelance, Inversiones...",
    limit: "Límite",
    delete: "Eliminar",
    editModalDesc: "Modifique los detalles de su transacción.",
    fillDescription: "Por favor, ingrese una descripción.",
    fillValidAmount: "Por favor, ingrese un monto válido mayor a cero.",
    savedInPiggies: "guardados en alcancías",
    transactionSaved: "¡Transacción guardada!",
    transactionUpdated: "¡Transacción actualizada con éxito!",
    transactionDeleted: "Transacción eliminada.",
    prevMonth: "Mes Anterior",
    nextMonth: "Próximo Mes",
    themeLight: "Claro",
    themeDark: "Oscuro",
    of: "de",
    confirm: "Confirmar",
    save: "Guardar",
    availableBalance: "Saldo disponible",
    savedInPiggy: "Guardado en alcancía",
    saveAllAvailable: "Guardar todo el saldo disponible",
    registeredRecurring: "Cuentas Fijas Registradas",
    everyWeek: "Cada Semana",
    everyTwoWeeks: "Cada 15 días",
    monthly: "Mensual",
    day: "Día",
    budgetsSaved: "¡Límites guardados con éxito!",
    exportImportData: "Exportar e Importar Datos",
    exportImportDesc: "Genere informes visuales en PDF, hojas de cálculo CSV o copias de seguridad en JSON.",
    exportTitle: "1. Exportar Informe / Copia de Seguridad",
    generatePdfReport: "Generar Informe PDF",
    csvSpreadsheet: "Hoja de cálculo CSV",
    jsonBackup: "Copia JSON",
    pdfTipTitle: "Consejo para guardar el PDF:",
    pdfTipDesc: "Al hacer clic en el botón verde de PDF, se abrirá la ventana de impresión. Seleccione la opción \"Guardar como PDF\" en su navegador para guardar el archivo en su computadora.",
    importTitle: "2. Importar Transacciones (JSON)",
    downloadTemplate: "Descargar Plantilla",
    chooseJsonFile: "Elegir Archivo .JSON",
    orPasteBelow: "— O pegue el contenido a continuación —",
    importPastedText: "Importar Texto Pegado"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language') as Language;
      return saved && ['pt', 'en', 'es'].includes(saved) ? saved : 'pt';
    } catch {
      return 'pt';
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('app_currency') as CurrencyCode;
      return saved && POPULAR_CURRENCIES.some(c => c.code === saved) ? saved : 'EUR';
    } catch {
      return 'EUR';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch {
      // Ignorar caso o armazenamento esteja desativado
    }
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('app_currency', curr);
    } catch {
      // Ignorar caso o armazenamento esteja desativado
    }
  };

  const currentCurrencyInfo = POPULAR_CURRENCIES.find(c => c.code === currency) || POPULAR_CURRENCIES[0];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(currentCurrencyInfo.locale, {
      style: 'currency',
      currency: currentCurrencyInfo.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['pt']?.[key] || key;
  };

  const categoryKeyMap: Record<string, string> = {
    'Alimentação': 'food',
    'Moradia': 'housing',
    'Transporte': 'transport',
    'Lazer & Entretenimento': 'leisure',
    'Saúde': 'health',
    'Educação': 'education',
    'Compras': 'shopping',
    'Contas & Serviços Irlanda': 'billsIreland',
    'Contas & Serviços Brasil': 'billsBrazil',
    'Contas & Serviços': 'bills',
    'Salário': 'salary',
    'Freelance': 'freelance',
    'Investimentos': 'investments',
    'Outros': 'others',
  };

  const getCategoryLabel = (category: string): string => {
    const key = categoryKeyMap[category];
    if (key) {
      return t(key);
    }
    return category;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      currency, 
      setCurrency, 
      currencySymbol: currentCurrencyInfo.symbol, 
      formatCurrency, 
      t,
      getCategoryLabel
    }}>
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