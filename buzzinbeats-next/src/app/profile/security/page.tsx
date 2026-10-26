"use client";

import { useState } from "react";
import { updatePasswordAction } from "@/lib/data/profile";

export default function SecuritySettingsPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    try {
      await updatePasswordAction(formData);
      setStatus("done");
      setMessage("Password updated successfully.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Account Security</h1>
          <p className="mt-1 text-slate-500">Manage your password.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Account Secure
        </span>
      </div>

      <section className="overflow-hidden rounded-[2.5rem] border border-orange-100 bg-white shadow-sm">
        <div className="border-b border-orange-50 p-8">
          <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
          <p className="mt-1 text-sm text-slate-500">We recommend using a strong password that you don&apos;t use elsewhere.</p>
        </div>
        <form action={handleSubmit} className="max-w-2xl space-y-6 p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <label className="ml-1 text-sm font-bold text-slate-700">New Password</label>
              <input
                name="new_password"
                type="password"
                required
                minLength={6}
                className="h-14 rounded-2xl border border-orange-100 bg-slate-50 px-5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="ml-1 text-sm font-bold text-slate-700">Confirm Password</label>
              <input
                name="confirm_password"
                type="password"
                required
                minLength={6}
                className="h-14 rounded-2xl border border-orange-100 bg-slate-50 px-5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
          {message && (
            <p className={`text-sm font-bold ${status === "error" ? "text-red-600" : "text-green-600"}`}>{message}</p>
          )}
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-2xl bg-primary px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {status === "saving" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
