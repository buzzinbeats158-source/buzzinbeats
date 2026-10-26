"use client";

import { useMemo, useState } from "react";
import { saveGatewayConfigAction, testGatewayConnectionAction, type TestConnectionResult } from "@/lib/data/admin-payment-gateway";
import type { GatewayConfig } from "@/lib/payment-gateway";

type Payment = {
  id: number;
  invoice_number: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  user_id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscriptions: any;
};

type Subscription = {
  id: number;
  status: string;
  plan: string;
  started_at: string | null;
  user_id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any;
};

type AttemptLog = {
  id: number;
  user_id: number | null;
  plan_key: string | null;
  stage: string;
  status: string;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any;
};

function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

// Explicit timeZone keeps server-rendered and client-rendered output
// identical regardless of the runtime's system timezone — omitting it
// caused a hydration mismatch (Vercel's server runs UTC, browsers run
// local time).
function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function statusColor(s: string) {
  if (s === "paid") return "bg-green-100 text-green-700";
  if (s === "created" || s === "pending") return "bg-amber-100 text-amber-700";
  if (s === "failed") return "bg-red-100 text-red-700";
  if (s === "refunded") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-500";
}

function statusIcon(s: string) {
  if (s === "paid") return "check_circle";
  if (s === "created" || s === "pending") return "pending";
  if (s === "failed") return "cancel";
  if (s === "refunded") return "replay";
  return "help";
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function RazorpayGatewayPanel({
  config,
  payments,
  subscriptions,
  attemptLogs,
}: {
  config: GatewayConfig;
  payments: Payment[];
  subscriptions: Subscription[];
  attemptLogs: AttemptLog[];
}) {
  const [editKeyId, setEditKeyId] = useState(config.keyId);
  const [editEnvironment, setEditEnvironment] = useState<"test" | "live">(config.environment);
  const [editWebhook, setEditWebhook] = useState(config.webhookUrl);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const [connStatus, setConnStatus] = useState(config.lastConnectionStatus);
  const [lastChecked, setLastChecked] = useState(config.lastConnectionCheck);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "created" | "failed">("all");

  async function handleSave(formData: FormData) {
    setSaving(true);
    setSaveMsg("");
    try {
      await saveGatewayConfigAction(formData);
      setSaveMsg("Saved successfully.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveMsg("Error: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    const result = await testGatewayConnectionAction();
    setTestResult(result);
    setConnStatus(result.ok ? "connected" : "failed");
    setLastChecked(new Date().toISOString());
    setTesting(false);
  }

  function handleCopy() {
    if (!config.keyId) return;
    navigator.clipboard.writeText(config.keyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const paid = payments.filter((p) => p.status === "paid");
    const failed = payments.filter((p) => p.status === "failed");
    const pending = payments.filter((p) => p.status === "created" || p.status === "pending");
    return {
      todayRevenue: paid.filter((p) => p.created_at >= todayStart).reduce((a, p) => a + Number(p.amount), 0),
      monthRevenue: paid.filter((p) => p.created_at >= monthStart).reduce((a, p) => a + Number(p.amount), 0),
      allTimeRevenue: paid.reduce((a, p) => a + Number(p.amount), 0),
      successCount: paid.length,
      failedCount: failed.length,
      pendingCount: pending.length,
    };
  }, [payments]);

  const subStats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const expired = subscriptions.filter((s) => s.status === "expired" || s.status === "cancelled");
    const lastActivated = [...active].sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""))[0] ?? null;
    const lastFailed = attemptLogs[0] ?? null;
    return {
      activeCount: active.length,
      expiredCount: expired.length,
      lastActivated,
      lastFailed,
    };
  }, [subscriptions, attemptLogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q) {
        const owner = one(p.users);
        const name = (owner?.name ?? "").toLowerCase();
        const email = (owner?.email ?? "").toLowerCase();
        const orderId = (p.razorpay_order_id ?? "").toLowerCase();
        const paymentId = (p.razorpay_payment_id ?? "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !orderId.includes(q) && !paymentId.includes(q)) return false;
      }
      return true;
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="max-w-7xl space-y-8">
      <div>
        <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          System Settings
        </span>
        <h1 className="text-3xl font-bold text-slate-900">Payment Gateway</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your Razorpay integration, configuration, and monitor payment health.</p>
      </div>

      {/* Status banner */}
      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          connStatus === "connected" ? "border-green-200 bg-green-50" : connStatus === "failed" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <span className="material-symbols-outlined text-[28px] text-primary">payments</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">Razorpay</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    connStatus === "connected" ? "bg-green-100 text-green-700" : connStatus === "failed" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">{connStatus === "connected" ? "check_circle" : connStatus === "failed" ? "cancel" : "help"}</span>
                  {connStatus === "connected" ? "Connected" : connStatus === "failed" ? "Disconnected" : "Unknown"}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${editEnvironment === "live" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  <span className="material-symbols-outlined text-[12px]">{editEnvironment === "live" ? "public" : "science"}</span>
                  {editEnvironment === "live" ? "Live" : "Test"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  <span className="material-symbols-outlined text-[12px]">currency_rupee</span>
                  {config.currency}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {lastChecked ? (
                  <>
                    Last checked: {fmt(lastChecked)}
                    {connStatus === "failed" && config.lastConnectionError && <span className="ml-2 text-red-600">— {config.lastConnectionError}</span>}
                  </>
                ) : (
                  "No connection test performed yet."
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {testing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Testing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">wifi_tethering</span> Test Connection
                </>
              )}
            </button>
            {testResult && (
              <p className={`text-xs font-semibold ${testResult.ok ? "text-green-700" : "text-red-600"}`}>
                <span className="material-symbols-outlined mr-0.5 align-middle text-[13px]">{testResult.ok ? "check_circle" : "cancel"}</span>
                {testResult.message}
              </p>
            )}
          </div>
        </div>

        {testResult && (
          <div className="mt-4 border-t border-slate-100 pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              Diagnostic Report
            </p>
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {Object.entries(testResult.diagnostic).map(([k, v]) => {
                const isFail = /^(fail|unreachable|missing|error)/i.test(v);
                const isOk = /^(success|connected|reachable)/i.test(v);
                return (
                  <div key={k} className="flex items-start gap-3 border-b border-slate-50 py-1.5 last:border-0">
                    <span className={`material-symbols-outlined mt-0.5 shrink-0 text-[14px] ${isFail ? "text-red-600" : isOk ? "text-green-700" : "text-slate-400"}`}>
                      {isFail ? "cancel" : isOk ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{k}</span>
                      <p className={`mt-0.5 break-words text-xs font-medium ${isFail ? "text-red-600" : isOk ? "text-green-700" : "text-slate-600"}`}>{v}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Configuration panel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
          <h3 className="text-base font-extrabold text-slate-900">Configuration</h3>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <form action={handleSave} className="space-y-5 p-6">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Key ID (Public)</label>
              <div className="flex items-center gap-2">
                <input
                  name="key_id"
                  type="text"
                  value={editKeyId}
                  onChange={(e) => setEditKeyId(e.target.value)}
                  placeholder="rzp_test_xxxxxxxxxxxx"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {config.keyId && (
                  <button type="button" onClick={handleCopy} title="Copy key ID" className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100">
                    <span className="material-symbols-outlined text-[18px] text-primary">{copied ? "check" : "content_copy"}</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Secret Key</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 select-none rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-sm text-slate-400">••••••••••••••••••••••••</div>
                <div className="rounded-xl border border-slate-200 bg-slate-100 p-2.5">
                  <span className="material-symbols-outlined text-[18px] text-slate-300">lock</span>
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">Stored as a Vercel Environment Variable — never exposed here.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Environment</label>
              <select
                name="environment"
                value={editEnvironment}
                onChange={(e) => setEditEnvironment(e.target.value as "test" | "live")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="test">Test (Sandbox)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Webhook URL</label>
              <input
                name="webhook_url"
                type="url"
                value={editWebhook}
                onChange={(e) => setEditWebhook(e.target.value)}
                placeholder="https://buzzinbeats.com/webhooks/razorpay"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60">
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span> Save Changes
                  </>
                )}
              </button>
              {saveMsg && <span className={`text-xs font-semibold ${saveMsg.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>{saveMsg}</span>}
            </div>
          </form>

          <div className="bg-slate-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">info</span>
              <h4 className="text-sm font-bold text-slate-900">Security Notice</h4>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              The secret key is stored securely as a <strong>Vercel Environment Variable</strong> and is never exposed through the admin panel or database.
            </p>
            <p className="mb-4 text-sm text-slate-600">
              <strong>Key ID, Environment, and Webhook URL take effect immediately</strong> after you click Save — no redeploy needed. Only the Secret Key below requires the CLI step and a redeploy.
            </p>

            <div className="mb-4 space-y-2 rounded-xl bg-slate-900 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">CLI Commands</p>
              <p className="font-mono text-xs text-primary/80">vercel env add RAZORPAY_KEY_SECRET production</p>
              <p className="font-mono text-xs text-primary/80">vercel deploy --prod</p>
            </div>

            <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-amber-600">warning</span>
              <p className="text-xs text-amber-800">
                Changes to the secret key take effect after <strong>redeploying to Vercel</strong>. Run <code className="rounded bg-amber-200 px-1 text-[10px]">vercel deploy --prod</code> after updating.
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Useful Links</p>
              <div className="space-y-1.5">
                <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Razorpay Dashboard → API Keys
                </a>
                <a href="https://razorpay.com/docs/webhooks/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Razorpay Webhook Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">bar_chart</span>
          <h3 className="text-base font-extrabold text-slate-900">Payment Statistics</h3>
          <span className="text-xs text-slate-500">(from last 50 transactions)</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Today's Revenue" value={`₹${stats.todayRevenue.toFixed(0)}`} icon="today" color="bg-primary/10 text-primary" />
          <StatCard label="Monthly Revenue" value={`₹${stats.monthRevenue.toFixed(0)}`} icon="calendar_month" color="bg-sky-100 text-sky-700" />
          <StatCard label="All-Time Revenue" value={`₹${stats.allTimeRevenue.toFixed(0)}`} icon="currency_rupee" color="bg-amber-100 text-amber-700" />
          <StatCard label="Successful" value={stats.successCount} icon="check_circle" color="bg-green-100 text-green-700" />
          <StatCard label="Failed" value={stats.failedCount} icon="cancel" color="bg-red-100 text-red-700" />
          <StatCard label="Pending" value={stats.pendingCount} icon="pending" color="bg-slate-100 text-slate-500" />
        </div>
      </section>

      {/* Subscription Integration */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <span className="material-symbols-outlined text-[20px] text-primary">workspace_premium</span>
          <h3 className="text-base font-extrabold text-slate-900">Subscription Integration</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
            <span className="material-symbols-outlined text-[24px] text-green-700">check_circle</span>
            <div>
              <p className="text-2xl font-extrabold text-green-700">{subStats.activeCount}</p>
              <p className="text-xs font-semibold text-green-700/80">Active Subscriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <span className="material-symbols-outlined text-[24px] text-red-600">cancel</span>
            <div>
              <p className="text-2xl font-extrabold text-red-600">{subStats.expiredCount}</p>
              <p className="text-xs font-semibold text-red-600/80">Expired / Cancelled</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Last Activated</p>
            {subStats.lastActivated ? (
              <>
                <p className="truncate text-sm font-bold text-slate-900">{one(subStats.lastActivated.users)?.name ?? one(subStats.lastActivated.users)?.email}</p>
                <p className="text-xs font-semibold text-primary">{subStats.lastActivated.plan}</p>
                <p className="mt-1 text-[10px] text-slate-500">{fmtDate(subStats.lastActivated.started_at)}</p>
              </>
            ) : (
              <p className="text-xs text-slate-500">No active subscriptions yet.</p>
            )}
          </div>
          <div className="rounded-xl bg-red-50/60 p-4">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Last Failed Payment</p>
            {subStats.lastFailed ? (
              <>
                <p className="truncate text-sm font-bold text-slate-900">{one(subStats.lastFailed.users)?.name ?? one(subStats.lastFailed.users)?.email ?? "Guest"}</p>
                <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-red-600">{subStats.lastFailed.error_message ?? "No reason provided"}</p>
                <p className="mt-1 text-[10px] text-slate-500">{fmt(subStats.lastFailed.created_at)}</p>
              </>
            ) : (
              <p className="text-xs text-slate-500">No failed payments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payment Logs */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
          <h3 className="text-base font-extrabold text-slate-900">Recent Payment Logs</h3>
          <span className="text-xs text-slate-500">(last 50)</span>
        </div>

        <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-300">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or order/payment ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "paid", "created", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
              >
                {s === "all" ? "All" : s === "paid" ? "Paid" : s === "created" ? "Pending" : "Failed"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-200">receipt_long</span>
            <p className="mt-3 font-semibold text-slate-600">No transactions found</p>
            <p className="mt-1 text-sm text-slate-400">{search || statusFilter !== "all" ? "Try adjusting your filters." : "Transactions will appear here after the first payment."}</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3.5">Payment ID</th>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Plan</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((p) => {
                    const owner = one(p.users);
                    const sub = one(p.subscriptions);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          {p.razorpay_payment_id ? (
                            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">{p.razorpay_payment_id}</span>
                          ) : (
                            <span className="text-xs text-slate-300">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">{p.razorpay_order_id ?? "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-slate-900">{owner?.name ?? "—"}</p>
                          <p className="text-[10px] text-slate-500">{owner?.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{sub?.plan ?? "—"}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">₹{p.amount}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColor(p.status)}`}>
                            <span className="material-symbols-outlined text-[12px]">{statusIcon(p.status)}</span>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{fmt(p.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-500">
              <span>
                Showing {filtered.length} of {payments.length} transaction{payments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Failed Attempts (Pre-Order) */}
      {attemptLogs.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-red-600">error_outline</span>
            <h3 className="text-base font-extrabold text-slate-900">Failed Attempts (Pre-Order)</h3>
            <span className="text-xs text-slate-500">— attempts that never produced a transaction row</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3.5">Stage</th>
                    <th className="px-5 py-3.5">Plan</th>
                    <th className="px-5 py-3.5">Error</th>
                    <th className="px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attemptLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-xs text-slate-600">{a.stage}</td>
                      <td className="px-5 py-4 text-xs text-slate-600">{a.plan_key ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className="rounded bg-red-50 px-2 py-0.5 font-mono text-[11px] text-red-600">{a.error_code ?? "ERR"}</span>
                        <p className="mt-1 text-[10px] text-slate-500">{a.error_message}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{fmt(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
