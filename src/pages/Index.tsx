import React, { useState, useEffect } from 'react';
import { User, Expense, AIAdvice, CategoryBudget, TransactionType, CategoryType, PiggyBank } from '@/types/finance';
import { 
  getCurrentUser, 
  logoutUser, 
  getExpenses, 
  addExpense as addExpenseStorage, 
  deleteExpense as deleteExpenseStorage,
  getBudgets,
  saveBudgets,
  getPiggyBanks
} from '@/services/storage';
import { 
  fetchExpensesFromSupabase, 
  saveExpenseToSupabase, 
  deleteExpenseFromSupabase 
} from '@/services/supabaseStorage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { analyzeExpensesWithAI } from '@/services/aiAdvisor';
import { AuthModal } from '@/components/AuthModal';
import { Navbar } from '@/components/Navbar';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { ExpenseList } from '@/components/ExpenseList';
import { MonthPicker } from '@/components/MonthPicker';
import { BudgetManagerModal } from '@/components/BudgetManagerModal';
import { ExportImportModal } from '@/components/ExportImportModal';
import { AIAdvisorModal } from '@/components/AIAdvisorModal';
import { CofrinhoModal } from '@/components/CofrinhoModal';
import { Button } from '@/components/ui/button';
import { Sparkles, BrainCircuit, Target, Download, PiggyBank as PiggyIcon } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
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
  
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadUserData(user.id);
    }
  }, []);

  const loadUserData = async (userId: string) => {
    // Carrega Cofrinhos e Metas
    const piggyData = getPiggyBanks(userId);
    setPiggyBanks(piggyData);

    const budgetData = getBudgets(userId);
    setBudgets(budgetData);

    // Tenta carregar do Supabase se estiver configurado
    if (isSupabaseConfigured) {
      const supabaseExpenses = await fetchExpensesFromSupabase(userId);
      if (supabaseExpenses.length > 0) {
        setExpenses(supabaseExpenses);
        return;
      }
    }

    // Fallback/Modo Local
    const expData = getExpenses(userId);
    setExpenses(expData);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.id);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setExpenses([]);
    showSuccess('Você saiu com segurança.');
  };

  const handleAddExpense = async (newExp: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => {
    if (!currentUser) return;

    const savedLocal = addExpenseStorage(currentUser.id, newExp);

    if (isSupabaseConfigured) {
      await saveExpenseToSupabase(currentUser.id, newExp);
    }

    loadUserData(currentUser.id);
  };

  const handleDeleteExpense = async (id: string) => {
    deleteExpenseStorage(id);

    if (isSupabaseConfigured) {
      await deleteExpenseFromSupabase(id);
    }

    if (currentUser) {
      loadUserData(currentUser.id);
    }
    showSuccess('Lançamento removido.');
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

  // Saldo disponível (Não utilizado) no mês selecionado
  const totalIncome = currentMonthExpenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSpent = currentMonthExpenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = totalIncome - totalSpent;

  const monthLabel = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Barra Superior de Ferramentas (Mês, Cofrinhos, Limites, Backup) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <MonthPicker
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeMonth={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
          />

          <div className="flex flex-wrap items-center space-x-2 w-full md:w-auto justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCofrinhoModalOpen(true)}
              className="rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5"
            >
              <PiggyIcon className="w-4 h-4 text-emerald-600" />
              {t('piggyBanks')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBudgetModalOpen(true)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <Target className="w-4 h-4 text-emerald-600" />
              {t('categoryGoals')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-600" />
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
        <SummaryCards expenses={currentMonthExpenses} />

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

        {/* List of Transactions */}
        <div>
          <ExpenseList expenses={currentMonthExpenses} onDeleteExpense={handleDeleteExpense} />
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Meu Orçamento Inteligente (€) • Seus dados financeiros mantidos seguros.
        </div>
      </footer>
    </div>
  );
};

export default Index;