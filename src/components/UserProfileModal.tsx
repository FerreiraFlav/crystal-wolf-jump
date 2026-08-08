import React from 'react';
import { User } from '@/types/finance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Mail, ShieldCheck, LogOut, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/50">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {user.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            {user.email}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('accountDetails')}
            </h4>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  Nome:
                </span>
                <span className="font-bold text-slate-800">{user.name}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  E-mail:
                </span>
                <span className="font-bold text-slate-800">{user.email}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Status da Conta:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Ativa
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full rounded-xl text-xs py-2.5 font-medium"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};