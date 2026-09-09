import React, { useState, useEffect } from 'react';
import { User, Expense, AIAdvice, CategoryBudget, TransactionType, CategoryType, PiggyBank } from '@/types/finance';
import { 
  getCurrentUser, 
  logoutUser, 
  getExpenses, 
  addExpense as addExpenseStorage, 
  updateExpense as updateExpenseStorage,
  deleteExpense as deleteExpenseStorage,
  getBudgets,
  saveBudgets,
  getPiggyBanks
} from '@/services/storage';
import { 
  fetchExpensesFromSupabase, 
  saveExpenseToSupabase, 
  deleteExpenseFromSupabase,
  updateExpenseInSupabase,
  fetchBudgetsFromSupabase,
  fetchPiggyBanksFromSupabase
} from '@/services/supabaseStorage';
import { checkIsConfigured, getSupabase } from '@/lib/supabase';
import { analyzeExpensesWithAI } from '@/services/aiAdvisor';
import { AuthModal } from '@/components/AuthModal';
import { Navbar } from '@/components/Navbar';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { ExpenseList } from '@/components/ExpenseList';
import { FinancialTrendChart } from '@/components/FinancialTrendChart';
import { MonthPicker } from '@/components/MonthPicker';
import { BudgetManagerModal } from '@/components/BudgetManagerModal';
import { ExportImportModal } from '@/components/ExportImportModal';
import { AIAdvisorModal } from '@/components/AIAdvisorModal';
import { CofrinhoModal } from '@/components/CofrinhoModal';
import { RecurringTransactionsModal } from '@/components/RecurringTransactionsModal';
import { PiggyBankWidget } from '@/components/PiggyBankWidget';
import { Button } from '@/components/ui/button';
import { Sparkles, BrainCircuit, Target, Download, PiggyBank as PiggyIcon, Repeat } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const { t, currencySymbol, language } = useLanguage();
  const today = new Date();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);

  // Navegação de Mês/Ano
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());

  // Modais
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCofrinhoModalOpen, setIsCofrinhoModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        loadUserData(user.id);
      }
    } catch (err) {
      console.warn('Erro ao restaurar usuário no carregamento inicial:', err);
    }

    const client = getSupabase();
    if (client) {
      // Restaura sessão existente caso a aba tenha sido recarregada ou reaberta
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userObj: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
          };
          setCurrentUser(userObj);
          loadUserData(session.user.id);
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setExpenses([]);
          setBudgets([]);
          setPiggyBanks([]);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const userObj: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
          };
          setCurrentUser(userObj);
          loadUserData(session.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // 1. Carrega do cache local
      setExpenses(getExpenses(userId));
      setPiggyBanks(getPiggyBanks(userId));
      setBudgets(getBudgets(userId));

      // 2. Sincroniza diretamente com o Supabase
      if (checkIsConfigured()) {
        const [cloudExpenses, cloudBudgets, cloudPiggy] = await Promise.all([
          fetchExpensesFromSupabase(userId),
          fetchBudgetsFromSupabase(userId),
          fetchPiggyBanksFromSupabase(userId),
        ]);

        setExpenses(cloudExpenses);
        setBudgets(cloudBudgets);
        setPiggyBanks(cloudPiggy);

        try {
          localStorage.setItem('meu_orcamento_expenses', JSON.stringify(cloudExpenses));

          const existingBudgets = JSON.parse(localStorage.getItem('meu_orcamento_budgets') || '{}');
          existingBudgets[userId] = cloudBudgets;
          localStorage.setItem('meu_orcamento_budgets', JSON.stringify(existingBudgets));

          const existingPiggy = JSON.parse(localStorage.getItem('meu_orcamento_piggy_banks') || '{}');
          existingPiggy[userId] = cloudPiggy;
          localStorage.setItem('meu_orcamento_piggy_banks', JSON.stringify(existingPiggy));
        } catch {
          // Ignora falha de cache local se storage estiver indisponível
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do usuário:', err);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.id);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setExpenses([]);
    setBudgets([]);
    setPiggyBanks([]);
    showSuccess('Você saiu com segurança.');
  };

  const handleAddExpense = async (newExp: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => {
    if (!currentUser) return;

    addExpenseStorage(currentUser.id, newExp);

    if (checkIsConfigured()) {
      await saveExpenseToSupabase(currentUser.id, newExp);
    }

    loadUserData(currentUser.id);
  };

  const handleEditExpense = async (id: string, updated: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => {
    if (!currentUser) return;
    updateExpenseStorage(id, updated);

    if (checkIsConfigured()) {
      await updateExpenseInSupabase(id, updated);
    }

    loadUserData(currentUser.id);
  };

  const handleDeleteExpense = async (id: string) => {
    deleteExpenseStorage(id);

    if (checkIsConfigured()) {
      await deleteExpenseFromSupabase(id);
    }

    if (currentUser) {
      loadUserData(currentUser.id);
    }
    showSuccess(t('transactionDeleted'));
  };

  const handleSaveBudgets = (updated: CategoryBudget[]) => {
    if (!currentUser) return;
    saveBudgets(currentUser.id, updated);
    setBudgets(updated);
  };

  const handleRunAIAnalysis = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const yearMonthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      const monthExpenses = expenses.filter(exp => exp.date.startsWith(yearMonthStr));

      const advice = analyzeExpensesWithAI(monthExpenses, budgets);
      setAiAdvice(advice);
      setIsAnalyzing(false);
      setIsAIModalOpen(true);
    }, 700);
  };

  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedYearMonthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(selectedYearMonthStr));

  const totalIncome = currentMonthExpenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSpent = currentMonthExpenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSavedInPiggy = piggyBanks.reduce((acc, curr) => acc + curr.currentAmount, 0);

  // Saldo disponível deduz os valores alocados nos cofrinhos
  const availableBalance = totalIncome - totalSpent - totalSavedInPiggy;

  const localeMap: Record<string, string> = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES'
  };

  const monthLabel = new Date(selectedYear, selectedMonth, 1).toLocaleDateString(localeMap[language] || 'pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Barra Superior de Ferramentas */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
          <MonthPicker
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeMonth={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
          />

          <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:flex md:w-auto md:flex-wrap md:justify-end md:gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecurringModalOpen(true)}
              className="w-full justify-center rounded-xl border-teal-200 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-xs font-bold md:w-auto flex items-center gap-1.5 transition-colors"
            >
              <Repeat className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {t('recurringBills')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCofrinhoModalOpen(true)}
              className="w-full justify-center rounded-xl border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold md:w-auto flex items-center gap-1.5 transition-colors"
            >
              <PiggyIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t('piggyBanks')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBudgetModalOpen(true)}
              className="w-full justify-center rounded-xl border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold md:w-auto flex items-center gap-1.5 transition-colors"
            >
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t('categoryGoals')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="w-full justify-center rounded-xl border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold md:w-auto flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t('exportImport')}
            </Button>
          </div>
        </div>

        {/* Banner com Botão da IA */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
          <div className="space-y-2 text-center md:text-left z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('aiAssist')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('aiBannerTitle')}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t('aiBannerDesc')}
            </p>
          </div>

          <div className="z-10 shrink-0 w-full md:w-auto">
            <Button
              size="lg"
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-3 border border-emerald-300/40"
            >
              <BrainCircuit className="w-6 h-6 text-slate-950 animate-bounce" />
              <span>{isAnalyzing ? t('analyzingBtn') : t('analyzeBtn')}</span>
            </Button>
          </div>

          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Summary Cards */}
        <SummaryCards expenses={currentMonthExpenses} piggyBanks={piggyBanks} />

        {/* Widget de Cofrinhos */}
        <PiggyBankWidget
          piggyBanks={piggyBanks}
          onOpenModal={() => setIsCofrinhoModalOpen(true)}
        />

        {/* Form + Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          <div className="lg:col-span-7">
            <ExpensePieChart 
              expenses={currentMonthExpenses} 
              budgets={budgets}
              currentMonthLabel={monthLabel} 
            />
          </div>
        </div>

        {/* Gráfico de Evolução Financeira (6 Meses) */}
        <div>
          <FinancialTrendChart
            expenses={expenses}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </div>

        {/* List of Transactions */}
        <div>
          <ExpenseList 
            expenses={currentMonthExpenses} 
            onDeleteExpense={handleDeleteExpense} 
            onEditExpense={handleEditExpense}
          />
        </div>
      </main>

      {/* Modais */}
      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        advice={aiAdvice}
      />

      <CofrinhoModal
        isOpen={isCofrinhoModalOpen}
        onClose={() => setIsCofrinhoModalOpen(false)}
        userId={currentUser.id}
        availableBalance={availableBalance}
        onUpdate={() => loadUserData(currentUser.id)}
      />

      <RecurringTransactionsModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        userId={currentUser.id}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onRefreshData={() => loadUserData(currentUser.id)}
      />

      <BudgetManagerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={budgets}
        expenses={currentMonthExpenses}
        onSaveBudgets={handleSaveBudgets}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        userId={currentUser.id}
        expenses={expenses}
        onRefreshData={() => loadUserData(currentUser.id)}
      />

    </div>
  );
};

export default Index;
