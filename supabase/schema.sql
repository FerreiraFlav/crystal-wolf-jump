-- Execute this file in Supabase: SQL Editor > New query > Run.
-- It uses Supabase Auth for passwords and protects each user's records with RLS.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  created_at timestamptz not null default now()
);

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

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  description text not null,
  amount numeric(10, 2) not null,
  category text not null,
  type text not null default 'expense',
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.piggy_banks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  target_amount numeric(10, 2) not null,
  current_amount numeric(10, 2) not null default 0,
  color text default '#10B981',
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  description text not null,
  amount numeric(10, 2) not null,
  category text not null,
  type text not null default 'expense',
  frequency text not null default 'monthly',
  day_of_month int,
  day_of_week int,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.piggy_banks enable row level security;
alter table public.recurring_transactions enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users manage their own expenses" on public.expenses;
create policy "Users manage their own expenses" on public.expenses for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

drop policy if exists "Users manage their own piggy banks" on public.piggy_banks;
create policy "Users manage their own piggy banks" on public.piggy_banks for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

drop policy if exists "Users manage their own recurring transactions" on public.recurring_transactions;
create policy "Users manage their own recurring transactions" on public.recurring_transactions for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
