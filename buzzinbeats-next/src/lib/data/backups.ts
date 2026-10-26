"use server";

import "server-only";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadPrivateObject, downloadPrivateObject, deletePrivateObject, getPrivateSignedDownloadUrl, listAllObjects } from "@/lib/storage/r2";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/backup-restore";

/** Core business tables, in FK-safe (parents-first) order. Excludes
 * security-sensitive/ephemeral tables (login_attempts, otp_codes,
 * trusted_devices, personal_access_tokens, migrations) and backup
 * metadata itself (backups, backup_logs). */
const BACKUP_TABLES = [
  "users",
  "subscription_plans",
  "subscription_plan_features",
  "countries",
  "pages",
  "content_page_sections",
  "products",
  "redirect_links",
  "digital_products",
  "digital_product_sales",
  "digital_product_email_verifications",
  "subscriptions",
  "payments",
  "payment_attempt_logs",
  "coupons",
  "coupon_redemptions",
  "support_tickets",
  "redirect_page_settings",
  "redirect_page_products",
  "system_settings",
  "backup_settings",
  "links",
  "analytics_events",
  "link_scan_history",
  "error_logs",
  "user_stores",
  "user_default_stores",
  "user_social_media",
  "user_landing_sections",
] as const;

type DbDump = { generated_at: string; tables: Record<string, unknown[]> };

async function dumpDatabase(): Promise<DbDump> {
  const supabase = createAdminClient();
  const tables: Record<string, unknown[]> = {};
  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw new Error(`Failed to read table "${table}": ${error.message}`);
    tables[table] = data ?? [];
  }
  return { generated_at: new Date().toISOString(), tables };
}

async function logBackupAction(backupId: number, message: string, statusColor: string, icon: string) {
  const supabase = createAdminClient();
  await supabase.from("backup_logs").insert({ backup_id: backupId, action: "backup", type: "info", message, status_color: statusColor, icon });
}

export async function runBackupAction(type: "full" | "database" | "files") {
  await requireAdmin();
  const supabase = createAdminClient();
  const startedAt = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const { data: backup, error: insertError } = await supabase
    .from("backups")
    .insert({
      name: `${type}-${timestamp}`,
      type,
      trigger: "manual",
      destination: "r2",
      status: "running",
      includes: type === "full" ? "database,files-manifest" : type === "database" ? "database" : "files-manifest",
    })
    .select("*")
    .single();
  if (insertError) throw new Error(insertError.message);

  try {
    let totalSize = 0;
    let dbKey: string | null = null;
    let filesKey: string | null = null;

    if (type === "full" || type === "database") {
      const dump = await dumpDatabase();
      const json = JSON.stringify(dump);
      const gzipped = gzipSync(Buffer.from(json, "utf-8"));
      dbKey = `backups/db/${backup.id}-${timestamp}.json.gz`;
      await uploadPrivateObject(dbKey, gzipped, "application/gzip");
      totalSize += gzipped.length;
    }

    if (type === "full" || type === "files") {
      const manifest = await listAllObjects();
      const json = JSON.stringify({ generated_at: new Date().toISOString(), objects: manifest });
      const gzipped = gzipSync(Buffer.from(json, "utf-8"));
      filesKey = `backups/files-manifest/${backup.id}-${timestamp}.json.gz`;
      await uploadPrivateObject(filesKey, gzipped, "application/gzip");
      totalSize += gzipped.length;
    }

    const s3Key = [dbKey, filesKey].filter(Boolean).join(";");
    const checksum = createHash("sha256").update(s3Key + totalSize).digest("hex").slice(0, 16);

    await supabase
      .from("backups")
      .update({
        status: "completed",
        s3_key: s3Key,
        size: totalSize,
        checksum,
        duration: Math.round((Date.now() - startedAt) / 1000),
      })
      .eq("id", backup.id);

    await logBackupAction(backup.id, `${type} backup completed successfully.`, "green", "check_circle");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await supabase
      .from("backups")
      .update({ status: "failed", error_message: message, duration: Math.round((Date.now() - startedAt) / 1000) })
      .eq("id", backup.id);
    await logBackupAction(backup.id, `${type} backup failed: ${message}`, "red", "error");
    throw new Error(message);
  }

  revalidatePath(BASE);
}

export async function deleteBackupAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: backup } = await supabase.from("backups").select("s3_key").eq("id", id).maybeSingle();
  if (backup?.s3_key) {
    for (const key of backup.s3_key.split(";").filter(Boolean)) {
      await deletePrivateObject(key).catch(() => {});
    }
  }
  await supabase.from("backup_logs").delete().eq("backup_id", id);
  const { error } = await supabase.from("backups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(BASE);
}

