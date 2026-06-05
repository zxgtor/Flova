export type Scene = {
  id: string;
  title: string;
  body: string;
  active?: boolean;
  previewImage?: string;
};
export type Act = { id: string; title: string; scenes: Scene[] };
export type Story = { title: string; readiness: number; acts: Act[] };

export const STORY: Story = {
  title: "Untitled Story",
  readiness: 85,
  acts: [
    {
      id: "act-1",
      title: "Act 1: The Setup",
      scenes: [
        {
          id: "1-1",
          title: "Scene 1: The Call to Adventure",
          body:
            "ELARA, hungrily stumbles across a worn slab of old parchment. A young heroine, " +
            "she discovers a glowing tome that pulses with a faint, golden light. The wind " +
            "outside the cottage stills. Somewhere in the forest, something answers.",
          active: true,
          previewImage: "/mockups/showcase-1.png",
        },
        {
          id: "1-2",
          title: "Scene 2: Crossing the Threshold",
          body: "",
          previewImage: "/mockups/showcase-2.png",
        },
        {
          id: "1-3",
          title: "Scene 3: The Confrontation",
          body: "",
          previewImage: "/mockups/showcase-3.png",
        },
      ],
    },
    { id: "act-2", title: "Act 2: Confrontation", scenes: [{ id: "2-1", title: "Scene 1", body: "" }] },
    { id: "act-3", title: "Act 3: Resolution", scenes: [{ id: "3-1", title: "Scene 1", body: "" }] },
  ],
};
