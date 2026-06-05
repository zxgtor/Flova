export type StyleListing = {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number;
  image: string;
};

export type FilterGroup = { id: string; label: string; options: string[] };

export const STYLE_OF_MONTH = {
  title: "Style of the Month: Neo-Noir Watercolors",
  blurb: "Transform your footage with this exclusive, award-winning style by Studio Aether.",
  image: "/mockups/showcase-1.png",
};

export const FILTERS: FilterGroup[] = [
  { id: "category", label: "Category", options: ["Anime", "Classic Film", "Photoreal", "Retro VHS", "Watercolor"] },
  { id: "price", label: "Price Range", options: ["$0–$10", "$10–$25", "$25–$50", "$50+"] },
  { id: "model", label: "Model Version", options: ["v1", "v2", "v3 (latest)"] },
];

export const TOP_SELLERS: StyleListing[] = [
  { id: "s1", title: "Vintage Kodak Vibe",   author: "@elving.labs", price: 19, rating: 4.8, image: "/mockups/showcase-2.png" },
  { id: "s2", title: "Studio Ghibli Dream",  author: "@Studio Nori", price: 29, rating: 4.9, image: "/mockups/showcase-3.png" },
  { id: "s3", title: "Glitch Art Revolution",author: "@Digital Tone",price: 14, rating: 4.6, image: "/mockups/showcase-4.png" },
  { id: "s4", title: "Cinematic Grade Pro",  author: "@cine.atelier",price: 45, rating: 4.9, image: "/mockups/showcase-5.png" },
];
