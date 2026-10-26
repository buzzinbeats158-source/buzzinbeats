"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

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
          Buzzin<span className="text-primary">Beats</span>
        </>
      }
      subheading="One QR code. Infinite connections."
    >
      <div className="p-8">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-1 text-slate-500">Manage your creator links and analytics.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700" htmlFor="email">
              Email Address
            </label>
            <div className="group relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-primary">
                mail
              </span>
              <input
                id="email"
                type="email"
                required
                autoFocus
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="ml-1 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <a
                className="text-xs font-bold text-primary transition-colors hover:text-primary-warm"
                href="/forgot-password"
              >
                Forgot password?
              </a>
            </div>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center px-1">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
              Keep me logged in
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-warm py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? "Logging in..." : "Login to Dashboard"}</span>
            <span className="material-symbols-outlined text-xl">login</span>
          </button>
        </form>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
        <p className="text-sm text-slate-600">
          New to BuzzinBeats?{" "}
          <a className="font-bold text-primary transition-colors hover:text-primary-warm" href="/register">
            Create Account
          </a>
        </p>
      </div>
    </AuthShell>
  );
}
