export type GenreTile = { id: string; label: string; icon: string; active?: boolean };
export type ToneSlider = { id: string; label: string; leftLabel: string; rightLabel: string; value: number };

export type GenreMock = {
  genres: GenreTile[];
  tones: ToneSlider[];
};

export const GENRE: GenreMock = {
  genres: [
    { id: "scifi", label: "Sci-Fi Noir", icon: "🛰️" },
    { id: "period", label: "Period Drama", icon: "🏰" },
    { id: "cyberpunk", label: "Cyberpunk", icon: "🌃", active: true },
    { id: "romcom", label: "Romantic Comedy", icon: "💕" },
    { id: "docu", label: "Cosmic Documentary", icon: "🌌" },
  ],
  tones: [
    { id: "mood", label: "Mood", leftLabel: "Ethereal", rightLabel: "Gritty", value: 60 },
    { id: "pacing", label: "Pacing", leftLabel: "Slow Burn", rightLabel: "High Action", value: 70 },
    { id: "style", label: "Visual Style", leftLabel: "Saturated", rightLabel: "Monochrome", value: 35 },
  ],
};
