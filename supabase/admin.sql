-- ============================================================
-- Summa · Módulo de gestión (solo el creador)
-- Ejecuta este SQL en: Supabase → SQL Editor → New query → Run
-- Sustituye TU_EMAIL por el email de tu cuenta de Summa.
--
-- Qué hace:
--  1) Crea la lista de administradores (tú) — ilegible desde la app.
--  2) Añade email y última actividad al perfil (los rellena la app).
--  3) Crea dos funciones seguras: is_admin() y admin_overview().
--     Solo devuelven datos si quien llama está en la lista de admins;
--     el resto de usuarios recibe un error, aunque conozcan la URL.
-- ============================================================

-- 1) Administradores
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
-- Sin policies: ningún cliente puede leer ni escribir esta tabla.

insert into public.admins (user_id)
select id from auth.users where email = 'TU_EMAIL'
on conflict do nothing;

-- 2) Datos de presencia en el perfil
alter table public.profiles
  add column if not exists email text,
  add column if not exists last_seen_at timestamptz;

-- 3) ¿Quién llama es admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 4) Resumen para el panel de gestión
create or replace function public.admin_overview()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'Solo administradores';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'new_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'new_30d', (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'active_7d', (select count(*) from public.profiles where last_seen_at > now() - interval '7 days'),
    'users', (
      select coalesce(jsonb_agg(item order by (item->>'created_at') desc), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'id', u.id,
          'email', u.email,
          'name', coalesce(p.name, ''),
          'plan', coalesce(p.plan, 'free'),
          'created_at', u.created_at,
          'last_seen_at', coalesce(p.last_seen_at, u.last_sign_in_at)
        ) as item
        from auth.users u
        left join public.profiles p on p.id = u.id
        order by u.created_at desc
        limit 200
      ) t
    ),
    'counts', jsonb_build_object(
      'tasks', (select count(*) from public.tasks),
      'events', (select count(*) from public.events),
      'movements', (select count(*) from public.movements),
      'workouts', (select count(*) from public.workouts),
      'journal', (select count(*) from public.journal),
      'goals', (select count(*) from public.goals)
    )
  ) into result;

  return result;
end;
$$;

-- Endurecer permisos: solo usuarios con sesión pueden siquiera llamar.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_overview() to authenticated;
