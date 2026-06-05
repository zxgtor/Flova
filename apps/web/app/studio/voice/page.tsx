import { StudioNav } from "@/components/studio/StudioNav";
import { AttributesSidebar } from "@/components/studio/voice/AttributesSidebar";
import { ScriptStage } from "@/components/studio/voice/ScriptStage";
import { VoiceLibrarySidebar } from "@/components/studio/voice/VoiceLibrarySidebar";

export default function VoicePage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Voice Design Studio" />
      <div className="flex flex-1 overflow-hidden">
        <AttributesSidebar />
        <ScriptStage />
        <VoiceLibrarySidebar />
      </div>
    </div>
  );
}
