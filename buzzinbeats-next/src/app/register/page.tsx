"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Pure client-side UX check — the confirm-password field itself is
    // new, but it never touches the signUp call below.
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // Create the application-side profile row (users table) via a
    // server route — needs the service-role client since RLS has no
    // insert policy for this table (see current-user.ts / migration 0001).
    if (data.user) {
      const res = await fetch("/api/register-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authUserId: data.user.id, name, email }),
      });
      if (!res.ok) {
        setError("Account created, but profile setup failed — contact support.");
        return;
      }
    }

    // Supabase sends a confirmation email by default (email_confirm
    // required before login) — no active session yet in that case.
    if (!data.session) {
      setCheckEmail(true);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <AuthShell
        heading={
          <>
            Check Your <span className="text-primary">Email</span>
          </>
        }
        subheading="You're almost there."
      >
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <span className="material-symbols-outlined text-5xl text-primary">mark_email_read</span>
          </div>
          <p className="text-slate-600">
            We sent a confirmation link to <span className="font-semibold text-slate-900">{email}</span>.
            Click it to activate your account, then log in.
          </p>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
          <a className="font-bold text-primary transition-colors hover:text-primary-warm" href="/login">
            Back to Login
          </a>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      heading={
        <>
          Create <span className="text-primary">Account</span>
        </>
      }
      subheading="Start your journey with BuzzinBeats today."
    >
      <div className="p-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700" htmlFor="name">
              Full Name
            </label>
            <div className="group relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-primary">
                badge
              </span>
              <input
                id="name"
                type="text"
                required
                autoFocus
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

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
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700" htmlFor="password_confirmation">
              Confirm Password
            </label>
            <PasswordInput
              id="password_confirmation"
              name="password_confirmation"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-warm py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? "Creating account..." : "Create My Account"}</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </form>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <a className="font-bold text-primary transition-colors hover:text-primary-warm" href="/login">
            Login here
          </a>
        </p>
      </div>
    </AuthShell>
  );
}
