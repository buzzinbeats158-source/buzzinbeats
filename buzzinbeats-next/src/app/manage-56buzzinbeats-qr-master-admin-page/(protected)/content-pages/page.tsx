import Link from "next/link";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deletePageAction } from "@/lib/data/admin-actions";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/content-pages";
const PAGE_SIZE = 10;

const TYPE_LABELS: Record<string, string> = {
  product: "Product",
  redirect_link: "Redirect",
  digital_product: "Digital",
};

export default async function AdminContentPagesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const supabase = createAdminClient();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: pages, count: totalPages } = await supabase
    .from("pages")
    .select("id, title, slug, page_id, status, is_published, created_at, users(name, username)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const pageIds = (pages ?? []).map((p) => p.id);
  const { data: sections } = pageIds.length
    ? await supabase.from("content_page_sections").select("content_page_id, section_type").eq("is_enabled", true).in("content_page_id", pageIds)
    : { data: [] as { content_page_id: number; section_type: string }[] };

  const typesByPage = new Map<number, string[]>();
  for (const s of sections ?? []) {
    const list = typesByPage.get(s.content_page_id) ?? [];
    list.push(TYPE_LABELS[s.section_type] ?? s.section_type);
    typesByPage.set(s.content_page_id, list);
  }

  const totalPageCount = Math.max(1, Math.ceil((totalPages ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Content Pages</h1>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Page Code</th>
                <th className="px-4 py-3">Page Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Content Types</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pages ?? []).map((p) => {
                const owner = p.users as unknown as { name: string; username: string } | null;
                const types = typesByPage.get(p.id) ?? [];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-slate-500">{p.page_id ?? `#${p.id}`}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500">{owner?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{types.length ? types.join(" + ") : <span className="text-slate-300">None</span>}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${p.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {p.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <span className="block text-[11px] text-slate-400">{p.is_published ? "Published" : "Draft"}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link href={`${BASE}/${p.id}`} className="mr-3 text-sm font-medium text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      {owner?.username && (
                        <a
                          href={`/${owner.username}/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-3 text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          Preview
                        </a>
                      )}
                      <form
                        action={async () => {
                          "use server";
                          await deletePageAction(p.id);
                        }}
                        className="inline-block"
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
        {totalPageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-500">
            <span>
              Page {page} of {totalPageCount}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPageCount && (
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
