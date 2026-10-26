import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deletePageAction } from "@/lib/data/admin-actions";

export default async function AdminPagesPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, status, is_published, views, user_id, users(name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Pages</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(pages ?? []).map((p) => {
              const owner = p.users as unknown as { name: string; email: string } | null;
              return (
                <tr key={p.id}>
                  <td className="max-w-xs truncate px-4 py-3 font-bold text-slate-800">{p.title}</td>
                  <td className="px-4 py-3 text-slate-500">{owner?.name ?? p.user_id}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.views ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deletePageAction(p.id);
                      }}
                    >
                      <button type="submit" className="text-xs font-bold text-red-600 hover:underline">
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
    </div>
  );
}
