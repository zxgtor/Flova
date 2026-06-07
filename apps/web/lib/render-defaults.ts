/**
 * Per-user render defaults.
 *
 * Persisted as a singleton `studio_presets` row with kind="render_defaults"
 * (the first one we find wins; the settings page tolerates having created
 * more than one and reuses the most recent). The defaults influence every
 * render the user submits — `composePromptWithDefaults` is invoked from
 * useRenderSubmit just before `api.submitRender`.
 */

import { api, type PresetOut } from "@/lib/api";

export type EnhancementId = "denoise" | "stabilize" | "frame" | "color";

export type RenderDefaults = {
  lighting: "cinematic" | "golden_hour" | "moody" | "natural";
  mood: string;
  negative_prompt: string;
  enhancements: Record<EnhancementId, boolean>;
};

export const DEFAULT_RENDER_DEFAULTS: RenderDefaults = {
  lighting: "natural",
  mood: "",
  negative_prompt: "",
  enhancements: { denoise: true, stabilize: true, frame: false, color: true },
};

export const PRESET_KIND = "render_defaults";

export function payloadOf(p: PresetOut): RenderDefaults {
  const raw = (p.payload ?? {}) as Partial<RenderDefaults>;
  return {
    ...DEFAULT_RENDER_DEFAULTS,
    ...raw,
    enhancements: {
      ...DEFAULT_RENDER_DEFAULTS.enhancements,
      ...(raw.enhancements ?? {}),
    },
  };
}

export async function fetchRenderDefaults(
  token: string,
): Promise<{ preset: PresetOut | null; values: RenderDefaults }> {
  const list = await api.listPresets(token, PRESET_KIND);
  // Singleton semantics: the freshest one wins. The settings page deletes
  // older duplicates after a save.
  const preset = list.length > 0 ? list[0] ?? null : null;
  return {
    preset,
    values: preset ? payloadOf(preset) : DEFAULT_RENDER_DEFAULTS,
  };
}

const LIGHTING_DESCRIPTOR: Record<RenderDefaults["lighting"], string> = {
  natural: "",
  cinematic: "cinematic lighting",
  golden_hour: "golden hour lighting",
  moody: "moody, dramatic lighting",
};

/**
 * Append the user's defaults to a render prompt. Pure; safe to call with
 * arbitrary input.
 */
export function composePromptWithDefaults(
  prompt: string,
  defaults: RenderDefaults,
): string {
  const parts: string[] = [prompt.trim()];
  const lighting = LIGHTING_DESCRIPTOR[defaults.lighting];
  if (lighting) parts.push(lighting);
  if (defaults.mood.trim()) parts.push(`${defaults.mood.trim()} mood`);
  if (defaults.negative_prompt.trim()) {
    parts.push(`(avoid: ${defaults.negative_prompt.trim()})`);
  }
  return parts.filter(Boolean).join(", ");
}
