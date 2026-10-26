import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteProductAdminAction } from "@/lib/data/admin-actions";
import { publicStorageUrl } from "@/lib/storage";

const PAGE_SIZE = 10;

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const supabase = createAdminClient();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: products, count: total } = await supabase
    .from("products")
    .select("id, title, link, image_path, created_at, users(name, username), pages(title, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Product ID</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(products ?? []).map((p) => {
                const owner = p.users as unknown as { name: string; username: string } | null;
                const pg = p.pages as unknown as { title: string; slug: string } | null;
                const pageHref = owner?.username && pg?.slug ? `/${owner.username}/${pg.slug}` : null;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-slate-500">#{p.id}</td>
                    <td className="px-4 py-3">
                      {p.image_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={publicStorageUrl(p.image_path) ?? undefined} className="h-10 w-10 rounded border border-slate-200 object-cover" alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded border border-slate-200 bg-slate-50" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{owner?.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {pageHref ? (
                        <a href={pageHref} target="_blank" rel="noreferrer" className="hover:underline">
                          {pg?.title}
                        </a>
                      ) : (
                        pg?.title
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900">{p.title ?? "No Title"}</td>
                    <td className="px-4 py-3 text-sm">
                      <a href={p.link} target="_blank" rel="noreferrer" className="block max-w-xs truncate text-blue-600 hover:underline">
                        {p.link}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteProductAdminAction(p.id);
                        }}
                      >
                        <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
