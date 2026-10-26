import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function clearAllAction() {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("error_logs").delete().neq("id", 0);
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/error-logs");
}

export default async function AdminErrorLogsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: logs } = await supabase
    .from("error_logs")
    .select("id, reference_id, username, url, method, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Error Logs</h1>
        <form action={clearAllAction}>
          <button type="submit" className="text-sm font-bold text-red-600 hover:underline">
            Clear all
          </button>
        </form>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(logs ?? []).map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.reference_id}</td>
                <td className="px-4 py-3 text-slate-500">{l.username ?? "guest"}</td>
                <td className="px-4 py-3 text-slate-500">{l.method}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-500">{l.url}</td>
                <td className="max-w-xs truncate px-4 py-3 text-red-600">{l.message}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No errors logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
