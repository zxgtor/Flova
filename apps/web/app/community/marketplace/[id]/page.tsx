"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type MarketplaceStyleOut } from "@/lib/api";

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${(hue + 60) % 360} 60% 18%))`;
}

function applyStyle(template: string, prompt: string): string {
  return template.includes("{prompt}")
    ? template.replace(/\{prompt\}/g, prompt)
    : `${prompt}, ${template}`;
}

export default function StyleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();
  const router = useRouter();

  const [style, setStyle] = useState<MarketplaceStyleOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStyle(await api.marketplaceStyle(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onImport() {
    if (!auth.token || !style) {
      router.push(`/signin?next=/community/marketplace/${id}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const imported = await api.importMarketplaceStyle(auth.token, style.id);
      router.push(`/manage/styles/${imported.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setBusy(false);
    }
  }

  const template = (style?.payload.prompt_template as string) ?? "";
  const description = (style?.payload.description as string) ?? "";

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <Link
          href="/community/marketplace"
          className="mb-4 inline-block text-xs text-muted hover:text-gold"
        >
          ← Marketplace
        </Link>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        {style === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          style && (
            <article className="rounded-2xl border border-border bg-surface p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div
                  className="relative aspect-video overflow-hidden rounded-xl border border-border"
                  style={{ background: gradientFor(style.id) }}
                >
                  <div className="absolute inset-0 flex items-end p-4">
                    <p className="line-clamp-3 text-sm text-text drop-shadow">{template}</p>
                  </div>
                </div>
                <div>
                  <h1 className="font-display text-2xl">{style.name}</h1>
                  <p className="mt-1 text-sm text-muted">
                    By <span className="text-gold">@{style.author}</span> ·{" "}
                    {new Date(style.created_at).toLocaleDateString()}
                  </p>
                  {description && (
                    <p className="mt-4 text-sm text-text">{description}</p>
                  )}
                  <button
                    type="button"
                    onClick={onImport}
                    disabled={busy}
                    data-testid="import-button"
                    className="mt-6 w-full rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
                  >
                    {busy ? "Importing…" : auth.token ? "Import to my Library" : "Sign in to Import"}
                  </button>
                </div>
              </div>

              <section className="mt-8">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-muted">
                  Prompt template
                </h2>
                <pre
                  data-testid="template-block"
                  className="overflow-x-auto rounded-md border border-border bg-surface-2 p-3 font-mono text-xs text-text"
                >
                  {template}
                </pre>
                <p className="mt-2 text-[10px] text-muted">
                  <code className="text-gold">{"{prompt}"}</code> is replaced with your text at
                  render time.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-muted">Preview</h2>
                <p className="rounded-md border border-border bg-surface-2 p-3 text-sm text-text">
                  &ldquo;{applyStyle(template, "a sunset over the ocean")}&rdquo;
                </p>
              </section>
            </article>
          )
        )}
      </main>
    </>
  );
}
