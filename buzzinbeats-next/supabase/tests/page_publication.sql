-- All test rows roll back. The create_page RPC can advance the page ID sequence.
begin;

do $$
declare
  owner record;
  created public.pages;
  address_name text;
  address_slug text;
begin
  select id, auth_user_id, name into owner
  from public.users where auth_user_id is not null order by id limit 1;
  if not found then raise exception 'A linked application user is required for this regression check'; end if;

  perform set_config('request.jwt.claim.sub', owner.auth_user_id::text, true);
  select * into created from public.create_page(
    owner.id, 'Publication regression check', 'publication-check-' || gen_random_uuid()::text, null
  );
  if created.is_published is distinct from true then
    raise exception 'Publish Page created a draft';
  end if;
  if created.public_username is distinct from owner.name then
    raise exception 'Creation did not capture the permanent URL name';
  end if;
  address_name := created.public_username;
  address_slug := created.slug;

  update public.pages set is_published = false where id = created.id returning * into created;
  if created.is_published is distinct from false then raise exception 'Move to Draft failed'; end if;
  if created.public_username is distinct from address_name or created.slug is distinct from address_slug then
    raise exception 'Moving to draft changed the URL';
  end if;

  update public.pages set is_published = true where id = created.id returning * into created;
  if created.is_published is distinct from true then raise exception 'Republish failed'; end if;
  if created.public_username is distinct from address_name or created.slug is distinct from address_slug then
    raise exception 'Republishing changed the URL';
  end if;

  begin
    perform public.create_page(-1, 'Unauthorized', 'unauthorized-publication-check', null);
    raise exception 'Unauthorized creation succeeded';
  exception when raise_exception then
    if SQLERRM not like 'create_page: not authorized for user %' then raise; end if;
  end;

  update public.pages set deleted_at = now(), is_published = false
  where id = created.id returning * into created;
  if created.deleted_at is null or created.is_published then raise exception 'Deletion did not hide the page'; end if;
  if created.public_username is distinct from address_name or created.slug is distinct from address_slug then
    raise exception 'Deletion changed the saved URL';
  end if;

  raise notice 'Publish, draft, republish, delete and permanent URL regression checks passed';
end;
$$;

rollback;
