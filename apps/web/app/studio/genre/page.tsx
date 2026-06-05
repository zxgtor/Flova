import { StudioNav } from "@/components/studio/StudioNav";
import { GenreGrid } from "@/components/studio/genre/GenreGrid";
import { ToneSliders } from "@/components/studio/genre/ToneSliders";

export default function GenrePage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Genre & Tone Selector" />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 overflow-y-auto p-8">
        <GenreGrid />
        <ToneSliders />
        <div className="flex justify-center pt-4">
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-10 py-3 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Apply to Story
          </button>
        </div>
      </main>
    </div>
  );
}
