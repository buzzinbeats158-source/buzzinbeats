-- Publish Page publishes atomically with creation and the permanent URL.
-- Preserve the live RPC's existing ownership check and privileges.
begin;

create or replace function public.create_page(
  p_user_id bigint,
  p_title text,
  p_slug text,
  p_description text default null
)
returns public.pages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_serial integer;
  v_row public.pages;
begin
  if p_user_id is distinct from public.current_app_user_id() then
    raise exception 'create_page: not authorized for user %', p_user_id;
  end if;

  v_serial := public.next_serial_number('pages', p_user_id);

  insert into public.pages (user_id, title, slug, description, serial_number, page_id, status, is_published, views, created_at, updated_at)
  values (p_user_id, p_title, p_slug, p_description, v_serial,
          '-P' || lpad(v_serial::text, 3, '0'),
          'active', true, 0, now(), now())
  returning * into v_row;

  return v_row;
end;
$$;

notify pgrst, 'reload schema';
commit;
