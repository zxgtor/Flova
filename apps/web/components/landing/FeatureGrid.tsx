import { FeatureCard } from "@/components/landing/FeatureCard";

const FEATURES: { title: string; description: string; icon: string }[] = [
  {
    title: "Character Studio",
    description: "Design consistent, reusable AI characters.",
    icon: "🎭",
  },
  { title: "Voice Forge", description: "Craft and clone expressive voices.", icon: "🎙️" },
  { title: "Story Canvas", description: "Plan scenes and storyboards visually.", icon: "📖" },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-8 py-16 md:grid-cols-3">
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </section>
  );
}
