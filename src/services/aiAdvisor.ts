import { Expense, AIAdvice, CategoryBudget } from '@/types/finance';

export const analyzeExpensesWithAI = (expenses: Expense[], budgets: CategoryBudget[] = []): AIAdvice => {
  const incomeItems = expenses.filter(e => e.type === 'income');
  const expenseItems = expenses.filter(e => e.type === 'expense');

  const totalIncome = incomeItems.reduce((acc, exp) => acc + exp.amount, 0);
  const totalSpent = expenseItems.reduce((acc, exp) => acc + exp.amount, 0);
  const netBalance = totalIncome - totalSpent;

  if (expenseItems.length === 0 && incomeItems.length === 0) {
    return {
      diagnosis: "Você ainda não possui lançamentos (receitas ou despesas) salvos neste mês para gerar um relatório completo.",
      healthScore: 100,
      topCategoryWarning: "Nenhuma transação registrada.",
      savingsPotential: 0,
      savingsRate: 0,
      recommendations: [
        "Comece registrando sua principal fonte de renda e suas contas fixas do mês.",
        "Mantenha a rotina de anotações para ter previsibilidade de fluxo de caixa."
      ],
      actionPlan: [
        "Adicione ao menos 1 receita e 3 despesas.",
        "Execute novamente a análise da Inteligência Financeira."
      ]
    };
  }

  // Calculate Savings Rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

  // Group Expenses by Category
  const categoryTotals: Record<string, number> = {};
  expenseItems.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const sortedExpenseCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentageOfSpent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = sortedExpenseCategories[0] || { category: 'Geral', amount: 0, percentageOfSpent: 0 };

  // Calculate Health Score
  let healthScore = 80;
  if (savingsRate > 20) healthScore += 15;
  else if (savingsRate > 10) healthScore += 5;
  else if (savingsRate < 0) healthScore -= 30; // Deficit

  if (topCategory.percentageOfSpent > 45) healthScore -= 10;

  // Check budget limit breaches
  let breachCount = 0;
  budgets.forEach(b => {
    const spentInCat = categoryTotals[b.category] || 0;
    if (b.limitAmount > 0 && spentInCat > b.limitAmount) {
      breachCount++;
    }
  });
  healthScore -= breachCount * 5;

  healthScore = Math.max(20, Math.min(100, Math.round(healthScore)));

  // Estimated Savings Potential
  const flexibleSpending = sortedExpenseCategories
    .filter(c => ['Lazer & Entretenimento', 'Compras', 'Alimentação', 'Outros'].includes(c.category))
    .reduce((acc, c) => acc + c.amount, 0);

  const savingsPotential = flexibleSpending > 0 ? flexibleSpending * 0.18 : (totalSpent > 0 ? totalSpent * 0.08 : 0);

  // Diagnosis Narrative
  let diagnosis = `Neste mês, você acumulou **R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** em receitas e realizou **R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** em despesas. `;

  if (netBalance >= 0) {
    diagnosis += `Seu saldo líquido está positivo em **R$ ${netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, resultando em uma taxa de poupança de **${savingsRate.toFixed(1)}%**. `;
  } else {
    diagnosis += `⚠️ Atualmente você está em déficit de **R$ ${Math.abs(netBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Seus gastos superaram seus ganhos. `;
  }

  if (topCategory.amount > 0) {
    diagnosis += `A maior parte dos seus custos está concentrada em **${topCategory.category}**, consumindo **${topCategory.percentageOfSpent.toFixed(1)}%** das suas despesas totais.`;
  }

  // Recommendations
  const recommendations: string[] = [];

  if (netBalance < 0) {
    recommendations.push(
      `🚨 **Atenção ao Saldo Negativo**: Reduza imediatamente gastos não essenciais nesta semana para equilibrar as contas do mês.`
    );
  }

  if (categoryTotals['Lazer & Entretenimento'] || categoryTotals['Compras']) {
    const discretionary = (categoryTotals['Lazer & Entretenimento'] || 0) + (categoryTotals['Compras'] || 0);
    recommendations.push(
      `🛍️ **Gastos Flexíveis**: Você destinou R$ ${discretionary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para compras e entretenimento. Reduzir 20% nessa frente economiza R$ ${(discretionary * 0.20).toFixed(2)}.`
    );
  }

  if (categoryTotals['Alimentação']) {
    recommendations.push(
      `🍽️ **Alimentação**: Otimize suas idas ao mercado com listas planejadas para evitar itens superfluos.`
    );
  }

  if (breachCount > 0) {
    recommendations.push(
      `🎯 **Metas Estouradas**: Você ultrapassou o teto definido em ${breachCount} categoria(s). Ajuste os limites ou realoque verba.`
    );
  }

  if (recommendations.length < 3) {
    recommendations.push(
      `🌱 **Investimento Automático**: Ao receber sua renda, separe pelo menos 10% no primeiro dia útil antes de realizar despesas.`
    );
  }

  // Action Plan
  const actionPlan: string[] = [
    `Manter um limite máximo de **R$ ${(topCategory.amount > 0 ? topCategory.amount * 0.85 : 500).toFixed(2)}** na categoria **${topCategory.category}**.`,
    `Garantir uma reserva mensal de pelo menos **R$ ${(totalIncome > 0 ? totalIncome * 0.15 : savingsPotential).toFixed(2)}**.`,
    `Conferir o indicador de orçamentos por categoria semanalmente.`
  ];

  return {
    diagnosis,
    healthScore,
    topCategoryWarning: topCategory.amount > 0 ? `${topCategory.category} (${topCategory.percentageOfSpent.toFixed(1)}% dos gastos)` : 'Nenhum gasto registrado',
    savingsPotential,
    savingsRate,
    recommendations,
    actionPlan,
  };
};