export async function getBackupDownloadUrlAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: backup } = await supabase.from("backups").select("name, s3_key").eq("id", id).maybeSingle();
  if (!backup?.s3_key) throw new Error("Backup has no stored file.");
  const firstKey = backup.s3_key.split(";")[0];
  return getPrivateSignedDownloadUrl(firstKey, `${backup.name}.json.gz`);
}

export async function verifyBackupAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: backup } = await supabase.from("backups").select("s3_key").eq("id", id).maybeSingle();
  if (!backup?.s3_key) throw new Error("Backup has no stored file.");

  for (const key of backup.s3_key.split(";").filter(Boolean)) {
    await downloadPrivateObject(key);
  }
  await supabase.from("backup_logs").insert({ backup_id: id, action: "verify", type: "info", message: "Backup verified — file is readable in R2.", status_color: "green", icon: "verified" });
  revalidatePath(BASE);
}

export async function cleanOldBackupsAction() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from("backup_settings").select("key, value").in("key", ["retention_days", "max_backups"]);
  const map = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));
  const retentionDays = Number(map.retention_days ?? 30);

  const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString();
  const { data: old } = await supabase.from("backups").select("id, s3_key").lt("created_at", cutoff);

  for (const b of old ?? []) {
    if (b.s3_key) {
      for (const key of b.s3_key.split(";").filter(Boolean)) await deletePrivateObject(key).catch(() => {});
    }
    await supabase.from("backup_logs").delete().eq("backup_id", b.id);
    await supabase.from("backups").delete().eq("id", b.id);
  }

  revalidatePath(BASE);
  return { removed: old?.length ?? 0 };
}

export async function updateBackupSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const fields: Record<string, string> = {
    auto_backup_enabled: formData.get("auto_backup_enabled") === "on" ? "1" : "0",
    auto_backup_frequency: String(formData.get("auto_backup_frequency") ?? "every_6_hours"),
    auto_backup_type: String(formData.get("auto_backup_type") ?? "full"),
    retention_days: String(Number(formData.get("retention_days") ?? 30)),
    max_backups: String(Number(formData.get("max_backups") ?? 50)),
    auto_delete_old: formData.get("auto_delete_old") === "on" ? "1" : "0",
    notify_backup_completed: formData.get("notify_backup_completed") === "on" ? "1" : "0",
    notify_backup_failed: formData.get("notify_backup_failed") === "on" ? "1" : "0",
    notify_restore_completed: formData.get("notify_restore_completed") === "on" ? "1" : "0",
  };

  for (const [key, value] of Object.entries(fields)) {
    const { error } = await supabase.from("backup_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
  }

  revalidatePath(BASE);
}

/**
 * Restores rows from a database backup via per-table upsert (insert or
 * update by primary key) — deliberately NOT a truncate-and-replace. This
 * means rows created after the backup are left untouched, and a restore
 * can never delete data; it only overwrites rows that also exist in the
 * backup. A fresh safety backup is taken first, mirroring the old admin
 * panel's "a safety backup will be created automatically" behavior.
 */
export async function runRestoreAction(backupId: number) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { data: backup } = await supabase.from("backups").select("*").eq("id", backupId).maybeSingle();
  if (!backup?.s3_key) throw new Error("Backup not found or has no stored file.");
  const dbKey = backup.s3_key.split(";").find((k: string) => k.includes("/db/"));
  if (!dbKey) throw new Error("This backup does not contain a database dump.");

  await runBackupAction("database");

  const gzipped = await downloadPrivateObject(dbKey);
  const dump: DbDump = JSON.parse(gunzipSync(gzipped).toString("utf-8"));

  const results: { table: string; restored: number; failed: number }[] = [];

  for (const table of BACKUP_TABLES) {
    const rows = dump.tables[table];
    if (!rows || rows.length === 0) continue;
    let restored = 0;
    let failed = 0;
    for (const row of rows) {
      const { error } = await supabase.from(table).upsert(row as Record<string, unknown>, { onConflict: "id" });
      if (error) failed++;
      else restored++;
    }
    results.push({ table, restored, failed });
  }

  await supabase.from("backup_logs").insert({
    backup_id: backupId,
    action: "restore",
    type: "warning",
    message: `Restore run by admin #${admin.id}: ${results.reduce((s, r) => s + r.restored, 0)} rows restored across ${results.length} tables.`,
    details: JSON.stringify(results),
    status_color: "blue",
    icon: "restore",
  });

  revalidatePath(BASE);
  return results;
}
