import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Database, RefreshCw, Wifi } from 'lucide-react';
import { checkIsConfigured, getStoredSupabaseConfig, saveCustomSupabaseConfig } from '@/lib/supabase';
import { testSupabaseConnection } from '@/services/supabaseStorage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';

const sqlScript = `-- Execute este script no Supabase: SQL Editor > New query > Run.
-- Utiliza o Supabase Auth com senhas criptografadas, integridade relacional e RLS.

create extension if not exists pgcrypto;

-- 1. Profiles (vinculado a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  created_at timestamptz not null default now()
);

-- 2. Trigger de sincronização de cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(10, 2) not null,
  category text not null,
  type text not null default 'expense',
  date date not null,
  created_at timestamptz not null default now()
);

-- 4. Piggy Banks
create table if not exists public.piggy_banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(10, 2) not null,
  current_amount numeric(10, 2) not null default 0,
  color text default '#10B981',
  created_at timestamptz not null default now()
);

-- 5. Recurring Transactions
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(10, 2) not null,
  category text not null,
  type text not null default 'expense',
  frequency text not null default 'monthly',
  day_of_month int,
  day_of_week int,
  created_at timestamptz not null default now()
);

-- 6. Índices para performance
create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_piggy_banks_user_id on public.piggy_banks(user_id);
create index if not exists idx_recurring_transactions_user_id on public.recurring_transactions(user_id);

-- 7. Ativar Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.piggy_banks enable row level security;
alter table public.recurring_transactions enable row level security;

-- 8. Policies para Profiles
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- 9. Policies para Expenses (UUID)
drop policy if exists "Users manage their own expenses" on public.expenses;
create policy "Users manage their own expenses" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 10. Policies para Piggy Banks (UUID)
drop policy if exists "Users manage their own piggy banks" on public.piggy_banks;
create policy "Users manage their own piggy banks" on public.piggy_banks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 11. Policies para Recurring Transactions (UUID)
drop policy if exists "Users manage their own recurring transactions" on public.recurring_transactions;
create policy "Users manage their own recurring transactions" on public.recurring_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;

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
    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message);
    }
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
            <div className="space-y-2"><Label htmlFor="supabase-url">Project URL</Label><Input id="supabase-url" value={supabaseUrl} onChange={(event) => setSupabaseUrl(event.target.value)} placeholder="https://seu-projeto.supabase.co" /><Label htmlFor="supabase-key">API Key (Anon / Public) — NUNCA use service_role</Label><Input id="supabase-key" type="password" value={supabaseKey} onChange={(event) => setSupabaseKey(event.target.value)} placeholder="eyJ..." /><Button className="w-full" onClick={saveKeys}>Salvar credenciais</Button></div>
            <div><Button size="sm" variant="outline" onClick={() => void copySql()}>{copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}{copied ? 'Copiado!' : 'Copiar SQL'}</Button><pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-300">{sqlScript}</pre></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
