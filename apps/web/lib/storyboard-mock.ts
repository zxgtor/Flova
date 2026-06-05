export type BoardScene = {
  id: string;
  number: number;
  image: string;
  description: string;
  dialogue: string;
  tags: string[];
  active?: boolean;
};

export type GlobalAsset = { id: string; label: string; image: string };

export type StoryboardMock = {
  scenes: BoardScene[];
  assets: GlobalAsset[];
};

export const STORYBOARD: StoryboardMock = {
  scenes: [
    {
      id: "s1",
      number: 1,
      image: "/mockups/showcase-1.png",
      description: "AI-generated visual: Dawn over Neo Tokyo.",
      dialogue: "[Narrator] The city wakes in a distant hum, a rising tide.",
      tags: ["Wide Shot", "Soft Sun", "Hopeful"],
    },
    {
      id: "s2",
      number: 2,
      image: "/mockups/showcase-2.png",
      description: "AI-generated visual: Character close-up at the rooftop bar.",
      dialogue:
        "[Protagonist] Some lines stay with you forever, even when the night ends them.",
      tags: ["Close Up", "Neon", "Tense"],
      active: true,
    },
    {
      id: "s3",
      number: 3,
      image: "/mockups/showcase-3.png",
      description: "AI-generated visual: High-speed pursuit through the skyline.",
      dialogue: "[Co-driver] Hold on. This is going to leave a mark.",
      tags: ["Tracking", "High Contrast", "Urgent"],
    },
  ],
  assets: [
    { id: "a1", label: "Hero Tower", image: "/mockups/showcase-4.png" },
    { id: "a2", label: "Skyline", image: "/mockups/showcase-5.png" },
    { id: "a3", label: "Park Bench", image: "/mockups/showcase-6.png" },
    { id: "a4", label: "Bridge", image: "/mockups/showcase-1.png" },
    { id: "a5", label: "Vehicle", image: "/mockups/showcase-2.png" },
  ],
};
