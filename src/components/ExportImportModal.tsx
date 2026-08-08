import React, { useState } from 'react';
import { Expense } from '@/types/finance';
import { importExpenses } from '@/services/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, CheckCircle2 } from 'lucide-react';
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

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      showError('Nenhum dado para exportar.');
      return;
    }

    const headers = ['ID', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Data'];
    const rows = expenses.map(e => [
      e.id,
      e.type === 'income' ? 'Receita' : 'Despesa',
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      e.date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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

  const handleImportJSON = () => {
    try {
      if (!jsonInput.trim()) {
        showError('Por favor, cole o conteúdo JSON antes de importar.');
        return;
      }

      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        showError('Formato inválido. O JSON deve ser uma lista de lançamentos.');
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
    } catch (err) {
      showError('Erro ao importar JSON. Verifique o formato inserido.');
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
                Faça backup das suas transações ou exporte planilhas CSV.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Restaurar Backup (Importar JSON)
            </h4>
            <textarea
              rows={4}
              placeholder="Cole aqui o conteúdo do arquivo JSON de backup..."
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              onClick={handleImportJSON}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Lançamentos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};