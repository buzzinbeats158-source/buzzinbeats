"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_PATH = "/manage-56buzzinbeats-qr-master-admin-page/payment-gateway";

async function upsertSetting(key: string, value: string | null) {
  const supabase = createAdminClient();
  await supabase.from("system_settings").upsert({ key, value }, { onConflict: "key" });
}

export async function saveGatewayConfigAction(formData: FormData) {
  await requireAdmin();
  const keyId = (formData.get("key_id") as string) || null;
  const environment = (formData.get("environment") as string) === "live" ? "live" : "test";
  const webhookUrl = (formData.get("webhook_url") as string) || null;

  await Promise.all([
    upsertSetting("razorpay_key_id", keyId),
    upsertSetting("razorpay_environment", environment),
    upsertSetting("razorpay_webhook_url", webhookUrl),
  ]);

  revalidatePath(ADMIN_PATH);
}

export type TestConnectionResult = {
  ok: boolean;
  message: string;
  diagnostic: Record<string, string>;
};

/** Server-side Razorpay credential check — calls Razorpay's own API with
 * Basic Auth (key_id:key_secret), the same check Razorpay's dashboard uses
 * to validate keys. No order is created; this only proves the credentials
 * authenticate. */
export async function testGatewayConnectionAction(): Promise<TestConnectionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", ["razorpay_key_id", "razorpay_environment"]);
  const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
  const keyId = map.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const environment = map.razorpay_environment || (keyId.startsWith("rzp_live_") ? "live" : "test");
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const checkedAt = new Date().toISOString();
  const diagnostic: Record<string, string> = {
    Gateway: "Razorpay",
    Environment: environment === "live" ? "Live (Production)" : "Test (Sandbox)",
    "Key ID": keyId || "—",
  };

  let ok = false;
  let authMessage: string;

  if (!keyId || !secret) {
    authMessage = !keyId ? "Missing Key ID — save one below first" : "Missing RAZORPAY_KEY_SECRET environment variable";
  } else {
    try {
      const auth = Buffer.from(`${keyId}:${secret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
      });
      if (res.ok) {
        ok = true;
        authMessage = "Success — credentials valid";
      } else {
        const body = await res.json().catch(() => null);
        authMessage = `Failed (HTTP ${res.status}) — ${body?.error?.description ?? res.statusText}`;
      }
    } catch (e) {
      authMessage = e instanceof Error ? e.message : "Network error reaching Razorpay";
    }
  }

  diagnostic["Authentication"] = authMessage;
  diagnostic["Razorpay API"] = ok ? "Reachable" : "Unreachable or credentials rejected";
  diagnostic["Last Checked"] = new Date(checkedAt).toLocaleString("en-IN");

  await Promise.all([
    upsertSetting("razorpay_last_connection_check", checkedAt),
    upsertSetting("razorpay_last_connection_status", ok ? "connected" : "failed"),
    upsertSetting("razorpay_last_connection_error", ok ? null : authMessage),
  ]);

  revalidatePath(ADMIN_PATH);

  return {
    ok,
    message: ok ? "All systems operational." : `Authentication failed: ${authMessage}`,
    diagnostic,
  };
}
