export type CategoryGroup = {
  id: string;
  label: string;
  items: { id: string; label: string; active?: boolean }[];
};

export type AtmosphereControl = { id: string; label: string; value: number };

export type Reference = { id: string; label: string; image: string };

export type Environment = {
  projectName: string;
  groups: CategoryGroup[];
  atmosphere: AtmosphereControl[];
  references: Reference[];
  previewImage: string;
};

export const ENVIRONMENT: Environment = {
  projectName: "Neon Horizon — View 1",
  previewImage: "/mockups/hero-bg.png",
  groups: [
    {
      id: "geography",
      label: "Geography & Architecture",
      items: [
        { id: "tropical", label: "Tropical" },
        { id: "desert", label: "Desert" },
        { id: "cyber", label: "Cyber City", active: true },
      ],
    },
    {
      id: "structural",
      label: "Structural Elements",
      items: [
        { id: "towers", label: "Towers", active: true },
        { id: "districts", label: "Districts" },
        { id: "bridges", label: "Bridges" },
        { id: "walkable", label: "Walkable Surfaces" },
      ],
    },
    {
      id: "terrain",
      label: "Terrain & Flora",
      items: [
        { id: "elevation", label: "Elevation" },
        { id: "vegetation", label: "Vegetation Density" },
        { id: "water", label: "Water Features" },
      ],
    },
  ],
  atmosphere: [
    { id: "weather", label: "Weather", value: 70 },
    { id: "time", label: "Time of Day", value: 75 },
    { id: "depth", label: "Atmospheric Depth", value: 60 },
    { id: "clouds", label: "Cloud Cover", value: 45 },
    { id: "precip", label: "Rain / Snow", value: 10 },
    { id: "lighting", label: "Lighting Effects", value: 80 },
    { id: "grading", label: "Color Grading", value: 65 },
  ],
  references: [
    { id: "r1", label: "Style 1", image: "/mockups/showcase-1.png" },
    { id: "r2", label: "Style 2", image: "/mockups/showcase-2.png" },
    { id: "r3", label: "Style 3", image: "/mockups/showcase-3.png" },
  ],
};
