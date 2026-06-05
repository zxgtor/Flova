import { StudioNav } from "@/components/studio/StudioNav";
import { StoryboardView } from "@/components/studio/storyboard/StoryboardView";
import { GlobalAssets } from "@/components/studio/storyboard/GlobalAssets";

export default function StoryboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="Visual Storyboard Planner" />
      <main className="flex-1 overflow-y-auto p-6">
        <StoryboardView />
        <GlobalAssets />
      </main>
    </div>
  );
}
