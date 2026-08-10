import React, { useState } from 'react';
import { User } from '@/types/finance';
import { registerUserAsync, loginUserAsync } from '@/services/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password || (isRegister && !name)) {
        showError('Por favor, preencha todos os campos.');
        setIsLoading(false);
        return;
      }

      if (password.length < 4) {
        showError('A senha deve ter pelo menos 4 caracteres.');
        setIsLoading(false);
        return;
      }

      if (isRegister) {
        const newUser = await registerUserAsync(name.trim(), email.trim(), password);
        showSuccess(`Bem-vindo, ${newUser.name}! Sua conta foi criada e sincronizada com sucesso.`);
        onLoginSuccess(newUser);
      } else {
        const user = await loginUserAsync(email.trim(), password);
        showSuccess(`Bem-vindo de volta, ${user.name}!`);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      showError(err.message || 'Ocorreu um erro ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('flavio@email.com');
    setPassword('123456');
    try {
      const user = await loginUserAsync('flavio@email.com', '123456');
      showSuccess('Entrou na conta de demonstração!');
      onLoginSuccess(user);
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho da Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 text-emerald-400 shadow-xl shadow-emerald-950/50">
            <Wallet className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Meu Orçamento <span className="text-emerald-400">Inteligente</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            Controle total dos seus gastos sincronizado na nuvem para todos os seus dispositivos
          </p>
        </div>

        {/* Card do Formulário */}
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl text-slate-100 shadow-2xl shadow-slate-950/80 rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center text-white">
              {isRegister ? 'Criar nova conta' : 'Entrar na sua conta'}
            </CardTitle>
            <CardDescription className="text-center text-slate-400 text-xs">
              {isRegister
                ? 'Preencha seus dados para acessar de qualquer dispositivo'
                : 'Insira seu e-mail e senha cadastrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-slate-300 font-medium">Nome completo</Label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300 font-medium">E-mail</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-slate-300 font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  'Carregando...'
                ) : (
                  <>
                    <span>{isRegister ? 'Cadastrar e Acessar' : 'Entrar no Orçamento'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Entrar como Conta de Teste</span>
              </Button>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors underline font-medium mt-1"
              >
                {isRegister
                  ? 'Já possui uma conta? Faça login aqui'
                  : 'Ainda não tem conta? Clique aqui para cadastrar'}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sincronização ativada: Acesse sua conta em qualquer dispositivo.</span>
        </div>
      </div>
    </div>
  );
};