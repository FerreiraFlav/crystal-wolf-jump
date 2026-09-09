import React, { useState, useRef } from 'react';
import { Expense, CategoryType, TransactionType } from '@/types/finance';
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

const escapeHtml = (unsafe: unknown): string => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const sanitizeCsvField = (value: unknown): string => {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Prevent CSV formula injection (=, +, -, @, tab, cr)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
};

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  userId,
  expenses,
  onRefreshData,
}) => {
  const { formatCurrency, currencySymbol, t, language, getCategoryLabel } = useLanguage();
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
        <meta charset="utf-8" />
        <title>Meu Orçamento Inteligente - Relatório Financeiro</title>
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          body { padding: 30px; color: #1e293b; background: #fff; line-height: 1.5; font-size: 13px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .brand-title span { color: #059669; }
          .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
          
          .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .metric-title { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
          .metric-value { font-size: 18px; font-weight: 800; color: #0f172a; }
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

          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }

          @page { size: auto; margin: 0mm; }
          @media print { body { padding: 15mm 20mm !important; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="brand-title">Meu Orçamento <span>Inteligente</span></div>
          </div>
          <div class="meta">
            <strong>Relatório Financeiro Pessoal (${escapeHtml(currencySymbol)})</strong><br/>
            Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br/>
            Total de Lançamentos: ${expenses.length}
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-title">Receitas</div>
            <div class="metric-value income">${escapeHtml(formatCurrency(totalIncome))}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Despesas</div>
            <div class="metric-value expense">${escapeHtml(formatCurrency(totalSpent))}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Saldo Líquido</div>
            <div class="metric-value balance">${escapeHtml(formatCurrency(netBalance))}</div>
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
              <th style="text-align: right;">Valor (${escapeHtml(currencySymbol)})</th>
            </tr>
          </thead>
          <tbody>
            ${sortedExpenses.map(item => `
              <tr>
                <td style="white-space: nowrap; font-weight: 500;">${escapeHtml(formatDate(item.date))}</td>
                <td style="font-weight: 600; color: #0f172a;">${escapeHtml(item.description)}</td>
                <td>${escapeHtml(item.category)}</td>
                <td>
                  <span class="badge ${item.type === 'income' ? 'badge-income' : 'badge-expense'}">
                    ${item.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td class="amount ${item.type === 'income' ? 'amount-income' : 'amount-expense'}">
                  ${item.type === 'income' ? '+ ' : '- '}${escapeHtml(formatCurrency(item.amount))}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Meu Orçamento Inteligente (${escapeHtml(currencySymbol)}) • Documento gerado para controle e planejamento financeiro pessoal.
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

    const headers = ['ID', 'Tipo', 'Descrição', `Valor (${escapeHtml(currencySymbol)})`, 'Categoria', 'Data'];
    const rows = expenses.map(e => [
      sanitizeCsvField(e.id),
      sanitizeCsvField(e.type === 'income' ? 'Receita' : 'Despesa'),
      sanitizeCsvField(e.description),
      Number.isFinite(Number(e.amount)) ? Number(e.amount) : 0,
      sanitizeCsvField(e.category),
      sanitizeCsvField(e.date)
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

  const processImportList = (parsed: unknown) => {
    if (!Array.isArray(parsed)) {
      showError('Formato inválido. O arquivo JSON deve ser uma lista de lançamentos [ { ... } ].');
      return;
    }

    if (parsed.length > 5000) {
      showError('O arquivo excede o limite máximo permitido de 5000 lançamentos por importação.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const validList = parsed.map((rawItem: unknown) => {
      const item = (rawItem && typeof rawItem === 'object' ? rawItem : {}) as Record<string, unknown>;
      const rawDesc = typeof item.description === 'string' ? item.description.trim() : '';
      const cleanDesc = rawDesc.slice(0, 255) || 'Sem descrição';

      const numAmount = typeof item.amount === 'number' && Number.isFinite(item.amount)
        ? Math.abs(item.amount)
        : Math.abs(parseFloat(String(item.amount || '0'))) || 0;
      const cleanAmount = Math.min(numAmount, 100_000_000);

      const rawCat = typeof item.category === 'string' ? item.category.trim() : '';
      const cleanCat: CategoryType = (rawCat.slice(0, 100) || 'Outros') as CategoryType;

      const cleanType: TransactionType = item.type === 'income' ? 'income' : 'expense';

      const rawDate = typeof item.date === 'string' ? item.date.trim() : '';
      const cleanDate = dateRegex.test(rawDate) ? rawDate : new Date().toISOString().split('T')[0];

      return {
        description: cleanDesc,
        amount: cleanAmount,
        category: cleanCat,
        type: cleanType,
        date: cleanDate,
      };
    });

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
      <DialogContent className="w-[calc(100%-0.5rem)] sm:w-[94vw] max-w-6xl h-[92dvh] sm:h-[86vh] max-h-[96dvh] sm:max-h-[88vh] flex flex-col gap-0 mx-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-0 overflow-hidden shadow-2xl transition-colors">
        <div className="bg-slate-900 p-6 pr-14 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                {t('exportImportData')}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs sm:text-sm mt-1">
                {t('exportImportDesc')}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1: Opções de Exportação */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                {t('exportTitle')}
              </h4>

              {/* Destaque Principal: Botão PDF Executivo */}
              <Button
                onClick={handleExportPDF}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-base py-5 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('generatePdfReport')}</span>
              </Button>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-xs sm:text-sm py-4"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  {t('csvSpreadsheet')}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExportJSON}
                  className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-xs sm:text-sm py-4"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  {t('jsonBackup')}
                </Button>
              </div>

              {/* Guia de Ajuda */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  {t('pdfTipTitle')}
                </div>
                <p className="leading-relaxed">{t('pdfTipDesc')}</p>
              </div>
            </div>

            {/* Coluna 2: Opções de Importação */}
            <div className="space-y-4 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  {t('importTitle')}
                </h4>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 underline cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t('downloadTemplate')}
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
                className="w-full rounded-xl border-dashed border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm py-4 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{t('chooseJsonFile')}</span>
              </Button>

              <div className="text-center text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">
                {t('orPasteBelow')}
              </div>

              <textarea
                rows={3}
                placeholder='[ { "description": "Lidl", "amount": 22.11, "category": "Alimentação", "type": "expense", "date": "2026-08-07" } ]'
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs sm:text-sm font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />

              <Button
                onClick={handleImportText}
                disabled={!jsonInput.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm py-3 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t('importPastedText')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};