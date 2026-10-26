-- Phase 3/4: link existing application users to new Supabase Auth identities
-- without renumbering any existing integer PKs or touching existing FKs.
-- Additive only — safe to run against production data.

alter table public.users
  add column if not exists auth_user_id uuid references auth.users(id);

create unique index if not exists users_auth_user_id_key
  on public.users (auth_user_id)
  where auth_user_id is not null;

comment on column public.users.auth_user_id is
  'Links this legacy integer-PK application user row to its Supabase Auth identity (auth.users.id). Populated once per account during the Next.js migration cutover — see migration plan "User identity migration" section.';

-- Row Level Security: enable and scope by the mapped identity, not by
-- auth.uid() directly (auth.uid() is a uuid; users.id is bigint/int).
alter table public.users enable row level security;

drop policy if exists "users can read own row" on public.users;
create policy "users can read own row"
  on public.users for select
  using (auth_user_id = auth.uid());

drop policy if exists "users can update own row" on public.users;
create policy "users can update own row"
  on public.users for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Helper used throughout RLS policies on child tables (pages, products, etc.)
-- to resolve the current Supabase Auth session back to the legacy integer
-- user id, e.g.: using (user_id = public.current_app_user_id())
create or replace function public.current_app_user_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid();
$$;
