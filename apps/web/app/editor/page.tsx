import Image from "next/image";
import { StudioNav } from "@/components/studio/StudioNav";

const ASSETS = [
  { id: 1, label: "Sunset Mountain B-roll", image: "/mockups/showcase-1.png" },
  { id: 2, label: "Cliff Drone Shot", image: "/mockups/showcase-2.png" },
  { id: 3, label: "Generative Sky Mask", image: "/mockups/showcase-3.png" },
  { id: 4, label: "Audio Track A", image: "/mockups/showcase-4.png" },
  { id: 5, label: "Quick Memes", image: "/mockups/showcase-5.png" },
];

const ENHANCE = [
  { id: "denoise", label: "AI Denoise", on: true },
  { id: "stabilize", label: "Auto Stabilize", on: true },
  { id: "frame", label: "Frame Interpolation", on: false },
  { id: "color", label: "Auto Color", on: true },
];

const MOTION = [
  { id: "speed", label: "Speed", value: "1.00x" },
  { id: "scale", label: "Scale", value: "100%" },
  { id: "rotate", label: "Rotate", value: "0°" },
  { id: "pos-x", label: "Pos X", value: "0" },
  { id: "pos-y", label: "Pos Y", value: "0" },
];

const COLOR = [
  { id: "exposure", label: "Exposure", value: 50 },
  { id: "contrast", label: "Contrast", value: 65 },
  { id: "shadows", label: "Shadows", value: 40 },
];

const TRACKS = [
  { id: "v1", label: "Video 1", color: "bg-gold/30" },
  { id: "v2", label: "Video 2", color: "bg-gold/15" },
  { id: "a1", label: "Audio 1", color: "bg-gold-bright/30" },
  { id: "a2", label: "Audio 2", color: "bg-gold-deep/30" },
  { id: "sfx", label: "SFX", color: "bg-gold/20" },
];

export default function EditorPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="Video Editing Workspace" />
      <div className="grid flex-1 grid-cols-[14rem_1fr_18rem] overflow-hidden">
        <aside className="overflow-y-auto border-r border-border bg-surface p-3">
          <h2 className="mb-3 px-1 text-xs uppercase tracking-wider text-muted">Asset Library</h2>
          <input
            type="text"
            placeholder="Search…"
            className="mb-3 w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <ul className="space-y-2">
            {ASSETS.map((a) => (
              <li
                key={a.id}
                data-testid="editor-asset"
                className="flex items-center gap-2 rounded-md border border-border bg-surface-2 p-2 text-xs text-muted hover:border-gold"
              >
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded">
                  <Image src={a.image} alt="" fill sizes="60px" className="object-cover" />
                </div>
                <span className="line-clamp-2 text-text">{a.label}</span>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center bg-bg p-6">
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-md border border-border">
              <Image src="/mockups/hero-bg.png" alt="" fill sizes="80vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-bg/80 p-2 text-xs text-muted">
                <button type="button" aria-label="Play">▶</button>
                <span>00:00:35:12</span>
                <div className="ml-auto rounded-md border border-gold px-2 py-0.5 text-gold">
                  RENDER PREVIEW
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border bg-surface p-3">
            <div className="space-y-1">
              {TRACKS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-sm text-xs"
                  data-testid="timeline-track"
                >
                  <span className="w-16 shrink-0 text-muted">{t.label}</span>
                  <div className={"h-5 flex-1 rounded-sm " + t.color} />
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="overflow-y-auto border-l border-border bg-surface p-4">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Properties</h2>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">AI Enhancements</h3>
          <ul className="mb-5 space-y-1.5 text-xs">
            {ENHANCE.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span className="text-text">{e.label}</span>
                <span
                  className={
                    "rounded-full px-2 text-[10px] " +
                    (e.on ? "bg-gold/20 text-gold" : "bg-surface-2 text-muted")
                  }
                >
                  {e.on ? "ON" : "OFF"}
                </span>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">Motion Controls</h3>
          <ul className="mb-5 space-y-1.5 text-xs">
            {MOTION.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span className="text-text">{m.label}</span>
                <span className="text-muted">{m.value}</span>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">Color Grading</h3>
          {COLOR.map((c) => (
            <div key={c.id} className="mb-3">
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="text-text">{c.label}</span>
                <span className="text-muted">{c.value}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                  style={{ width: `${c.value}%` }}
                />
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
