import { TEMPLATES } from "@/lib/templates";
import { TemplateCard } from "@/components/home/TemplateCard";

export function TemplateGrid() {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((t) => (
        <TemplateCard key={t.slug} template={t} />
      ))}
    </section>
  );
}
