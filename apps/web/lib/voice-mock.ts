export type VoiceSlider = { id: string; label: string; value: number };
export type EmotionTab = { id: string; label: string; active?: boolean };
export type VoicePreset = { id: string; label: string };

export type VoiceMock = {
  attributes: VoiceSlider[];
  emotions: EmotionTab[];
  library: VoicePreset[];
  scriptPlaceholder: string;
};

export const VOICE: VoiceMock = {
  attributes: [
    { id: "pitch", label: "Pitch", value: 55 },
    { id: "stability", label: "Stability", value: 70 },
    { id: "clarity", label: "Clarity", value: 80 },
  ],
  emotions: [
    { id: "happy", label: "Happy", active: true },
    { id: "whispering", label: "Whispering" },
    { id: "authoritative", label: "Authoritative" },
  ],
  library: [
    { id: "v1", label: "Custom Voice 1" },
    { id: "v2", label: "Narrator — Deep" },
    { id: "v3", label: "Character — Friendly" },
    { id: "v4", label: "Character — Villain" },
  ],
  scriptPlaceholder: "Enter the script here to test this voice…",
};
