"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <AuthShell
        heading={
          <>
            Check Your <span className="text-primary">Email</span>
          </>
        }
        subheading="A reset link is on its way."
      >
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <span className="material-symbols-outlined text-5xl text-primary">mark_email_read</span>
          </div>
          <p className="text-slate-600">
            If an account exists for <span className="font-semibold text-slate-900">{email}</span>, a
            password reset link is on its way.
          </p>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
          <a
            className="flex items-center justify-center gap-1 text-sm font-bold text-slate-600 transition-colors hover:text-primary"
            href="/login"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
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
          Forgot <span className="text-primary">Password?</span>
        </>
      }
      subheading="No worries, we'll send you reset instructions."
    >
      <div className="p-8">
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {errorMessage}
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

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-warm py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
          >
            <span>Send Reset Link</span>
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </form>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
        <a
          className="flex items-center justify-center gap-1 text-sm font-bold text-slate-600 transition-colors hover:text-primary"
          href="/login"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Login
        </a>
      </div>
    </AuthShell>
  );
}
