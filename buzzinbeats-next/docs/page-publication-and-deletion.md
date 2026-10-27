# Publishing and deleting pages

The creation screen's **Publish Page** action creates an active, published page
with its permanent URL in one transaction. Its content can be added afterward.
Both creation entry points reject an unpublished RPC result instead of reporting
that publication succeeded.

My Pages and the page editor have a publication button showing the current state:

- **Published · Move to Draft** hides the public page.
- **Draft · Publish Page** makes it public again, subject to the existing active
  status and subscription checks on public access.

Changing publication never changes the saved URL or QR destination. Published
pages show View; drafts explain that publication is required. The existing
Active/Inactive control continues to govern availability separately.

**Delete Page** is available in My Pages, the content editor and the identity
settings screen. A native modal dialog names the page and requires confirmation.
Errors keep the dialog open, and buttons are disabled while deletion is pending.
Deletion sets `deleted_at` and unpublishes the owned page. Deleted pages are
excluded from the list, editor, QR download and public lookup. Associated records
are retained in storage, and no other page is affected.

## Rollout and checks

Apply `supabase/migrations/0008_publish_pages_on_creation.sql` before deploying
the application. It preserves the live RPC's ownership check, existing function
privileges and permanent URL trigger; only the creation publication flag changes.

```powershell
node scripts/apply-migration.js supabase/migrations/0008_publish_pages_on_creation.sql
node --test scripts/test-page-controls.cjs scripts/test-permanent-page-urls.cjs
npx --no-install tsc --noEmit
```

`supabase/tests/page_publication.sql` exercises the actual RPC, publication
changes, unchanged URLs, unauthorized creation and deletion inside a rolled-back
transaction. It temporarily creates one test page under an existing linked
account. The row rolls back; PostgreSQL can advance its page ID sequence.
