import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Database, RefreshCw, Wifi } from 'lucide-react';
import { checkIsConfigured, getStoredSupabaseConfig, saveCustomSupabaseConfig } from '@/lib/supabase';
import { testSupabaseConnection } from '@/services/supabaseStorage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';

const sqlScript = `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL,
  description TEXT NOT NULL, amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'expense', date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piggy_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL,
  name TEXT NOT NULL, target_amount NUMERIC(10, 2) NOT NULL,
  current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0, color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL,
  description TEXT NOT NULL, amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'expense',
  frequency TEXT NOT NULL DEFAULT 'monthly', day_of_month INT, day_of_week INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

export const SupabaseBadge = () => {
  const initialConfig = getStoredSupabaseConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(initialConfig.anonKey || '');
  const isConfigured = checkIsConfigured();

  const testConnection = async () => {
    setIsTesting(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
    result.success ? showSuccess(result.message) : showError(result.message);
  };

  const copySql = async () => {
    await navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    showSuccess('Script SQL copiado!');
    window.setTimeout(() => setCopied(false), 2000);
  };

  const saveKeys = () => {
    saveCustomSupabaseConfig(supabaseUrl, supabaseKey);
    showSuccess('Credenciais salvas. A página será atualizada.');
    window.setTimeout(() => window.location.reload(), 800);
  };

  return (
    <>
      <button type="button" onClick={() => { setIsOpen(true); void testConnection(); }} className={`flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${isConfigured ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        {isConfigured ? <Wifi className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5" />}
        <span>{isConfigured ? 'Sincronizado (Nuvem)' : 'Modo Local (Off-line)'}</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Conexão com Supabase</DialogTitle><DialogDescription>Configure as credenciais e crie as tabelas do aplicativo.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className={`rounded-lg border p-3 text-sm ${testResult?.success ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold">{testResult?.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{testResult?.success ? 'Supabase conectado' : 'Verificar conexão'}</span><Button size="sm" variant="outline" onClick={() => void testConnection()} disabled={isTesting}><RefreshCw className={`mr-1 h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />Testar</Button></div>
              {testResult && <p className="mt-2 text-xs">{testResult.message}</p>}
            </div>
            <div className="space-y-2"><Label htmlFor="supabase-url">Project URL</Label><Input id="supabase-url" value={supabaseUrl} onChange={(event) => setSupabaseUrl(event.target.value)} placeholder="https://seu-projeto.supabase.co" /><Label htmlFor="supabase-key">API Key (Anon / Public)</Label><Input id="supabase-key" type="password" value={supabaseKey} onChange={(event) => setSupabaseKey(event.target.value)} placeholder="eyJ..." /><Button className="w-full" onClick={saveKeys}>Salvar credenciais</Button></div>
            <div><Button size="sm" variant="outline" onClick={() => void copySql()}>{copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}{copied ? 'Copiado!' : 'Copiar SQL'}</Button><pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-300">{sqlScript}</pre></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
