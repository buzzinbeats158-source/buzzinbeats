-- Run on a disposable test database after migration 0007. Rows roll back,
-- but create_page() can still advance sequences, as PostgreSQL normally does.
begin;

do $$
declare
  owner_id bigint;
  other_owner_id bigint;
  old_name text := 'URL regression old ' || gen_random_uuid()::text;
  new_name text := 'URL regression new ' || gen_random_uuid()::text;
  old_page public.pages;
  new_page public.pages;
  direct_page public.pages;
  resolved_owner bigint;
begin
  -- Negative IDs avoid advancing production sequences, even on rollback.
  lock table public.users in share row exclusive mode;
  select least(coalesce(min(id), 0), 0) - 1 into owner_id from public.users;
  other_owner_id := owner_id - 1;

  insert into public.users (id, name, email, password)
  values (owner_id, old_name, gen_random_uuid()::text || '@example.invalid', 'test-only');

  select * into old_page from public.create_page(owner_id, 'Old page', 'original-menu', null);
  if old_page.public_username is distinct from old_name then
    raise exception 'Creation did not capture the owner name';
  end if;

  update public.users set name = new_name where id = owner_id;
  select * into new_page from public.create_page(owner_id, 'New page', 'new-menu', null);

  if new_page.public_username is distinct from new_name then
    raise exception 'New page did not capture the renamed account';
  end if;
  if not exists (select 1 from public.pages where id = old_page.id and public_username = old_name and slug = 'original-menu') then
    raise exception 'Rename changed an existing address';
  end if;

  -- Bypassing the application cannot choose another account's URL prefix.
  insert into public.pages (user_id, title, slug, public_username)
  values (owner_id, 'Direct insert', 'direct-menu', 'spoofed-name') returning * into direct_page;
  if direct_page.public_username is distinct from new_name then
    raise exception 'Direct insert accepted a spoofed URL name';
  end if;

  -- The saved URL resolves to the original owner even after name reuse.
  insert into public.users (id, name, email, password)
  values (other_owner_id, old_name, gen_random_uuid()::text || '@example.invalid', 'test-only');
  select user_id into resolved_owner from public.pages
  where public_username = old_name and slug = 'original-menu' and deleted_at is null;
  if resolved_owner is distinct from owner_id then
    raise exception 'Name reuse changed the URL owner';
  end if;

  begin
    perform public.create_page(other_owner_id, 'Collision', 'original-menu', null);
    raise exception 'Duplicate public URL was accepted';
  exception when unique_violation then null;
  end;

  begin
    update public.pages set public_username = new_name where id = old_page.id;
    raise exception 'URL name mutation was accepted';
  exception when raise_exception then
    if SQLERRM <> 'Page URLs are permanent and cannot be changed' then raise; end if;
  end;

  begin
    update public.pages set slug = 'changed-menu' where id = old_page.id;
    raise exception 'Slug mutation was accepted';
  exception when raise_exception then
    if SQLERRM <> 'Page URLs are permanent and cannot be changed' then raise; end if;
  end;

  begin
    update public.pages set user_id = other_owner_id where id = old_page.id;
    raise exception 'Owner mutation was accepted';
  exception when raise_exception then
    if SQLERRM <> 'Page URLs are permanent and cannot be changed' then raise; end if;
  end;

  -- Ordinary content, publication, QR and analytics updates still work.
  update public.pages set title = 'Updated title', is_published = true,
    qr_color = '#123456', views = views + 1 where id = old_page.id;
  update public.users set name = 'Third name ' || gen_random_uuid()::text where id = owner_id;
  if not exists (select 1 from public.pages where id = old_page.id and public_username = old_name and slug = 'original-menu') then
    raise exception 'Repeated rename changed the original address';
  end if;

  raise notice 'Permanent page URL regression checks passed';
end;
$$;

rollback;
