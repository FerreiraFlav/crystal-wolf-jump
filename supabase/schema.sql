-- Execute this file in Supabase: SQL Editor > New query > Run.
-- It uses Supabase Auth for passwords, enforces relational integrity, and protects each user's records with RLS.

create extension if not exists pgcrypto;

-- 1. Profiles (linked directly to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  created_at timestamptz not null default now()
);

-- 2. Trigger function to create profile on signup
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

-- 6. Budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  limit_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint unique_user_category unique (user_id, category)
);

-- 7. Indexes for performance and cascade lookups
create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_piggy_banks_user_id on public.piggy_banks(user_id);
create index if not exists idx_recurring_transactions_user_id on public.recurring_transactions(user_id);
create index if not exists idx_budgets_user_id on public.budgets(user_id);

-- 8. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.piggy_banks enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.budgets enable row level security;

-- 9. Policies for Profiles
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- 10. Policies for Expenses (UUID comparison)
drop policy if exists "Users manage their own expenses" on public.expenses;
create policy "Users manage their own expenses" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 11. Policies for Piggy Banks (UUID comparison)
drop policy if exists "Users manage their own piggy banks" on public.piggy_banks;
create policy "Users manage their own piggy banks" on public.piggy_banks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 12. Policies for Recurring Transactions (UUID comparison)
drop policy if exists "Users manage their own recurring transactions" on public.recurring_transactions;
create policy "Users manage their own recurring transactions" on public.recurring_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 13. Policies for Budgets (UUID comparison)
drop policy if exists "Users manage their own budgets" on public.budgets;
create policy "Users manage their own budgets" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
