import Image from "next/image";
import { STYLE_OF_MONTH } from "@/lib/marketplace-mock";

export function StyleOfMonthBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-gold/40">
      <div className="relative h-40 w-full">
        <Image
          src={STYLE_OF_MONTH.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent p-6">
        <span className="text-xs uppercase tracking-wider text-gold">Featured</span>
        <h2 className="mt-1 font-display text-2xl font-semibold">{STYLE_OF_MONTH.title}</h2>
        <p className="mt-1 max-w-md text-sm text-muted">{STYLE_OF_MONTH.blurb}</p>
        <button
          type="button"
          className="mt-3 rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
        >
          Sell Your Style
        </button>
      </div>
    </section>
  );
}
