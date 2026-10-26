import Link from "next/link";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import BackupQuickActions from "./BackupQuickActions";
import BackupHistoryAndRestore from "./BackupHistoryAndRestore";

function fmtBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default async function AdminBackupRestorePage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: backups }, { data: settingsRows }] = await Promise.all([
    supabase.from("backups").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("backup_settings").select("key, value"),
  ]);

  const settings = Object.fromEntries((settingsRows ?? []).map((s) => [s.key, s.value]));
  const completed = (backups ?? []).filter((b) => b.status === "completed");
  const lastBackup = completed[0];
  const totalSize = completed.reduce((s, b) => s + Number(b.size ?? 0), 0);
  const failedCount = (backups ?? []).filter((b) => b.status === "failed").length;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        <Link href="/manage-56buzzinbeats-qr-master-admin-page/dashboard" className="hover:text-primary">
          Dashboard
        </Link>
        <span>/</span>
        <span>Backup &amp; Restore</span>
      </div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Backup &amp; Restore</h1>
      <p className="mb-6 text-sm text-slate-500">Manage backups and restore safely — stored in Cloudflare R2.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">schedule</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Last Backup</p>
          <p className="text-lg font-black text-slate-900">{lastBackup ? new Date(lastBackup.created_at).toLocaleString() : "Never"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">inventory_2</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Total Backups</p>
          <p className="text-2xl font-black text-slate-900">{completed.length}</p>
          {failedCount > 0 && <p className="text-xs text-red-500">{failedCount} failed</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">cloud_queue</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">R2 Storage Used</p>
          <p className="text-2xl font-black text-slate-900">{fmtBytes(totalSize)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">autorenew</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Auto Backup</p>
          <p className="text-2xl font-black text-slate-900">{settings.auto_backup_enabled === "1" ? "ON" : "OFF"}</p>
        </div>
      </div>

      <BackupQuickActions settings={settings} />
      <BackupHistoryAndRestore backups={backups ?? []} />
    </div>
  );
}
