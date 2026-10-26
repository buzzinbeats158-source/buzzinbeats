-- Phase 5: Row Level Security for creator-owned content tables.
-- Additive only. Uses public.current_app_user_id() from migration 0001
-- to resolve the session back to the legacy integer user_id.

alter table public.pages enable row level security;
alter table public.products enable row level security;
alter table public.redirect_links enable row level security;
alter table public.digital_products enable row level security;
alter table public.content_page_sections enable row level security;
alter table public.user_stores enable row level security;
alter table public.user_social_media enable row level security;
alter table public.user_landing_sections enable row level security;

-- Owner can do everything with their own rows.
drop policy if exists "owner full access" on public.pages;
create policy "owner full access" on public.pages
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists "owner full access" on public.products;
create policy "owner full access" on public.products
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists "owner full access" on public.redirect_links;
create policy "owner full access" on public.redirect_links
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists "owner full access" on public.digital_products;
create policy "owner full access" on public.digital_products
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists "owner full access" on public.user_stores;
create policy "owner full access" on public.user_stores
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists "owner full access" on public.user_social_media;
create policy "owner full access" on public.user_social_media
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists "owner full access" on public.user_landing_sections;
create policy "owner full access" on public.user_landing_sections
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

-- content_page_sections has no user_id of its own — scope through its
-- parent page.
drop policy if exists "owner full access via page" on public.content_page_sections;
create policy "owner full access via page" on public.content_page_sections
  for all using (
    content_page_id in (select id from public.pages where user_id = public.current_app_user_id())
  )
  with check (
    content_page_id in (select id from public.pages where user_id = public.current_app_user_id())
  );

-- Public read: anonymous/other visitors can read published+active pages
-- and their content, matching the visibility rule already enforced in
-- application code for the public /{username}/{slug} route (which uses
-- the service-role client and bypasses RLS entirely — this policy is a
-- second, defense-in-depth layer in case any future code path queries
-- these tables with the anon/authenticated client instead).
drop policy if exists "public read of published active pages" on public.pages;
create policy "public read of published active pages" on public.pages
  for select using (is_published = true and status = 'active' and deleted_at is null);

drop policy if exists "public read of products on visible pages" on public.products;
create policy "public read of products on visible pages" on public.products
  for select using (
    page_id in (
      select id from public.pages
      where is_published = true and status = 'active' and deleted_at is null
    )
  );

drop policy if exists "public read of redirect links on visible pages" on public.redirect_links;
create policy "public read of redirect links on visible pages" on public.redirect_links
  for select using (
    status = 'active' and deleted_at is null and page_id in (
      select id from public.pages
      where is_published = true and status = 'active' and deleted_at is null
    )
  );
