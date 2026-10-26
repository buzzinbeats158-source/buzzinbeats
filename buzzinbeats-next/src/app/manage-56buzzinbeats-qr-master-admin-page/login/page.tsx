"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkCurrentUserIsAdminAction } from "@/lib/data/admin-actions";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

const DASHBOARD_URL = "/manage-56buzzinbeats-qr-master-admin-page/dashboard";

export default function AdminLoginPage() {
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
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const isAdmin = await checkCurrentUserIsAdminAction();
    if (!isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Access denied. Admins only.");
      return;
    }

    router.push(DASHBOARD_URL);
    router.refresh();
  }

  return (
    <AuthShell
      heading={
        <>
          Admin<span className="text-primary">Panel</span>
        </>
      }
      subheading="Secure Access Only"
    >
      <div className="p-8">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900">Authenticate</h2>
          <p className="mt-1 text-slate-500">Please enter your admin credentials.</p>
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
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-primary">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="ml-1 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <Link className="text-xs font-bold text-primary transition-colors hover:text-primary-warm" href="/forgot-password">
                Forgot password?
              </Link>
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
            <input id="remember" type="checkbox" className="h-4 w-4 rounded accent-primary" />
            <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
              Keep me logged in
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-warm py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Access Dashboard"}</span>
            <span className="material-symbols-outlined text-xl">login</span>
          </button>
        </form>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Authorized Personnel Only</p>
      </div>
    </AuthShell>
  );
}
