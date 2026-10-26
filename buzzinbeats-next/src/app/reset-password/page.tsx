"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    // Supabase's recovery link already established a session via the
    // callback redirect (see middleware/proxy.ts) — updateUser() here
    // sets the new password on that session.
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      heading={
        <>
          New <span className="text-primary">Password</span>
        </>
      }
      subheading="Create a strong password for your account."
    >
      <div className="p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700" htmlFor="password">
              New Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700" htmlFor="password_confirmation">
              Confirm Password
            </label>
            <PasswordInput
              id="password_confirmation"
              name="password_confirmation"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-warm py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? "Saving..." : "Reset Password"}</span>
            <span className="material-symbols-outlined text-xl">update</span>
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
