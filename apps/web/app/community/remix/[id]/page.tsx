import Image from "next/image";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";

type Props = { params: Promise<{ id: string }> };

export default async function RemixPage({ params }: Props) {
  await params; // accept id but not used in mock
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <article className="rounded-2xl border border-border bg-surface p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Original Video</h2>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
                <Image
                  src="/mockups/showcase-1.png"
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="Play"
                  className="absolute inset-0 flex items-center justify-center text-4xl text-gold"
                >
                  ▶
                </button>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Original Recipe</h2>
              <p className="text-sm text-text">
                A mesmerizing cinematic journey through a bioluminescent forest at twilight,
                surreal and dreamlike, with flowing golden energy, captured in 8k resolution.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {["Cinematic", "8k", "Surreal"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-surface-2 px-3 py-1 text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="uppercase tracking-wider text-muted">Seed</dt>
                  <dd className="text-text">123456789</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-muted">Motion Intensity</dt>
                  <dd className="text-text">0.75 (High)</dd>
                </div>
              </dl>
              <Link
                href="/studio?prompt=Use+this+remix+recipe"
                className="mt-6 inline-block rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
              >
                Use This Prompt
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
