import Image from "next/image";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";

const SOCIALS = [
  { label: "YouTube", color: "bg-red-500/20 text-red-300" },
  { label: "TikTok", color: "bg-pink-500/20 text-pink-300" },
  { label: "Instagram", color: "bg-violet-500/20 text-violet-300" },
  { label: "LinkedIn", color: "bg-blue-500/20 text-blue-300" },
];

const FORMATS = ["4K Ultra HD", "1080p (Full HD)"];

type Props = { params: Promise<{ id: string }> };

export default async function PublishSuccessPage({ params }: Props) {
  await params;
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-5xl p-6">
        <section className="relative overflow-hidden rounded-2xl border border-gold/50">
          <div className="relative h-64">
            <Image
              src="/mockups/showcase-5.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/40 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-3xl text-gold">
                ✓
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold">Production Complete</h1>
              <p className="mt-1 text-sm text-muted">Your high-end AI video is ready.</p>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Download Original</h2>
            <div className="flex gap-3">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  data-testid="download-format"
                  className="flex-1 rounded-md border border-gold px-3 py-2 text-sm text-gold hover:bg-gold/10"
                >
                  {f}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Copy Public Link</h2>
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs">
              <span className="flex-1 truncate text-muted">https://platform.com/v/123xyz456abc</span>
              <button
                type="button"
                className="rounded-md border border-gold px-2 py-1 text-gold hover:bg-gold/10"
              >
                Copy
              </button>
            </div>
          </section>
        </div>
        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Share to World</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {SOCIALS.map((s) => (
              <div
                key={s.label}
                data-testid="share-target"
                className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <span className={"rounded-full px-2 py-0.5 text-xs " + s.color}>{s.label}</span>
                <button
                  type="button"
                  className="text-xs text-gold hover:underline"
                  aria-label={`Publish to ${s.label}`}
                >
                  Publish
                </button>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-8 flex justify-center">
          <Link
            href="/home"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-6 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Start New Project
          </Link>
        </div>
      </main>
    </>
  );
}
