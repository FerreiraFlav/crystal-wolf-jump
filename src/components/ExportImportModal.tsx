import React, { useState, useRef } from 'react';
import { Expense } from '@/types/finance';
import { importExpenses } from '@/services/storage';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, FileCode, HelpCircle, CheckCircle2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

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
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      showError('Nenhum dado para exportar.');
      return;
    }

    const headers = ['ID', 'Tipo', 'Descrição', 'Valor (€)', 'Categoria', 'Data'];
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
        description: "Supermercado",
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
    // Reset file input
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
                Faça backup das suas transações ou restaure backups em JSON.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Opções de Exportação */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Baixar Dados (Exportar)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-xs py-5"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                Planilha CSV
              </Button>

              <Button
                variant="outline"
                onClick={handleExportJSON}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-xs py-5"
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

            {/* Input para Upload de Arquivo Directo */}
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
              className="w-full rounded-xl border-dashed border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs py-5 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Escolher Arquivo .JSON do Computador</span>
            </Button>

            <div className="text-center text-[10px] text-slate-400 font-semibold uppercase">
              — Ou cole o conteúdo abaixo —
            </div>

            <textarea
              rows={3}
              placeholder="[ { &quot;description&quot;: &quot;Supermercado&quot;, &quot;amount&quot;: 120.50, &quot;category&quot;: &quot;Alimentação&quot;, &quot;type&quot;: &quot;expense&quot;, &quot;date&quot;: &quot;2025-05-10&quot; } ]"
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <Button
              onClick={handleImportText}
              disabled={!jsonInput.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Texto Colado
            </Button>
          </div>

          {/* Guia do Formato */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              Como estruturar seu JSON manualmente?
            </div>
            <p>Campos obrigatórios em cada objeto da lista:</p>
            <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-slate-700">
              <li><strong>description</strong>: Ex: "Aluguel" (texto)</li>
              <li><strong>amount</strong>: Ex: 750 (número)</li>
              <li><strong>category</strong>: Ex: "Moradia" / "Alimentação" / "Salário"</li>
              <li><strong>type</strong>: "expense" (despesa) ou "income" (receita)</li>
              <li><strong>date</strong>: "YYYY-MM-DD" (Ex: "2025-05-01")</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};