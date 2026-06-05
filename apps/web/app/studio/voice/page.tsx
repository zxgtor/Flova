import { StudioNav } from "@/components/studio/StudioNav";
import { getStudio } from "@/lib/studios";

export default function Page() {
  const studio = getStudio("voice")!;
  return (
    <>
      <StudioNav title={studio.label} />
      <main className="mx-auto max-w-3xl p-12 text-center">
        <h2 className="font-display text-2xl">{studio.label}</h2>
        <p className="mt-2 text-muted">{studio.blurb}</p>
        <p className="mt-6 text-sm text-muted">This studio is coming soon.</p>
      </main>
    </>
  );
}
