import { HomeNav } from "@/components/home/HomeNav";
import { PromptBar } from "@/components/home/PromptBar";
import { TemplateGrid } from "@/components/home/TemplateGrid";

export default function HomePage() {
  return (
    <>
      <HomeNav />
      <main>
        <section className="bg-home-glow px-8 py-20">
          <h1 className="mx-auto mb-8 max-w-3xl text-center font-display text-3xl font-semibold">
            What would you like to <span className="text-gold-gradient">create</span> today?
          </h1>
          <PromptBar />
        </section>
        <TemplateGrid />
      </main>
    </>
  );
}
