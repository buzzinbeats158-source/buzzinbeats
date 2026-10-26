import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteRedirectLinkAdminAction } from "@/lib/data/admin-actions";

const PAGE_SIZE = 10;

export default async function AdminRedirectLinksPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const supabase = createAdminClient();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: links, count: total } = await supabase
    .from("redirect_links")
    .select("id, title, destination_url, status, created_at, users(name)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Redirect Links Management</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(links ?? []).map((l) => {
                const owner = l.users as unknown as { name: string } | null;
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{l.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <a href={l.destination_url} target="_blank" rel="noreferrer" className="block max-w-xs truncate text-blue-600 hover:underline">
                        {l.destination_url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{owner?.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${l.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {l.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(l.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteRedirectLinkAdminAction(l.id);
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
