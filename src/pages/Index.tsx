import React, { useState, useEffect } from 'react';
import { User, Expense, AIAdvice } from '@/types/finance';
import { 
  getCurrentUser, 
  logoutUser, 
  getExpenses, 
  addExpense as addExpenseStorage, 
  deleteExpense as deleteExpenseStorage 
} from '@/services/storage';
import { analyzeExpensesWithAI } from '@/services/aiAdvisor';
import { AuthModal } from '@/components/AuthModal';
import { Navbar } from '@/components/Navbar';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { ExpenseList } from '@/components/ExpenseList';
import { AIAdvisorModal } from '@/components/AIAdvisorModal';
import { Button } from '@/components/ui/button';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mês Atual em português
  const currentMonthLabel = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadExpenses(user.id);
    }
  }, []);

  const loadExpenses = (userId: string) => {
    const data = getExpenses(userId);
    setExpenses(data);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadExpenses(user.id);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setExpenses([]);
    showSuccess('Você saiu com segurança.');
  };

  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    addExpenseStorage(currentUser.id, newExp);
    loadExpenses(currentUser.id);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseStorage(id);
    if (currentUser) {
      loadExpenses(currentUser.id);
    }
    showSuccess('Gasto removido com sucesso.');
  };

  // Botão em Destaque: Analisar Meus Gastos com IA
  const handleRunAIAnalysis = () => {
    setIsAnalyzing(true);

    // Simulação com tempo de resposta natural para dar percepção de processamento da IA
    setTimeout(() => {
      // Filtrar apenas os gastos do mês atual
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentYearMonth));

      const advice = analyzeExpensesWithAI(currentMonthExpenses);
      setAiAdvice(advice);
      setIsAnalyzing(false);
      setIsAIModalOpen(true);
    }, 800);
  };

  // Se não estiver logado, exibe tela de login/cadastro
  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  // Filtrar despesas do mês atual para o gráfico
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentYearMonth));

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Navegação Superior */}
      <Navbar user={currentUser} onLogout={handleLogout} />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner do Botão de IA "Analisar Meus Gastos com IA" */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
          <div className="space-y-2 text-center md:text-left z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Inteligência Financeira Ativa
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Quer saber onde economizar este mês?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Nossa IA analisa seus lançamentos recentes para detectar gargalos de consumo, otimizar orçamentos e dar conselhos práticos como um especialista.
            </p>
          </div>

          {/* O BOTÃO EM DESTAQUE REQUISITADO */}
          <div className="z-10 shrink-0 w-full md:w-auto">
            <Button
              size="lg"
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-3 border border-emerald-300/40"
            >
              <BrainCircuit className="w-6 h-6 text-slate-950 animate-bounce" />
              <span>{isAnalyzing ? 'Analisando gastos...' : 'Analisar Meus Gastos com IA'}</span>
            </Button>
          </div>

          {/* Efeitos visuais de fundo */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Cards de Resumo */}
        <SummaryCards expenses={currentMonthExpenses} />

        {/* Seção Principal: Formulário + Gráfico de Pizza Lado a Lado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Formulário de Adição (5 Colunas no Desktop) */}
          <div className="lg:col-span-5">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          {/* Gráfico de Pizza Grande (7 Colunas no Desktop) */}
          <div className="lg:col-span-7">
            <ExpensePieChart 
              expenses={currentMonthExpenses} 
              currentMonthLabel={currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1)} 
            />
          </div>
        </div>

        {/* Tabela/Lista dos Últimos Gastos */}
        <div>
          <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
        </div>
      </main>

      {/* Modal do Consultor IA */}
      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        advice={aiAdvice}
      />

      {/* Rodapé simples */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Meu Orçamento Inteligente • Seus dados financeiros mantidos 100% locais e seguros.
        </div>
      </footer>
    </div>
  );
};

export default Index;