"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";

/**
 * Client island that takes a prompt from the URL and submits a render job.
 *
 * - Not signed in → prompts the user to sign in (preserving the prompt).
 * - Signed in     → POSTs /api/render and forwards to /render/[id].
 * - Idempotent    → uses a ref so React Strict-Mode's double effect doesn't double-fire.
 */
export function StudioPrompt({ prompt }: { prompt: string }) {
  const auth = useAuth();
  const router = useRouter();
  const submittedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.loading || !auth.token || submittedRef.current) return;
    submittedRef.current = true;
    api
      .submitRender(auth.token, prompt)
      .then((job) => router.replace(`/render/${job.id}`))
      .catch((err: unknown) => {
        submittedRef.current = false;
        setError(err instanceof ApiError ? err.detail : "Failed to submit render");
      });
  }, [auth.loading, auth.token, prompt, router]);

  if (auth.loading) return <Status>Checking session…</Status>;

  if (!auth.token) {
    const dest = `/signin?prompt=${encodeURIComponent(prompt)}`;
    return (
      <Status>
        <span>You need to sign in to submit a render.</span>
        <Link
          href={dest}
          className="mt-3 inline-block rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
        >
          Sign in to continue
        </Link>
      </Status>
    );
  }

  if (error) return <Status>Submission failed: {error}</Status>;

  return <Status>Submitting your prompt…</Status>;
}

function Status({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-gold/40 bg-surface px-5 py-6 text-center text-sm text-text">
      {children}
    </div>
  );
}
