import React, { useState } from 'react';
import { checkIsConfigured, getStoredSupabaseConfig, saveCustomSupabaseConfig } from '@/lib/supabase';
import { testSupabaseConnection } from '@/services/supabaseStorage';
import { Database, Wifi, Info, CheckCircle2, Copy, Check, Terminal, AlertTriangle, RefreshCw, Key, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';

export const SupabaseBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isConfigured = checkIsConfigured();
  const initialConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(initialConfig.anonKey || '');

  const sqlScript = `-- SCRIPT DE TABELAS DO SUPABASE (Execute no SQL Editor)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piggy_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL,
  current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  day_of_month INT,
  day_of_week INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DESATIVAR RLS PARA ACESSO COMPLETO
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE piggy_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions DISABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    showSuccess('Script SQL copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveKeys = () => {
    saveCustomSupabaseConfig(supabaseUrl, supabaseKey);
    showSuccess('Credenciais salvas! Atualizando a página para conectar...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          handleTestConnection();
        }}
        className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded-full font-semibold shadow-xs cursor-pointer transition-all ${
          isConfigured 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100' 
            : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
        }`}
        title="Clique para testar o status e configurar chaves do banco"
      >
        {isConfigured ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Sincronizado (Nuvem)</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Modo Local (Off-line)</span>
            <Info className="w-3 h-3 text-amber-600 ml-0.5" />
          </>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
              <Database className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Conexão com Supabase
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Verifique onde seus dados estão salvos e configure as credenciais.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
            {/* Status da Conexão */}
            <div className={`p-3 border rounded-xl space-y-1.5 ${
              testResult?.success ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {testResult?.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  {testResult?.success ? 'Supabase Conectado' : 'Supabase Desconectado / Local'}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="h-6 text-[10px] font-bold text-slate-600 hover:bg-slate-200 rounded-md"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isTesting ? 'animate-spin' : ''}`} />
                  Testar
                </Button>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-700">
                {isTesting ? 'Testando conexão...' : testResult?.message}
              </p>
            </div>

            {/* Onde ver no Supabase */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-[11px] text-blue-900">
              <span className="font-bold block">💡 Onde ver seus usuários no Supabase:</span>
              <p>
                Acesse o painel do Supabase e clique em <strong>Table Editor > users</strong> (e não na aba "Authentication").
              </p>
            </div>

            {/* Configuração rápida de Chaves */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs">
                Configurar Credenciais do Supabase:
              </span>

              <div className="space-y-1">
                <Label className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-slate-400" /> Project URL
                </Label>
                <Input
                  type="text"
                  placeholder="https://seu-projeto.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-400" /> Project API Key (Anon / Public)
                </Label>
                <Input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-white"
                />
              </div>

              <Button
                onClick={handleSaveKeys}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs rounded-lg shadow-sm mt-1"
              >
                Salvar Credenciais e Conectar
              </Button>
            </div>

            {/* Script SQL */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" /> Script SQL para o Supabase:
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySql}
                  className="h-7 text-[11px] rounded-lg border-slate-300 font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar SQL'}
                </Button>
              </div>

              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-28 border border-slate-800 leading-normal">
                {sqlScript}
              </pre>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-2 font-medium"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};