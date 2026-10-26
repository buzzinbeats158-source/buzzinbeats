-- Phase 5: atomic create-with-serial-number RPCs.
--
-- next_serial_number() (migration 0002) is only safe when the caller
-- issues it and the following INSERT inside the SAME transaction. Two
-- separate PostgREST requests (rpc call, then insert) do NOT share a
-- transaction, so the advisory lock from the first call is released
-- before the second request even starts — reintroducing the exact race
-- condition it was meant to close. These functions call
-- next_serial_number() and INSERT together inside one function body,
-- which Postgres always executes as a single transaction, closing that
-- gap for real. This is the only supported way application code should
-- create rows in these four tables.

-- NOTE on page_id: the Laravel Page model builds this field as
-- `$user->unique_id . '-P' . serial` (Page.php:47), but no `unique_id`
-- column exists anywhere in the schema or migrations — it's undefined,
-- so current Laravel actually produces just "-P001" for any NEW page
-- created today. Existing rows show a real "BA001-P001"-style prefix,
-- meaning it was set by some earlier/removed mechanism, not the code as
-- it exists now. This function matches Laravel's CURRENT (broken) live
-- behavior rather than inventing a new prefix scheme — flagged as a
-- discrepancy for a product decision, not silently "fixed" here.
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
  v_serial := public.next_serial_number('pages', p_user_id);

  insert into public.pages (user_id, title, slug, description, serial_number, page_id, status, is_published, views, created_at, updated_at)
  values (p_user_id, p_title, p_slug, p_description, v_serial,
          '-P' || lpad(v_serial::text, 3, '0'),
          'active', false, 0, now(), now())
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.create_product(
  p_user_id bigint,
  p_page_id bigint,
  p_title text,
  p_link text,
  p_image_path text,
  p_description text default null,
  p_starting_price numeric default null,
  p_currency_code text default 'INR',
  p_currency_symbol text default '₹'
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_serial integer;
  v_row public.products;
begin
  if p_page_id not in (select id from public.pages where user_id = p_user_id) then
    raise exception 'create_product: page % does not belong to user %', p_page_id, p_user_id;
  end if;

  v_serial := public.next_serial_number('products', p_user_id);

  insert into public.products (user_id, page_id, title, link, image_path, description, starting_price, currency_code, currency_symbol, serial_number, clicks, show_price, created_at, updated_at)
  values (p_user_id, p_page_id, p_title, p_link, p_image_path, p_description, p_starting_price, p_currency_code, p_currency_symbol, v_serial, 0, true, now(), now())
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.create_redirect_link(
  p_user_id bigint,
  p_page_id bigint,
  p_title text,
  p_destination_url text,
  p_description text default null,
  p_button_text text default 'Visit'
)
returns public.redirect_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_serial integer;
  v_row public.redirect_links;
begin
  if p_page_id not in (select id from public.pages where user_id = p_user_id) then
    raise exception 'create_redirect_link: page % does not belong to user %', p_page_id, p_user_id;
  end if;

  v_serial := public.next_serial_number('redirect_links', p_user_id);

  insert into public.redirect_links (user_id, page_id, title, destination_url, description, button_text, serial_number, status, clicks, open_in_new_tab, created_at, updated_at)
  values (p_user_id, p_page_id, p_title, p_destination_url, p_description, p_button_text, v_serial, 'active', 0, true, now(), now())
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.create_digital_product(
  p_user_id bigint,
  p_page_id bigint,
  p_title text,
  p_price numeric default 0,
  p_description text default null,
  p_currency_code text default 'INR',
  p_currency_symbol text default '₹'
)
returns public.digital_products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_serial integer;
  v_row public.digital_products;
begin
  if p_page_id not in (select id from public.pages where user_id = p_user_id) then
    raise exception 'create_digital_product: page % does not belong to user %', p_page_id, p_user_id;
  end if;

  v_serial := public.next_serial_number('digital_products', p_user_id);

  insert into public.digital_products (user_id, page_id, title, description, price, currency_code, currency_symbol, serial_number, status, clicks, button_text, storage_provider, created_at, updated_at)
  values (p_user_id, p_page_id, p_title, p_description, p_price, p_currency_code, p_currency_symbol, v_serial, 'active', 0, 'Download', 'supabase', now(), now())
  returning * into v_row;

  return v_row;
end;
$$;
