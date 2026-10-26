import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import TicketsTable from "./TicketsTable";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/users";

export default async function AdminUserTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const userId = Number(id);
  const supabase = createAdminClient();

  const [{ data: user }, { data: tickets }] = await Promise.all([
    supabase.from("users").select("id, name, email").eq("id", userId).maybeSingle(),
    supabase.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (!user) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href={BASE} className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Users
        </Link>
        <span className="text-slate-300">/</span>
        <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
      </div>

      <div className="mb-8 flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
          <span className="material-symbols-outlined text-2xl text-primary">person</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg leading-tight font-bold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-primary">{tickets?.length ?? 0}</p>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Total Tickets</p>
        </div>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
          <span className="material-symbols-outlined mb-4 block text-5xl text-slate-200">inbox</span>
          <p className="font-medium text-slate-400">No support tickets from this user yet.</p>
        </div>
      ) : (
        <TicketsTable tickets={tickets} />
      )}
    </div>
  );
}
