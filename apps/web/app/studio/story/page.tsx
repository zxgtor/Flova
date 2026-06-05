import { StudioNav } from "@/components/studio/StudioNav";
import { StoryStructure } from "@/components/studio/story/StoryStructure";
import { SceneEditor } from "@/components/studio/story/SceneEditor";
import { ScenePreviewsSidebar } from "@/components/studio/story/ScenePreviewsSidebar";
import { ConvertBar } from "@/components/studio/story/ConvertBar";

export default function StoryPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Story Creation Studio" />
      <div className="flex flex-1 overflow-hidden">
        <StoryStructure />
        <SceneEditor />
        <ScenePreviewsSidebar />
      </div>
      <ConvertBar />
    </div>
  );
}
