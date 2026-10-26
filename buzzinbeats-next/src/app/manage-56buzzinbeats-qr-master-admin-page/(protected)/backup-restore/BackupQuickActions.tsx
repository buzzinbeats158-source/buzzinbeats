"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runBackupAction, cleanOldBackupsAction, updateBackupSettingsAction } from "@/lib/data/backups";

type Settings = Record<string, string>;

export default function BackupQuickActions({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  function runBackup(type: "full" | "database" | "files") {
    setMessage(null);
    startTransition(async () => {
      try {
        await runBackupAction(type);
        setMessage(`${type} backup completed.`);
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Backup failed.");
      }
    });
  }

  function handleClean() {
    if (!confirm("Delete backups older than the retention period? This cannot be undone.")) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const { removed } = await cleanOldBackupsAction();
        setMessage(`Removed ${removed} old backup${removed === 1 ? "" : "s"}.`);
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Clean up failed.");
      }
    });
  }

  function handleSettingsSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateBackupSettingsAction(formData);
        setMessage("Backup settings saved.");
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Failed to save settings.");
      }
    });
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Quick Actions</h3>
          <button onClick={() => setShowSettings((v) => !v)} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-primary">
            <span className="material-symbols-outlined text-base">settings</span>
            Settings
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button onClick={() => runBackup("full")} disabled={isPending} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
            <span className="material-symbols-outlined text-primary">backup</span>
            Full Backup
          </button>
          <button onClick={() => runBackup("database")} disabled={isPending} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
            <span className="material-symbols-outlined text-primary">storage</span>
            DB Backup
          </button>
          <button onClick={() => runBackup("files")} disabled={isPending} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
            <span className="material-symbols-outlined text-primary">folder_zip</span>
            Files Manifest
          </button>
          <button onClick={handleClean} disabled={isPending} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
            <span className="material-symbols-outlined text-primary">delete_sweep</span>
            Clean Old
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        {isPending && <p className="mt-3 text-sm text-slate-400">Working — this can take a moment for large tables…</p>}
      </div>

      {showSettings && (
        <form action={handleSettingsSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-slate-900">Backup Settings</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="auto_backup_enabled" defaultChecked={settings.auto_backup_enabled === "1"} className="accent-primary" />
              Enable Auto Backup
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="auto_delete_old" defaultChecked={settings.auto_delete_old === "1"} className="accent-primary" />
              Auto-delete old backups
            </label>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Frequency</label>
              <select name="auto_backup_frequency" defaultValue={settings.auto_backup_frequency ?? "every_6_hours"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="every_6_hours">Every 6 hours</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Type</label>
              <select name="auto_backup_type" defaultValue={settings.auto_backup_type ?? "full"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="full">Full System</option>
                <option value="database">Database Only</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Retention (days)</label>
              <input type="number" name="retention_days" defaultValue={settings.retention_days ?? "30"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Max Backups Kept</label>
              <input type="number" name="max_backups" defaultValue={settings.max_backups ?? "50"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="notify_backup_completed" defaultChecked={settings.notify_backup_completed === "1"} className="accent-primary" />
              Notify on backup completed
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="notify_backup_failed" defaultChecked={settings.notify_backup_failed === "1"} className="accent-primary" />
              Notify on backup failed
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="notify_restore_completed" defaultChecked={settings.notify_restore_completed === "1"} className="accent-primary" />
              Notify on restore completed
            </label>
          </div>
          <button type="submit" disabled={isPending} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60">
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
}
