import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const SETTINGS_KEYS = [
  "razorpay_key_id",
  "razorpay_environment",
  "razorpay_webhook_url",
  "razorpay_currency",
  "razorpay_last_connection_check",
  "razorpay_last_connection_status",
  "razorpay_last_connection_error",
] as const;

export type GatewayConfig = {
  keyId: string;
  environment: "test" | "live";
  webhookUrl: string;
  currency: string;
  lastConnectionCheck: string | null;
  lastConnectionStatus: "connected" | "failed" | null;
  lastConnectionError: string | null;
};

/** DB-backed Razorpay config — Key ID/Environment/Webhook URL are editable
 * from the admin Payment Gateway page and take effect immediately (no
 * redeploy). Falls back to env vars if never configured in the DB. */
export async function getGatewayConfig(): Promise<GatewayConfig> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("system_settings").select("key, value").in("key", SETTINGS_KEYS);
  const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));

  const keyId = map.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const environment = (map.razorpay_environment as "test" | "live") || (keyId.startsWith("rzp_live_") ? "live" : "test");

  return {
    keyId,
    environment,
    webhookUrl: map.razorpay_webhook_url || "",
    currency: map.razorpay_currency || "INR",
    lastConnectionCheck: map.razorpay_last_connection_check || null,
    lastConnectionStatus: (map.razorpay_last_connection_status as "connected" | "failed") || null,
    lastConnectionError: map.razorpay_last_connection_error || null,
  };
}

export async function getActiveRazorpayKeyId(): Promise<string> {
  const { keyId } = await getGatewayConfig();
  return keyId;
}
