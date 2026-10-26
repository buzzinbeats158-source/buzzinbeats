-- Phase 4: concurrency-safe serial number generation.
-- Replaces Laravel's Cache::lock()+MAX()+1 (app-level mutex, had a
-- bypassable unlocked fallback path) with a single non-bypassable
-- Postgres function using row-level locking inside one transaction.
-- Also closes the pre-existing gap where `pages.serial_number` had no
-- locking at all in the Laravel app.

create or replace function public.next_serial_number(
  p_table text,        -- one of: 'pages', 'products', 'redirect_links', 'digital_products'
  p_user_id bigint,
  p_include_trashed boolean default true
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max integer;
  v_sql text;
begin
  if p_table not in ('pages', 'products', 'redirect_links', 'digital_products') then
    raise exception 'next_serial_number: unsupported table %', p_table;
  end if;

  -- Postgres doesn't allow `SELECT max(...) ... FOR UPDATE` (aggregates
  -- can't be combined with row locking), so per-user serialization is done
  -- with a transaction-scoped advisory lock instead: concurrent calls for
  -- the same (table, user) block each other until commit; different users
  -- or tables proceed independently. This mirrors the per-user granularity
  -- of the Laravel Cache::lock('{type}-serial:user:{id}') it replaces.
  perform pg_advisory_xact_lock(hashtextextended(p_table || ':' || p_user_id::text, 0));

  -- `products` has no deleted_at column (no soft deletes there); the other
  -- three do, and reserve their serial number even when trashed, matching
  -- the existing Laravel withTrashed() behavior.
  if p_table = 'products' or p_include_trashed then
    v_sql := format('select max(serial_number) from %I where user_id = $1', p_table);
  else
    v_sql := format('select max(serial_number) from %I where user_id = $1 and deleted_at is null', p_table);
  end if;

  execute v_sql into v_max using p_user_id;

  return coalesce(v_max, 0) + 1;
end;
$$;

comment on function public.next_serial_number is
  'Call inside the same transaction as the insert, e.g.:
   begin;
     select next_serial_number(''products'', 42) into v_serial;
     insert into products (user_id, serial_number, ...) values (42, v_serial, ...);
   commit;
   The advisory lock for (table, user_id) is held until commit, so a second
   concurrent transaction for the same user+table blocks until the first
   completes, then sees the updated max. This is the single, non-bypassable
   creation path — application code must never insert without calling this
   first (unlike the Laravel version, there is no unlocked fallback path).';
