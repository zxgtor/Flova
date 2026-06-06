"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Logo } from "@/components/brand/Logo";

type Mode = "signin" | "register";

const COPY: Record<Mode, { title: string; cta: string; switchTo: string; switchHref: string; switchLabel: string }> = {
  signin: {
    title: "Sign in to Flova",
    cta: "Sign in",
    switchTo: "Need an account?",
    switchHref: "/register",
    switchLabel: "Create one",
  },
  register: {
    title: "Create your Flova account",
    cta: "Create account",
    switchTo: "Already have an account?",
    switchHref: "/signin",
    switchLabel: "Sign in",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";
  const carryPrompt = params.get("prompt");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[mode];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") await auth.signIn(email, password);
      else await auth.register(email, password, displayName);
      const url = carryPrompt
        ? `/studio?prompt=${encodeURIComponent(carryPrompt)}`
        : next;
      router.push(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <Link href="/" aria-label="Flova home" className="mb-8 self-center">
        <Logo />
      </Link>
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-border bg-surface p-8"
      >
        <h1 className="mb-6 font-display text-xl">{copy.title}</h1>
        {mode === "register" && (
          <label className="mb-4 block text-xs uppercase tracking-wider text-muted">
            Display name
            <input
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
            />
          </label>
        )}
        <label className="mb-4 block text-xs uppercase tracking-wider text-muted">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
          />
        </label>
        <label className="mb-4 block text-xs uppercase tracking-wider text-muted">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
          />
        </label>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
        >
          {submitting ? "…" : copy.cta}
        </button>
        <div className="mt-4 text-center text-xs text-muted">
          {copy.switchTo}{" "}
          <Link href={copy.switchHref} className="text-gold hover:underline">
            {copy.switchLabel}
          </Link>
        </div>
      </form>
    </main>
  );
}
