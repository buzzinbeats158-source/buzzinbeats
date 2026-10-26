"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  autoFocus?: boolean;
};

/**
 * Pure client-side visual toggle for a password field's visibility.
 * Does not touch any auth logic — it only flips the input's `type`.
 */
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  autoFocus,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="group relative">
      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-primary">
        lock
      </span>
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 z-20 flex items-center pr-4 text-slate-400 transition-colors hover:text-primary focus:outline-none"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <span className="material-symbols-outlined text-xl">
          {show ? "visibility_off" : "visibility"}
        </span>
      </button>
    </div>
  );
}
