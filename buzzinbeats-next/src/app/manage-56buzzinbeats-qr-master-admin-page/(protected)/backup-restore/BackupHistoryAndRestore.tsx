"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBackupAction, getBackupDownloadUrlAction, verifyBackupAction, runRestoreAction } from "@/lib/data/backups";

type Backup = {
  id: number;
  name: string;
  type: string;
  destination: string;
  size: number | null;
  status: string;
  duration: number | null;
  created_at: string;
};

function fmtBytes(bytes: number | null) {
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

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  running: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

export default function BackupHistoryAndRestore({ backups }: { backups: Backup[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(backups.find((b) => b.status === "completed")?.id ?? null);

  const dbBackups = backups.filter((b) => b.status === "completed" && (b.type === "full" || b.type === "database"));

  function handleDownload(id: number) {
    startTransition(async () => {
      try {
        const url = await getBackupDownloadUrlAction(id);
        window.open(url, "_blank");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Download failed.");
      }
    });
  }

  function handleVerify(id: number) {
    setMessage(null);
    startTransition(async () => {
      try {
        await verifyBackupAction(id);
        setMessage("Backup verified — file is readable in R2.");
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Verification failed.");
      }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this backup permanently?")) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await deleteBackupAction(id);
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Delete failed.");
      }
    });
  }

  function handleRestore() {
    if (!selectedId) return;
    if (
      !confirm(
        "Restoring will overwrite matching rows with data from the selected backup. Rows created after the backup are left untouched — nothing is deleted. A fresh safety backup will be taken first. Continue?"
      )
    )
      return;
    setMessage(null);
    startTransition(async () => {
      try {
        const results = await runRestoreAction(selectedId);
        const totalRestored = results.reduce((s, r) => s + r.restored, 0);
        setMessage(`Restore complete — ${totalRestored} rows restored across ${results.length} tables.`);
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Restore failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {message && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <span className="material-symbols-outlined text-primary">history</span>
            Backup History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{b.name}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{b.type}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtBytes(b.size)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[b.status] ?? "bg-slate-100 text-slate-500"}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{b.duration ? `${b.duration}s` : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {b.status === "completed" && (
                      <>
                        <button onClick={() => handleDownload(b.id)} disabled={isPending} className="mr-2 text-primary hover:underline" title="Download">
                          <span className="material-symbols-outlined align-middle text-base">download</span>
                        </button>
                        <button onClick={() => handleVerify(b.id)} disabled={isPending} className="mr-2 text-slate-400 hover:text-primary" title="Verify">
                          <span className="material-symbols-outlined align-middle text-base">verified</span>
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(b.id)} disabled={isPending} className="text-slate-400 hover:text-red-500" title="Delete">
                      <span className="material-symbols-outlined align-middle text-base">delete_outline</span>
                    </button>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No backups yet. Run one above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
          <span className="material-symbols-outlined text-primary">restore</span>
          Restore Center
        </h3>
        {dbBackups.length === 0 ? (
          <p className="text-sm text-slate-400">Run a database or full backup first to enable restore.</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold text-slate-500">Select Backup</label>
              <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {dbBackups.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({fmtBytes(b.size)}) — {new Date(b.created_at).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <span className="material-symbols-outlined text-amber-500">warning</span>
              <p className="text-sm text-amber-800">
                Restoring will overwrite rows with data from the selected backup, matched by ID. Rows created after the backup are left untouched — this cannot delete data.
                A safety backup is created automatically before proceeding.
              </p>
            </div>
            <button onClick={handleRestore} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
              <span className="material-symbols-outlined text-base">restore</span>
              {isPending ? "Restoring…" : "Start Restore"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
