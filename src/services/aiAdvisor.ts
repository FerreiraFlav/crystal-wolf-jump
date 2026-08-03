import { Expense, AIAdvice } from '@/types/finance';
import { CATEGORIES } from './storage';

export const analyzeExpensesWithAI = (expenses: Expense[]): AIAdvice => {
  if (expenses.length === 0) {
    return {
      diagnosis: "Você ainda não possui gastos cadastrados no mês atual para que eu possa gerar um diagnóstico completo.",
      healthScore: 100,
      topCategoryWarning: "Nenhuma despesa registrada.",
      savingsPotential: 0,
      recommendations: [
        "Comece adicionando suas principais despesas do mês, como aluguel, supermercado e contas básicas.",
        "Mantenha a consistência anotando gastos diários para um raio-X financeiro fiel."
      ],
      actionPlan: [
        "Cadastre ao menos 5 despesas recentes.",
        "Retorne aqui para receber uma consultoria detalhada!"
      ]
    };
  }

  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  // Sort categories by highest spend
  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalSpent) * 100
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = sortedCategories[0];
  const secondCategory = sortedCategories[1] || null;

  // Calculate Health Score based on distribution & total
  let healthScore = 85;
  if (topCategory.percentage > 45) healthScore -= 20;
  if (topCategory.percentage > 60) healthScore -= 15;
  if (expenses.length < 3) healthScore -= 10;
  healthScore = Math.max(35, Math.min(98, healthScore));

  // Estimated savings potential (approx 12% to 22% of variable expenses)
  const flexibleSpending = sortedCategories
    .filter(c => ['Lazer & Entretenimento', 'Compras', 'Alimentação', 'Outros'].includes(c.category))
    .reduce((acc, c) => acc + c.amount, 0);

  const savingsPotential = flexibleSpending > 0 ? flexibleSpending * 0.20 : totalSpent * 0.10;

  // Generate personalized Diagnosis
  let diagnosis = `Analisando seu histórico do mês atual com um total de **R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** distribuído em **${expenses.length} lançamentos**, identifiquei padrões importantes de consumo. `;

  if (topCategory.percentage > 40) {
    diagnosis += `A categoria **${topCategory.category}** consome uma fatia expressiva de **${topCategory.percentage.toFixed(1)}%** de todo o seu orçamento mensal. Ajustar pequenos excessos nessa área trará um alívio financeiro imediato.`;
  } else {
    diagnosis += `Sua distribuição de gastos está relativamente equilibrada, com **${topCategory.category}** representando **${topCategory.percentage.toFixed(1)}%** e **${secondCategory ? secondCategory.category : 'outras áreas'}** representando **${secondCategory ? secondCategory.percentage.toFixed(1) + '%' : ''}**.`;
  }

  // Recommendations
  const recommendations: string[] = [];

  if (categoryTotals['Lazer & Entretenimento'] || categoryTotals['Compras']) {
    const leisureTotal = (categoryTotals['Lazer & Entretenimento'] || 0) + (categoryTotals['Compras'] || 0);
    recommendations.push(
      `🎯 **Gastos Discricionários**: Você gastou R$ ${leisureTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em Lazer e Compras. Definir um teto semanal de gastos não essenciais pode economizar até R$ ${(leisureTotal * 0.25).toFixed(2)} por mês.`
    );
  }

  if (categoryTotals['Alimentação']) {
    recommendations.push(
      `🛒 **Alimentação e Delivery**: Supermercado e refeições externas representam R$ ${categoryTotals['Alimentação'].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Planejar o cardápio da semana reduz desperdícios e compras por impulso.`
    );
  }

  if (categoryTotals['Contas & Serviços']) {
    recommendations.push(
      `💡 **Otimização de Faturas**: Revise assinaturas mensais e planos de telefonia/internet para verificar serviços obsoletos ou tarifas cobradas indevidamente.`
    );
  }

  if (recommendations.length < 3) {
    recommendations.push(
      `💰 **Reserva de Emergência**: Monte a regra dos 50-30-20 (50% Necessidades, 30% Desejos e 20% Poupança/Investimentos) para acelerar seus objetivos financeiros.`
    );
  }

  // Action Plan
  const actionPlan: string[] = [
    `Estipular um limite máximo de **R$ ${(topCategory.amount * 0.85).toFixed(2)}** para a categoria **${topCategory.category}** no próximo mês.`,
    `Separar **R$ ${savingsPotential.toFixed(2)}** no início do mês diretamente para uma conta de investimento ou reserva.`,
    `Utilizar o "Meu Orçamento Inteligente" semanalmente para reavaliar os lançamentos e evitar surpresas no final do mês.`
  ];

  return {
    diagnosis,
    healthScore,
    topCategoryWarning: `Maior concentrador de gastos: ${topCategory.category} (${topCategory.percentage.toFixed(1)}%)`,
    savingsPotential,
    recommendations,
    actionPlan,
  };
};