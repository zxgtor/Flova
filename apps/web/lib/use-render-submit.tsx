"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  composePromptWithDefaults,
  fetchRenderDefaults,
} from "@/lib/render-defaults";

/**
 * Studio render submission — pulled out so the 7 studio pages don't each
 * re-implement the same plumbing.
 *
 * Returns:
 *   - submit(prompt): POSTs /api/render, then router.replace("/render/<id>").
 *   - Status: ready  → "Submit & Render" button via children render-prop
 *             busy   → "Submitting…"
 *             error  → red inline message + retry available
 *             signedOut → "Sign in to render" link
 */
export function useRenderSubmit(returnPath: string) {
  const auth = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (prompt: string) => {
      if (!auth.token || !prompt.trim()) return;
      setBusy(true);
      setError(null);
      try {
        // Auto-apply user's render defaults. Best-effort: if the fetch fails
        // (e.g., backend down for that endpoint), submit the raw prompt.
        let final = prompt;
        try {
          const { values } = await fetchRenderDefaults(auth.token);
          final = composePromptWithDefaults(prompt, values);
        } catch {
          /* fall back to raw prompt */
        }
        const job = await api.submitRender(auth.token, final);
        router.replace(`/render/${job.id}`);
      } catch (e) {
        setError(e instanceof ApiError ? e.detail : "Submission failed");
        setBusy(false);
      }
    },
    [auth.token, router],
  );

  const ready = !auth.loading && !!auth.token;
  const signedOut = !auth.loading && !auth.token;

  return { ready, signedOut, busy, error, submit, returnPath };
}

/** Primary CTA renderer — shows Sign in link when needed, error banner when present. */
export function RenderCTA({
  state,
  prompt,
  label = "Submit & Render",
  promptPreview = false,
}: {
  state: ReturnType<typeof useRenderSubmit>;
  prompt: string;
  label?: string;
  promptPreview?: boolean;
}) {
  if (state.signedOut) {
    return (
      <Link
        href={`/signin?next=${encodeURIComponent(state.returnPath)}`}
        className="rounded-md border border-gold px-5 py-2 text-sm text-gold hover:bg-gold/10"
      >
        Sign in to render
      </Link>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => state.submit(prompt)}
        disabled={!state.ready || state.busy || !prompt.trim()}
        className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-6 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
      >
        {state.busy ? "Submitting…" : label}
      </button>
      {state.error && (
        <p role="alert" className="text-xs text-red-300">
          {state.error}
        </p>
      )}
      {promptPreview && prompt && (
        <p className="max-w-xl text-center text-[10px] text-muted">
          Will render: <span className="italic text-text">&ldquo;{prompt}&rdquo;</span>
        </p>
      )}
    </div>
  );
}
