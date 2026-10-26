import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  healthy: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  broken: "bg-red-100 text-red-700",
  unchecked: "bg-slate-100 text-slate-500",
};

export default async function LinkMonitorPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, link, health_status, last_http_code, last_checked_at")
    .eq("user_id", user!.id)
    .order("health_status", { ascending: true });

  const list = products ?? [];
  const broken = list.filter((p) => p.health_status === "broken").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Link Health Monitor</h1>
          <p className="mt-1 text-slate-500">Automatic checks catch broken affiliate links before you lose sales.</p>
        </div>
        {broken > 0 && (
          <span className="rounded-full bg-red-100 px-4 py-1.5 text-xs font-black text-red-700">{broken} broken</span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-orange-50 bg-orange-50/30 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">HTTP</th>
              <th className="px-4 py-3">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {list.map((p) => (
              <tr key={p.id}>
                <td className="max-w-xs truncate px-4 py-3 font-bold text-slate-800">{p.title}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.health_status] ?? STATUS_STYLES.unchecked}`}>
                    {p.health_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.last_http_code ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {p.last_checked_at ? new Date(p.last_checked_at).toLocaleString() : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No products yet.</p>}
      </div>
    </div>
  );
}
