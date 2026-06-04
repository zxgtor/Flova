import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-8 py-24 text-center">
      <Image
        src="/mockups/hero-bg.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center opacity-25"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 40%, rgba(201,162,75,0.35), transparent 70%), linear-gradient(to bottom, rgba(14,15,18,0.6), rgba(14,15,18,0.9))",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <h1 className="font-display text-5xl font-semibold leading-tight">
          Forge Your Imagination <span className="text-gold-gradient">into Motion</span>
        </h1>
        <p className="mt-6 text-lg text-muted">
          Create characters, voices, and stories — then generate real video with self-hosted AI.
        </p>
        <Link
          href="/studio"
          className="mt-10 inline-block rounded-lg bg-gold px-8 py-3 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Start Forging
        </Link>
      </div>
    </section>
  );
}
