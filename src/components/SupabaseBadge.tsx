import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, Wifi, Info, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';

export const SupabaseBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- SCRIPT DE CRIAÇÃO DE TABELAS PARA MEU ORÇAMENTO INTELIGENTE

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piggy_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL,
  current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  day_of_month INT,
  day_of_week INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    showSuccess('Script SQL copiado com sucesso!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded-full font-semibold shadow-xs cursor-pointer transition-all ${
          isSupabaseConfigured 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100' 
            : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
        }`}
        title="Clique para ver o status e script SQL do banco"
      >
        {isSupabaseConfigured ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Sincronizado (Nuvem)</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Modo Local (Off-line)</span>
            <Info className="w-3 h-3 text-amber-600 ml-0.5" />
          </>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
              <Database className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Banco de Dados Supabase Conectado
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              O projeto do Supabase está ativado para salvar suas receitas, despesas e cofrinhos na nuvem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sincronização em Nuvem Pronta!
              </p>
              <p className="text-emerald-700 text-[11px] leading-relaxed">
                Todas as alterações feitas por você no aplicativo são gravadas diretamente no seu projeto do Supabase.
              </p>
            </div>

            {/* Script SQL para criação rápida de tabelas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" /> Script SQL das Tabelas (Opcional):
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySql}
                  className="h-7 text-[11px] rounded-lg border-slate-300 font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar SQL'}
                </Button>
              </div>

              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-36 border border-slate-800 leading-normal">
                {sqlScript}
              </pre>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-2 font-medium"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
</dyad-file>

<dyad-write path="src/pages/Index.tsx" description="Atualizando carregamento inicial para sincronizar Cofrinhos e Contas Fixas direto do Supabase.">
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
  fetchPiggyBanksFromSupabase
} from '@/services/supabaseStorage';
import { isSupabaseConfigured } from '@/lib/supabase';
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
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const localExp = getExpenses(userId);
      setExpenses(localExp);

      const piggyData = getPiggyBanks(userId);
      setPiggyBanks(piggyData);

      const budgetData = getBudgets(userId);
      setBudgets(budgetData);

      if (isSupabaseConfigured) {
        const supabaseExpenses = await fetchExpensesFromSupabase(userId);
        if (supabaseExpenses && supabaseExpenses.length > 0) {
          setExpenses(supabaseExpenses);
        }

        const cloudPiggies = await fetchPiggyBanksFromSupabase(userId);
        if (cloudPiggies && cloudPiggies.length > 0) {
          setPiggyBanks(cloudPiggies);
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

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setExpenses([]);
    showSuccess('Você saiu com segurança.');
  };

  const handleAddExpense = async (newExp: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => {
    if (!currentUser) return;

    addExpenseStorage(currentUser.id, newExp);

    if (isSupabaseConfigured) {
      await saveExpenseToSupabase(currentUser.id, newExp);
    }

    loadUserData(currentUser.id);
  };

  const handleEditExpense = async (id: string, updated: { description: string; amount: number; category: CategoryType; type: TransactionType; date: string }) => {
    if (!currentUser) return;
    updateExpenseStorage(id, updated);

    if (isSupabaseConfigured) {
      await updateExpenseInSupabase(id, updated);
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
        
        {/* Barra Superior de Ferramentas */}
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
              onClick={() => setIsRecurringModalOpen(true)}
              className="rounded-xl border-teal-200 bg-teal-50/50 text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5"
            >
              <Repeat className="w-4 h-4 text-teal-600" />
              {t('recurringBills')}
            </Button>

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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Meu Orçamento Inteligente (€) • Seus dados financeiros mantidos seguros na nuvem.
        </div>
      </footer>
    </div>
  );
};

export default Index;