import React, { useState, useRef } from 'react';
import { Expense } from '@/types/finance';
import { importExpenses } from '@/services/storage';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, FileCode, HelpCircle, FileCheck } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useLanguage } from '@/context/LanguageContext';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  expenses: Expense[];
  onRefreshData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  userId,
  expenses,
  onRefreshData,
}) => {
  const { formatCurrency, currencySymbol } = useLanguage();
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPDF = () => {
    if (expenses.length === 0) {
      showError('Nenhum dado para gerar o PDF.');
      return;
    }

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalSpent = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const netBalance = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showError('Por favor, permita pop-ups no navegador para gerar o relatório PDF.');
      return;
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { background: #fff; color: #1e293b; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 25px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; }
          .brand-title span { color: #10b981; }
          .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
          
          .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
          .metric-title { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
          .metric-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 6px; }
          .metric-value.income { color: #059669; }
          .metric-value.expense { color: #dc2626; }
          .metric-value.balance { color: ${netBalance >= 0 ? '#059669' : '#dc2626'}; }

          .section-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
          tr:nth-child(even) { background-color: #f8fafc; }

          .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .badge-income { background: #dcfce7; color: #15803d; }
          .badge-expense { background: #fee2e2; color: #b91c1c; }

          .amount { font-weight: 700; text-align: right; }
          .amount-income { color: #059669; }
          .amount-expense { color: #0f172a; }

          .footer { margin-top: 40px; padding-top: 15px; border-t: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }

          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="brand-title">Meu Orçamento <span>Inteligente</span></div>
          </div>
          <div class="meta">
            <strong>Relatório Financeiro Pessoal (${currencySymbol})</strong><br/>
            Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br/>
            Total de Lançamentos: ${expenses.length}
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-title">Receitas</div>
            <div class="metric-value income">${formatCurrency(totalIncome)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Despesas</div>
            <div class="metric-value expense">${formatCurrency(totalSpent)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Saldo Líquido</div>
            <div class="metric-value balance">${formatCurrency(netBalance)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Poupança</div>
            <div class="metric-value">${savingsRate.toFixed(1)}%</div>
          </div>
        </div>

        <div class="section-title">Histórico de Lançamentos</div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th style="text-align: right;">Valor (${currencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            ${sortedExpenses.map(item => `
              <tr>
                <td style="white-space: nowrap; font-weight: 500;">${formatDate(item.date)}</td>
                <td style="font-weight: 600; color: #0f172a;">${item.description}</td>
                <td>${item.category}</td>
                <td>
                  <span class="badge ${item.type === 'income' ? 'badge-income' : 'badge-expense'}">
                    ${item.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td class="amount ${item.type === 'income' ? 'amount-income' : 'amount-expense'}">
                  ${item.type === 'income' ? '+ ' : '- '}${formatCurrency(item.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Meu Orçamento Inteligente (${currencySymbol}) • Documento gerado para controle e planejamento financeiro pessoal.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showSuccess('Relatório visual em PDF preparado para impressão!');
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      showError('Nenhum dado para exportar.');
      return;
    }

    const headers = ['ID', 'Tipo', 'Descrição', `Valor (${currencySymbol})`, 'Categoria', 'Data'];
    const rows = expenses.map(e => [
      e.id,
      e.type === 'income' ? 'Receita' : 'Despesa',
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      e.date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meu_orcamento_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Relatório CSV baixado com sucesso!');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meu_orcamento_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showSuccess('Backup JSON baixado com sucesso!');
  };

  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        description: "Supermercado Tesco",
        amount: 120.50,
        category: "Alimentação",
        type: "expense",
        date: new Date().toISOString().split('T')[0]
      },
      {
        description: "Salário Semanal",
        amount: 650.00,
        category: "Salário",
        type: "income",
        date: new Date().toISOString().split('T')[0]
      }
    ];

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sampleData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'meu_orcamento_modelo_exemplo.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showSuccess('Modelo JSON baixado com sucesso!');
  };

  const processImportList = (parsed: any) => {
    if (!Array.isArray(parsed)) {
      showError('Formato inválido. O arquivo JSON deve ser uma lista de lançamentos [ { ... } ].');
      return;
    }

    const validList = parsed.map((item: any) => ({
      description: String(item.description || 'Sem descrição'),
      amount: Number(item.amount) || 0,
      category: item.category || 'Outros',
      type: item.type === 'income' ? 'income' : ('expense' as const),
      date: item.date || new Date().toISOString().split('T')[0],
    }));

    importExpenses(userId, validList);
    showSuccess(`${validList.length} lançamentos importados com sucesso!`);
    setJsonInput('');
    onRefreshData();
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        processImportList(parsed);
      } catch (err) {
        showError('Erro ao ler o arquivo JSON. Certifique-se de que é um JSON válido.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleImportText = () => {
    try {
      if (!jsonInput.trim()) {
        showError('Por favor, cole o conteúdo JSON ou faça o upload do arquivo.');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      processImportList(parsed);
    } catch (err) {
      showError('Sintaxe JSON inválida. Verifique o texto colado.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Exportar e Importar Dados
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                Gere relatórios visuais em PDF, planilhas CSV ou faça backup em JSON.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Opções de Exportação */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Exportar Relatório / Backup
            </h4>

            {/* Destaque Principal: Botão PDF Executivo */}
            <Button
              onClick={handleExportPDF}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs py-5 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <FileCheck className="w-4 h-4" />
              <span>Gerar Relatório PDF Profissional</span>
            </Button>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs py-3.5"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                Planilha CSV
              </Button>

              <Button
                variant="outline"
                onClick={handleExportJSON}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs py-3.5"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Backup JSON
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Opções de Importação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Importar Lançamentos (JSON)
              </h4>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
              >
                <FileCode className="w-3.5 h-3.5" />
                Baixar Arquivo Modelo
              </button>
            </div>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-dashed border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs py-4 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Escolher Arquivo .JSON do Computador</span>
            </Button>

            <div className="text-center text-[10px] text-slate-400 font-semibold uppercase">
              — Ou cole o conteúdo abaixo —
            </div>

            <textarea
              rows={2}
              placeholder='[ { "description": "Lidl", "amount": 22.11, "category": "Alimentação", "type": "expense", "date": "2026-08-07" } ]'
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <Button
              onClick={handleImportText}
              disabled={!jsonInput.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Texto Colado
            </Button>
          </div>

          {/* Guia de Ajuda */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              Dica para salvar o PDF:
            </div>
            <p>Ao clicar no botão verde de PDF, a janela de impressão abrirá. Selecione a opção <strong>{"\"Salvar como PDF\""}</strong> no seu navegador para salvar o arquivo no computador.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};