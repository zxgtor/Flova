export type Preset = { id: string; label: string; image: string; active?: boolean };

export type CustomPreset = { id: string; label: string };

export type CameraMock = {
  cameras: Preset[];
  lighting: Preset[];
  custom: CustomPreset[];
};

export const CAMERA: CameraMock = {
  cameras: [
    { id: "ecu", label: "Extreme Close-Up", image: "/mockups/showcase-1.png", active: true },
    { id: "birds", label: "Bird's Eye View", image: "/mockups/showcase-2.png" },
    { id: "tracking", label: "Tracking Shot", image: "/mockups/showcase-3.png" },
    { id: "dolly", label: "Dolly Zoom", image: "/mockups/showcase-4.png" },
  ],
  lighting: [
    { id: "fog", label: "Volumetric Fog", image: "/mockups/showcase-5.png" },
    { id: "highkey", label: "High Key", image: "/mockups/showcase-6.png" },
    { id: "chiaro", label: "Chiaroscuro", image: "/mockups/showcase-1.png", active: true },
    { id: "neon", label: "Neon Night", image: "/mockups/showcase-2.png" },
  ],
  custom: [{ id: "c1", label: "My Cinematic Setup" }],
};
