"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { api, type CommunityRenderOut } from "@/lib/api";

/** Same gradient seed as /community/feed so a tile and its detail look related. */
function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  const hue2 = (hue + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${hue2} 60% 18%))`;
}

export default function RemixPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<CommunityRenderOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .communityFeedItem(id)
      .then((data) => !cancelled && setItem(data))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed"));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <Link
          href="/community/feed"
          className="mb-4 inline-block text-xs text-muted hover:text-gold"
        >
          ← Community Feed
        </Link>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        {item === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          item && (
            <article className="rounded-2xl border border-border bg-surface p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
                    Original Render
                  </h2>
                  <div
                    className="relative aspect-video overflow-hidden rounded-xl border border-border"
                    style={{ background: gradientFor(item.id) }}
                  >
                    <div className="absolute inset-0 flex items-end p-4">
                      <p className="line-clamp-4 text-sm text-text drop-shadow">{item.prompt}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gold">@{item.author}</span>
                    <span className="text-muted">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
                    Original Prompt
                  </h2>
                  <p
                    data-testid="remix-prompt"
                    className="rounded-md border border-border bg-surface-2 p-4 text-sm text-text"
                  >
                    {item.prompt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/studio?prompt=${encodeURIComponent(item.prompt)}`}
                      className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    >
                      Use This Prompt
                    </Link>
                    {item.output_file_id && (
                      <Link
                        href={`/render/${item.id}`}
                        className="text-xs text-muted hover:text-gold"
                      >
                        View original render →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        )}
      </main>
    </>
  );
}
