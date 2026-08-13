import React, { useState } from 'react';
import { PiggyBank } from '@/types/finance';
import { 
  getPiggyBanks, 
  addPiggyBank, 
  updatePiggyBankAmount, 
  deletePiggyBank 
} from '@/services/storage';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PiggyBank as PiggyIcon, Plus, ArrowUpRight, ArrowDownLeft, Trash2, CheckCircle2, Wallet, Zap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useLanguage } from '@/context/LanguageContext';

interface CofrinhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  availableBalance?: number;
  onUpdate: () => void;
}

export const CofrinhoModal: React.FC<CofrinhoModalProps> = ({
  isOpen,
  onClose,
  userId,
  availableBalance = 0,
  onUpdate,
}) => {
  const { formatCurrency, currencySymbol, t } = useLanguage();

  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>(() => getPiggyBanks(userId));
  const [isCreating, setIsCreating] = useState(false);

  // Form para novo cofrinho
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Depósito/Resgate ativo
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');

  const refreshData = () => {
    const list = getPiggyBanks(userId);
    setPiggyBanks(list);
    onUpdate();
  };

  const handleCreatePiggy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showError('Informe um nome para o cofrinho.');
      return;
    }
    const targetVal = parseFloat(newTarget.replace(',', '.'));
    if (isNaN(targetVal) || targetVal <= 0) {
      showError('Informe um valor de meta válido.');
      return;
    }

    addPiggyBank(userId, { name: newName.trim(), targetAmount: targetVal });
    showSuccess(`Cofrinho "${newName}" criado com sucesso!`);
    setNewName('');
    setNewTarget('');
    setIsCreating(false);
    refreshData();
  };

  const handleApplyAction = (piggy: PiggyBank) => {
    const num = Math.round((parseFloat(actionAmount.replace(',', '.')) || 0) * 100) / 100;
    if (isNaN(num) || num <= 0) {
      showError('Informe um valor válido maior que zero.');
      return;
    }

    if (actionType === 'deposit') {
      const maxAllowed = Math.round(Math.max(0, availableBalance) * 100) / 100;
      if (maxAllowed <= 0) {
        showError('Você não possui saldo livre neste mês para guardar no cofrinho.');
        return;
      }
      if (Math.round(num * 100) > Math.round(maxAllowed * 100)) {
        showError(
          `O valor digitado (${formatCurrency(num)}) ultrapassa o saldo disponível (${formatCurrency(maxAllowed)}).`
        );
        return;
      }
    } else if (actionType === 'withdraw') {
      const currentPiggyVal = Math.round(piggy.currentAmount * 100) / 100;
      if (Math.round(num * 100) > Math.round(currentPiggyVal * 100)) {
        showError(
          `O valor do resgate (${formatCurrency(num)}) é maior do que o saldo guardado no cofrinho (${formatCurrency(piggy.currentAmount)}).`
        );
        return;
      }
    }

    const change = actionType === 'deposit' ? num : -num;
    updatePiggyBankAmount(userId, piggy.id, change);

    showSuccess(
      actionType === 'deposit'
        ? `+ ${formatCurrency(num)} adicionados ao Cofrinho "${piggy.name}"!`
        : `- ${formatCurrency(num)} resgatados do Cofrinho "${piggy.name}"!`
    );

    setActiveActionId(null);
    setActionAmount('');
    refreshData();
  };

  const handleDelete = (id: string, name: string) => {
    deletePiggyBank(userId, id);
    showSuccess(`Cofrinho "${name}" removido.`);
    refreshData();
  };

  const totalSavedAll = piggyBanks.reduce((acc, p) => acc + p.currentAmount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <PiggyIcon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {t('piggyBanks')}
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-xs mt-0.5">
                {t('piggyBankDesc')}
              </DialogDescription>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
              {t('totalInPiggyBanks')}
            </span>
            <span className="text-xl font-black text-white">
              {formatCurrency(totalSavedAll)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Botão para abrir formulário de criação */}
          {!isCreating ? (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              {t('newPiggyBank')}
            </Button>
          ) : (
            <form onSubmit={handleCreatePiggy} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('newPiggyBank')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">{t('cofrinhoName')}</label>
                  <Input
                    type="text"
                    placeholder="Ex: Reserva, Viagem, Carro..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">{t('targetAmount')}</label>
                  <Input
                    type="text"
                    placeholder="Ex: 2000"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreating(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-semibold"
                >
                  {t('createCofrinho')}
                </Button>
              </div>
            </form>
          )}

          {/* Lista de Cofrinhos */}
          <div className="space-y-4">
            {piggyBanks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <PiggyIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Nenhum cofrinho criado ainda.</p>
              </div>
            ) : (
              piggyBanks.map(piggy => {
                const percent = piggy.targetAmount > 0 
                  ? Math.min(100, Math.round((piggy.currentAmount / piggy.targetAmount) * 100))
                  : 0;

                const isActionOpen = activeActionId === piggy.id;

                return (
                  <div key={piggy.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                          <PiggyIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{piggy.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {t('targetAmount')}: {formatCurrency(piggy.targetAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveActionId(piggy.id);
                            setActionType('deposit');
                            setActionAmount('');
                          }}
                          className="h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold rounded-lg flex items-center gap-1"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          {t('deposit')}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveActionId(piggy.id);
                            setActionType('withdraw');
                            setActionAmount('');
                          }}
                          className="h-8 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold rounded-lg flex items-center gap-1"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                          {t('withdraw')}
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(piggy.id, piggy.name)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">
                          {t('savedAmount')}: <strong className="text-slate-900">{formatCurrency(piggy.currentAmount)}</strong>
                        </span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          {percent >= 100 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Formulário de Depósito ou Resgate Inline */}
                    {isActionOpen && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyAction(piggy);
                        }} 
                        className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col space-y-2 mt-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            {actionType === 'deposit' ? `Guardar (${currencySymbol}):` : `Resgatar (${currencySymbol}):`}
                          </span>

                          {actionType === 'deposit' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                              <Wallet className="w-3 h-3 text-emerald-600" />
                              Saldo livre: {formatCurrency(Math.max(0, availableBalance))}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-white border border-blue-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                              Guardado no cofrinho: {formatCurrency(piggy.currentAmount)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              placeholder="0,00"
                              value={actionAmount}
                              onChange={e => setActionAmount(e.target.value)}
                              className="h-8 text-xs font-bold bg-white rounded-lg border-emerald-300 focus:ring-emerald-500 pr-12"
                              autoFocus
                            />
                            {actionType === 'deposit' && availableBalance > 0 && (
                              <button
                                type="button"
                                onClick={() => setActionAmount(String(availableBalance))}
                                className="absolute right-1 top-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-2 py-0.5 rounded flex items-center gap-0.5"
                                title="Guardar todo o saldo disponível"
                              >
                                <Zap className="w-3 h-3" /> Max
                              </button>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveActionId(null)}
                            className="h-8 text-xs rounded-lg"
                          >
                            {t('cancel')}
                          </Button>

                          <Button
                            type="submit"
                            size="sm"
                            className="h-8 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-sm"
                          >
                            Confirmar
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};