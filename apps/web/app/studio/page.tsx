import { HomeNav } from "@/components/home/HomeNav";
import { StartingFromBanner } from "@/components/studio/StartingFromBanner";
import { StudioSelector } from "@/components/studio/StudioSelector";
import { StudioPrompt } from "@/components/studio/StudioPrompt";

type Props = {
  searchParams: Promise<{ prompt?: string; template?: string }>;
};

export default async function StudioPage({ searchParams }: Props) {
  const { prompt, template } = await searchParams;
  return (
    <>
      <HomeNav />
      <main>
        <section className="px-8 pt-12 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Pick a <span className="text-gold-gradient">studio</span> to start
          </h1>
          <p className="mt-3 text-muted">Each studio shapes a different piece of your video.</p>
          <StartingFromBanner prompt={prompt} template={template} />
          {prompt && <StudioPrompt prompt={prompt} />}
        </section>
        <StudioSelector />
      </main>
    </>
  );
}
