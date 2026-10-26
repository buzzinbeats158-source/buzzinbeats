"use client";

import Link from "next/link";
import { toggleCouponAction, duplicateCouponAction, deleteCouponAction } from "@/lib/data/coupons";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/coupons";

export default function CouponRowActions({ id, code, status }: { id: number; code: string; status: string }) {
  return (
    <div className="flex justify-end gap-1">
      <Link href={`${BASE}?edit=${id}`} title="Edit" className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-primary">
        <span className="material-symbols-outlined text-lg">edit</span>
      </Link>
      <form
        action={async () => {
          await toggleCouponAction(id, status);
        }}
      >
        <button
          type="submit"
          title={status === "active" ? "Pause" : "Activate"}
          className={`rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-100 ${status === "active" ? "hover:text-yellow-600" : "hover:text-emerald-600"}`}
        >
          <span className="material-symbols-outlined text-lg">{status === "active" ? "pause_circle" : "play_circle"}</span>
        </button>
      </form>
      <form
        action={async () => {
          await duplicateCouponAction(id);
        }}
      >
        <button type="submit" title="Duplicate" className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-primary">
          <span className="material-symbols-outlined text-lg">content_copy</span>
        </button>
      </form>
      <form
        onSubmit={(e) => {
          if (!confirm(`Delete coupon ${code}? This cannot be undone.`)) e.preventDefault();
        }}
        action={async () => {
          await deleteCouponAction(id);
        }}
      >
        <button type="submit" title="Delete" className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500">
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </form>
    </div>
  );
}
