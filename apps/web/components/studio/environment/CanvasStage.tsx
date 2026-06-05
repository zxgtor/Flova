import Image from "next/image";
import { ENVIRONMENT } from "@/lib/environment-mock";

export function CanvasStage() {
  return (
    <section className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted">Canvas</span>
          <span className="text-xs text-text">Project: {ENVIRONMENT.projectName}</span>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
          <Image
            src={ENVIRONMENT.previewImage}
            alt=""
            fill
            sizes="(min-width:1024px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-6 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
        >
          Generate Environment
        </button>
      </div>
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted">Reference Gallery</span>
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Upload Image
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ENVIRONMENT.references.map((r) => (
            <div
              key={r.id}
              data-testid="reference-tile"
              className="overflow-hidden rounded-md border border-border bg-surface-2"
            >
              <div className="relative aspect-video">
                <Image src={r.image} alt={r.label} fill sizes="200px" className="object-cover" />
              </div>
              <div className="px-2 py-1 text-xs text-muted">{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
