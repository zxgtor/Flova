"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { api, type CommunityRenderOut } from "@/lib/api";

/**
 * Stable, eye-pleasing gradient per render id — no thumbnails on disk yet, so we
 * fake a deterministic visual from the id hash.
 */
function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  const hue2 = (hue + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${hue2} 60% 18%))`;
}

export default function CommunityFeedPage() {
  const [items, setItems] = useState<CommunityRenderOut[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .communityFeed(48)
      .then((data) => !cancelled && setItems(data))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed"));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.prompt.toLowerCase().includes(q) ||
        it.author.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">Community Feed</h1>
            <p className="mt-1 text-sm text-muted">
              Renders published by Flova creators. Submit a prompt and toggle Publish
              on the render page to share yours.
            </p>
          </div>
          <Link
            href="/home"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Create your own
          </Link>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts or creators…"
          className="mx-auto mb-6 block w-full max-w-md rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
        />

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        {filtered === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">
            {items && items.length > 0
              ? "Nothing matches that search."
              : "No public renders yet. Be the first — generate something and publish it."}
          </p>
        ) : (
          <ul
            className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            data-testid="feed-list"
          >
            {filtered.map((it) => (
              <li key={it.id} data-testid="feed-tile">
                <Link
                  href={`/render/${it.id}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold"
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden"
                    style={{ background: gradientFor(it.id) }}
                  >
                    <div className="absolute inset-0 flex items-end p-3">
                      <p className="line-clamp-3 text-sm text-text drop-shadow">
                        {it.prompt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs">
                    <span className="truncate text-text">@{it.author}</span>
                    <span className="text-muted">
                      {new Date(it.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
