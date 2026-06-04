import Image from "next/image";
import Link from "next/link";
import type { Template } from "@/lib/templates";

export function TemplateCard({ template }: { template: Template }) {
  return (
    <Link
      href={`/studio?template=${template.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={template.image}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {template.popular && (
          <span className="absolute left-3 top-3 rounded-full border border-gold/60 bg-bg/70 px-2 py-0.5 text-xs font-medium text-gold backdrop-blur">
            Popular
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold">{template.title}</h3>
        <p className="mt-1 text-xs text-muted">{template.description}</p>
      </div>
    </Link>
  );
}
