import { StudioNav } from "@/components/studio/StudioNav";
import { AttributesSidebar } from "@/components/studio/character/AttributesSidebar";
import { PortraitStage } from "@/components/studio/character/PortraitStage";
import { VariantsSidebar } from "@/components/studio/character/VariantsSidebar";

export default function CharacterPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Character Design Studio" />
      <div className="flex flex-1 overflow-hidden">
        <AttributesSidebar />
        <PortraitStage />
        <VariantsSidebar />
      </div>
    </div>
  );
}
