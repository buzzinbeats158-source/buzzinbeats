-- The CLI is unavailable in this environment; follows this repository's
-- existing numbered migration convention. Apply before deploying the app.
begin;

-- Freeze writes during the snapshot so a concurrent rename cannot leave a
-- page with the wrong name. Keep the existing slug and URL spelling intact.
lock table public.users in share row exclusive mode;
lock table public.pages in access exclusive mode;

alter table public.pages add column public_username text;

update public.pages as p
set public_username = u.name
from public.users as u
where u.id = p.user_id;

-- Abort rather than silently change an already distributed address if the
-- legacy display-name-based routing has created an ambiguous URL.
do $$
begin
  if exists (
    select 1 from public.pages where deleted_at is null
    group by public_username, slug having count(*) > 1
  ) then
    raise exception 'Duplicate existing public page addresses: resolve before applying permanent URLs';
  end if;
end;
$$;

alter table public.pages alter column public_username set not null;
-- Legacy soft-deleted rows can already share an address. Preserve them
-- without allowing two current pages to compete for the same public URL.
create unique index pages_public_address_unique
  on public.pages (public_username, slug) where deleted_at is null;

create function public.lock_page_public_address()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    -- Always derive the name on the server, including direct inserts and
    -- create_page() calls. FOR SHARE serializes this snapshot with renames.
    select u.name into NEW.public_username
    from public.users as u where u.id = NEW.user_id
    for share;

    if NEW.public_username is null then
      raise exception 'A page must have an existing owner with a name';
    end if;
  elsif NEW.public_username is distinct from OLD.public_username
     or NEW.slug is distinct from OLD.slug
     or NEW.user_id is distinct from OLD.user_id then
    raise exception 'Page URLs are permanent and cannot be changed';
  end if;

  return NEW;
end;
$$;

revoke all on function public.lock_page_public_address() from public;

create trigger pages_lock_public_address
before insert or update on public.pages
for each row execute function public.lock_page_public_address();

comment on column public.pages.public_username is
  'Owner name captured at creation. Immutable with slug; independent of later profile renames.';

notify pgrst, 'reload schema';
commit;
