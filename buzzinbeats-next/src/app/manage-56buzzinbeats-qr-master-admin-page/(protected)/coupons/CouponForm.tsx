"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCouponAction, updateCouponAction, generateCouponCode } from "@/lib/data/coupons";

type Coupon = {
  id: number;
  code: string;
  title: string | null;
  discount_type: string;
  discount_value: number;
  applies_to_plan: string;
  audience_type: string;
  specific_user_id: number | null;
  minimum_amount: number | null;
  usage_limit: number | null;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
};

const PLAN_OPTIONS = [
  { value: "all", label: "All Plans" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "pro", label: "Pro" },
];

function splitDateTime(value: string | null) {
  if (!value) return { date: "", time: "" };
  const iso = value.replace(" ", "T");
  return { date: iso.substring(0, 10), time: iso.substring(11, 16) };
}

export default function CouponForm({ coupon }: { coupon: Coupon | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(coupon?.code ?? "");
  const [discountType, setDiscountType] = useState(coupon?.discount_type ?? "percent");
  const [plan, setPlan] = useState(coupon?.applies_to_plan ?? "all");
  const [audienceType, setAudienceType] = useState(coupon?.audience_type ?? "all");

  const starts = splitDateTime(coupon?.starts_at ?? null);
  const ends = splitDateTime(coupon?.ends_at ?? null);

  async function handleGenerate() {
    const newCode = await generateCouponCode();
    setCode(newCode);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (coupon) {
          await updateCouponAction(coupon.id, formData);
        } else {
          await createCouponAction(formData);
        }
        router.push("/manage-56buzzinbeats-qr-master-admin-page/coupons");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50">
      <div className="border-b border-zinc-100 bg-zinc-50/50 p-5">
        <h2 className="text-lg font-extrabold text-zinc-900">{coupon ? "Edit Coupon" : "Create New Coupon"}</h2>
        <p className="mt-0.5 text-xs font-medium text-zinc-500">{coupon ? "Update coupon settings" : "Configure rules for a new promotion"}</p>
      </div>

      <form action={handleSubmit} className="flex flex-1 flex-col">
        <div className="max-h-[calc(100vh-320px)] flex-1 space-y-5 overflow-y-auto p-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary uppercase">
              <span className="h-[1px] w-4 bg-primary" /> Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Coupon Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={50}
                    required
                    placeholder="e.g. SAVE50"
                    className="flex-1 rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-bold tracking-wider text-zinc-900 uppercase focus:border-primary focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleGenerate}
                    title="Generate random code"
                    className="rounded-xl border-2 border-zinc-100 px-3 py-2.5 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Title (optional)</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={coupon?.title ?? ""}
                  maxLength={100}
                  placeholder="Campaign name"
                  className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Type *</label>
                  <select
                    name="discount_type"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                  >
                    <option value="percent">Percentage</option>
                    <option value="flat">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Value *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount_value"
                      defaultValue={coupon?.discount_value ?? ""}
                      min={0.01}
                      step={0.01}
                      required
                      placeholder="20"
                      className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 pr-9 text-sm font-bold focus:border-primary focus:ring-0"
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-zinc-400">{discountType === "percent" ? "%" : "₹"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary uppercase">
              <span className="h-[1px] w-4 bg-primary" /> Targeting
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Plan Eligibility</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPlan(opt.value)}
                      className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all ${
                        plan === opt.value ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="applies_to_plan" value={plan} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Audience</label>
                <select
                  name="audience_type"
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                >
                  <option value="all">All Users</option>
                  <option value="new_users">New Users Only</option>
                  <option value="existing_users">Existing Users Only</option>
                  <option value="specific_user">Specific User</option>
                </select>
              </div>
              {audienceType === "specific_user" && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">User ID</label>
                  <input
                    type="number"
                    name="specific_user_id"
                    defaultValue={coupon?.specific_user_id ?? ""}
                    placeholder="User ID"
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary uppercase">
              <span className="h-[1px] w-4 bg-primary" /> Limits &amp; Dates
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Start Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="starts_at_date"
                    defaultValue={starts.date}
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs font-medium focus:border-primary focus:ring-0"
                  />
                  <input
                    type="time"
                    name="starts_at_time"
                    defaultValue={starts.time}
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs font-medium focus:border-primary focus:ring-0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">End Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="ends_at_date"
                    defaultValue={ends.date}
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs font-medium focus:border-primary focus:ring-0"
                  />
                  <input
                    type="time"
                    name="ends_at_time"
                    defaultValue={ends.time}
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs font-medium focus:border-primary focus:ring-0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Max Redemptions</label>
                <input
                  type="number"
                  name="usage_limit"
                  defaultValue={coupon?.usage_limit ?? ""}
                  min={1}
                  placeholder="Unlimited if empty"
                  className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Minimum Amount (₹)</label>
                <input
                  type="number"
                  name="minimum_amount"
                  defaultValue={coupon?.minimum_amount ?? ""}
                  min={0}
                  step={0.01}
                  placeholder="No minimum if empty"
                  className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Status</label>
                <select
                  name="status"
                  defaultValue={coupon?.status ?? "active"}
                  className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-0"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-100 bg-zinc-50 p-5">
          {coupon ? (
            <button
              type="button"
              onClick={() => router.push("/manage-56buzzinbeats-qr-master-admin-page/coupons")}
              className="flex-1 rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-100"
            >
              Cancel
            </button>
          ) : (
            <button type="reset" className="flex-1 rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-100">
              Reset
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-95 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg">{coupon ? "save" : "rocket_launch"}</span>
            {isPending ? "Saving…" : coupon ? "Save Changes" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
