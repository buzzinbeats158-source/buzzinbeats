import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteDigitalProductAdminAction } from "@/lib/data/admin-actions";

const PAGE_SIZE = 10;

function fileSizeForHumans(bytes: number | null) {
  if (!bytes) return null;
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default async function AdminDigitalProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const supabase = createAdminClient();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: products, count: total } = await supabase
    .from("digital_products")
    .select(
      "id, title, price, currency_symbol, original_file_name, file_size, storage_provider, storage_object_key, status, created_at, users(name)",
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Digital Products Management</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Storage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(products ?? []).map((p) => {
                const owner = p.users as unknown as { name: string } | null;
                const size = fileSizeForHumans(p.file_size);
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500">{owner?.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.currency_symbol}
                      {Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.original_file_name}
                      {size && <span className="block text-[11px] text-slate-400">{size}</span>}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-slate-500" title={p.storage_object_key ?? ""}>
                      {p.storage_provider?.toUpperCase()}
                      <span className="block truncate">{p.storage_object_key}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${p.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {p.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteDigitalProductAdminAction(p.id);
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
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No digital products yet.
                  </td>
                </tr>
              )}
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
