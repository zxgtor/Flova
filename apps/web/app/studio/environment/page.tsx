import { StudioNav } from "@/components/studio/StudioNav";
import { GeographySidebar } from "@/components/studio/environment/GeographySidebar";
import { CanvasStage } from "@/components/studio/environment/CanvasStage";
import { AtmospherePanel } from "@/components/studio/environment/AtmospherePanel";

export default function EnvironmentPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Environment Designer Studio" />
      <div className="flex flex-1 overflow-hidden">
        <GeographySidebar />
        <CanvasStage />
        <AtmospherePanel />
      </div>
    </div>
  );
}
