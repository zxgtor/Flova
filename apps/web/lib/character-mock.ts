export type AttributeGroup = {
  id: string;
  label: string;
  fields: { label: string; value: string }[];
};

export type Variant = { id: string; label: string; image: string };

export type Character = {
  name: string;
  groups: AttributeGroup[];
  variants: Variant[];
  faceLockImage?: string;
};

export const CHARACTER: Character = {
  name: "Untitled Character",
  groups: [
    {
      id: "physical",
      label: "Physical Traits",
      fields: [
        { label: "Age", value: "Young Adult" },
        { label: "Ethnicity", value: "East Asian" },
        { label: "Hairstyle", value: "Wavy, shoulder length" },
        { label: "Eye Color", value: "Dark Brown" },
      ],
    },
    {
      id: "personality",
      label: "Personality",
      fields: [
        { label: "Mood", value: "Confident" },
        { label: "Style", value: "Modern Casual" },
      ],
    },
  ],
  variants: [
    { id: "v1", label: "Variant 1", image: "/mockups/showcase-1.png" },
    { id: "v2", label: "Variant 2", image: "/mockups/showcase-2.png" },
    { id: "v3", label: "Variant 3", image: "/mockups/showcase-3.png" },
    { id: "v4", label: "Variant 4", image: "/mockups/showcase-4.png" },
  ],
};
