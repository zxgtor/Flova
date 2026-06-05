export type Studio = {
  slug: string;
  label: string;
  blurb: string;
  icon: string; // emoji for now; can swap to SVG later
  available: boolean;
};

export const STUDIOS: Studio[] = [
  {
    slug: "story",
    label: "Story Creation",
    blurb: "Plot scenes and write screenplays with an AI co-writer.",
    icon: "📖",
    available: true,
  },
  {
    slug: "character",
    label: "Character Design",
    blurb: "Build consistent, reusable AI characters.",
    icon: "🎭",
    available: false,
  },
  {
    slug: "environment",
    label: "Environment",
    blurb: "Generate locations and set pieces.",
    icon: "🏞️",
    available: false,
  },
  {
    slug: "voice",
    label: "Voice Forge",
    blurb: "Craft, clone, and tune expressive voices.",
    icon: "🎙️",
    available: false,
  },
  {
    slug: "genre",
    label: "Genre & Tone",
    blurb: "Pick the mood, era, and visual genre.",
    icon: "🎚️",
    available: false,
  },
  {
    slug: "storyboard",
    label: "Storyboard",
    blurb: "Plan shots visually before generation.",
    icon: "🗂️",
    available: false,
  },
  {
    slug: "camera",
    label: "Camera & Light",
    blurb: "Preset cinematography and lighting rigs.",
    icon: "🎥",
    available: false,
  },
];

export function getStudio(slug: string): Studio | undefined {
  return STUDIOS.find((s) => s.slug === slug);
}
