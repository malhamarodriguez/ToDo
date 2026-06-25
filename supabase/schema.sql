-- ============================================================
-- Núcleo · esquema de base de datos (Supabase / Postgres)
-- Ejecuta este SQL en: Supabase → SQL Editor → New query → Run
-- Cada fila pertenece a un usuario y queda protegida por RLS.
-- ============================================================

-- ---------- Perfil (1 fila por usuario) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text default '',
  role text default '',
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ---------- Colecciones ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text default '243 76% 64%',
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  project_id uuid references public.projects (id) on delete set null,
  priority text default 'media',
  status text default 'todo',
  today boolean default false,
  overdue boolean default false,
  due text default '',
  subtasks jsonb default '[]'::jsonb,
  tags text[] default '{}',
  position double precision default 0,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  sub text default '',
  date date,
  time text default '',
  color text default '243 76% 64%',
  created_at timestamptz default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area text default 'Negocio',
  title text not null,
  type text default 'percent',
  value numeric default 0,
  target numeric default 100,
  unit text default '',
  invert boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concept text not null,
  category text default '',
  amount numeric default 0,
  date date,
  recurring boolean default false,
  kind text default 'out',
  created_at timestamptz default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  spent numeric default 0,
  limit_amount numeric default 0,
  color text default '243 76% 64%',
  created_at timestamptz default now()
);

create table if not exists public.savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  value numeric default 0,
  target numeric default 0,
  color text default '243 76% 64%',
  created_at timestamptz default now()
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  value numeric default 0,
  kind text default 'asset', -- asset | liability
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind text default 'Proyecto',
  monthly numeric default 0,
  status text default 'Activo',
  pending numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.recurring (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concept text not null,
  amount numeric default 0,
  day text default '',
  kind text default 'out',
  created_at timestamptz default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  date date,
  dur integer default 0,
  exercises jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date,
  weight numeric,
  fat numeric,
  created_at timestamptz default now()
);

create table if not exists public.journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date,
  mood text default 'neutro',
  title text default '',
  body text default '',
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text default '',
  color text default '243 76% 64%',
  created_at timestamptz default now()
);

-- ---------- RLS: cada usuario solo ve lo suyo ----------
alter table public.profiles enable row level security;
drop policy if exists "own_profile" on public.profiles;
create policy "own_profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array[
    'projects','tasks','events','goals','movements','budgets','savings',
    'holdings','clients','recurring','workouts','metrics','journal','notes'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "own_all" on public.%I;', t);
    execute format(
      'create policy "own_all" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- ---------- Crear perfil automáticamente al registrarse ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
