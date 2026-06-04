import Image from "next/image";

type FeatureCardProps = {
  title: string;
  description: string;
  image: string;
};

export function FeatureCard({ title, description, image }: FeatureCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold">
      <div className="relative aspect-video w-full overflow-hidden border-b border-border">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
    </article>
  );
}
