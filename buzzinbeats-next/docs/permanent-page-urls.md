# Permanent page URLs

Each page stores `public_username`, the owner's full name at creation. The public
address is the saved `public_username` plus the saved `slug`. Profile changes
affect only subsequently created pages. Page titles, content, publishing, QR
appearance and analytics remain editable; the address and owner are immutable.

Public lookups, dashboard/admin previews, copied URLs and QR downloads all use
the saved address. They never fall back to the owner's current name. URL
segments are encoded individually to support spaces, Unicode and punctuation.
Missing address fields raise an explicit error rather than generating a link
or QR code containing `undefined`.

## Rollout

Apply `supabase/migrations/0007_permanent_page_urls.sql` **before** deploying this
application version. Use the project's established SQL runner from this folder:

```powershell
node scripts/apply-migration.js supabase/migrations/0007_permanent_page_urls.sql
```

The migration runs in one transaction, captures each existing page's current
address without changing its slug, and installs an insert/update trigger. The
trigger also covers the existing `create_page` RPC and direct database writes.
It captures the current owner name on insert and rejects later changes to the
name, slug or owner. A partial unique index prevents collisions across current
pages while retaining the legacy duplicates among soft-deleted pages. An
ambiguous address among current pages aborts the entire migration instead of
silently renaming an existing link. Coordinate the schema/application rollout
with profile and page writes paused until both are ready.

This freezes the addresses that exist at migration time. A name removed before
this feature was installed cannot be reconstructed from the current users/pages
records; recovering an already broken historical URL requires its original name
and a verified page mapping.

## Verification

```powershell
node --test scripts/test-permanent-page-urls.cjs
npx --no-install tsc --noEmit
```

The application regression tests cover renamed accounts, new addresses, name
reuse by another account, QR destinations, special characters, public visibility
rules, immutable edit requests and ownership checks.

With the migration applied, run `supabase/tests/permanent_page_urls.sql` to
verify the real insert trigger, name snapshots, uniqueness and immutable
columns. Tests use negative fixture IDs and roll back every test row and
mutation without advancing sequences.

On 2026-10-27, the live database connection became available. The migration
and database regression checks passed in a rolled-back dry run before the
migration was applied. All 61 existing pages retained their original addresses.
The legacy duplicates involving soft-deleted rows were preserved. The API
confirmed page 64 has `public_username = 'ballu'`, and the original public URL
`https://buzzinbeats.com/ballu/the-gift-of-wonder` returned HTTP 200 with the
page's content. The accidental `/undefined/the-gift-of-wonder` URL returned 404.
