import { StudioNav } from "@/components/studio/StudioNav";
import { CAMERA } from "@/lib/camera-mock";
import { PresetGrid } from "@/components/studio/camera/PresetGrid";
import { CustomPresets } from "@/components/studio/camera/CustomPresets";

export default function CameraPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="Camera & Lighting Presets" />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 overflow-y-auto p-8">
        <PresetGrid presets={CAMERA.cameras} label="Camera" />
        <PresetGrid presets={CAMERA.lighting} label="Lighting" />
        <CustomPresets />
      </main>
    </div>
  );
}
