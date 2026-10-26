-- Phase 5: Storage RLS. Path convention mirrors the Laravel layout:
-- public-uploads:  uploads/users/{userId}/{products|redirect-links|digital-products}/{file}
-- digital-products: BuzzinBeats/DigitalProducts/user-{userId}/{uuid}.{ext}  (private, signed-URL only)

create or replace function public.storage_path_owner_id(object_name text)
returns bigint
language sql
immutable
as $$
  -- pulls the numeric id out of ".../users/{id}/..." or ".../user-{id}/..."
  select nullif(regexp_replace(
    coalesce(
      (regexp_match(object_name, 'users/(\d+)/'))[1],
      (regexp_match(object_name, 'user-(\d+)/'))[1]
    ), '\D', '', 'g'
  ), '')::bigint;
$$;

drop policy if exists "owner can write to public-uploads" on storage.objects;
create policy "owner can write to public-uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'public-uploads'
    and public.storage_path_owner_id(name) = public.current_app_user_id()
  );

drop policy if exists "owner can update own public-uploads" on storage.objects;
create policy "owner can update own public-uploads"
  on storage.objects for update
  using (bucket_id = 'public-uploads' and public.storage_path_owner_id(name) = public.current_app_user_id());

drop policy if exists "owner can delete own public-uploads" on storage.objects;
create policy "owner can delete own public-uploads"
  on storage.objects for delete
  using (bucket_id = 'public-uploads' and public.storage_path_owner_id(name) = public.current_app_user_id());

-- public-uploads bucket is already public=true, so unauthenticated reads
-- work via the public URL regardless of RLS SELECT policy — no public
-- SELECT policy needed here.

drop policy if exists "owner can write to digital-products" on storage.objects;
create policy "owner can write to digital-products"
  on storage.objects for insert
  with check (
    bucket_id = 'digital-products'
    and public.storage_path_owner_id(name) = public.current_app_user_id()
  );

drop policy if exists "owner can manage own digital-products" on storage.objects;
create policy "owner can manage own digital-products"
  on storage.objects for all
  using (bucket_id = 'digital-products' and public.storage_path_owner_id(name) = public.current_app_user_id());

-- No SELECT policy for anon/authenticated on digital-products — downloads
-- only ever happen via the service-role client generating a signed URL
-- (see /digital-product/[id]/download), same as the Laravel R2 flow.
