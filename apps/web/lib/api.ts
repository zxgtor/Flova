/**
 * Typed HTTP client for the Flova FastAPI backend.
 *
 * Types mirror the Pydantic schemas in `apps/api/src/flova_api/schemas.py`. If those
 * change, regenerate or hand-update this file.
 */

export const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) || "http://localhost:8000";

export type TokenResponse = { access_token: string; token_type: string };
export type UserOut = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
};
export type MeStats = {
  total_renders: number;
  successful_renders: number;
  failed_renders: number;
};

export type MonthlyCount = { month: string; count: number };

export type MeUsage = {
  total_renders: number;
  successful_renders: number;
  failed_renders: number;
  storage_bytes: number;
  file_count: number;
  renders_by_month: MonthlyCount[];
};

export type PresetOut = {
  id: string;
  kind: string;
  name: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SubscriptionOut = {
  plan: "free" | "pro";
  status: "none" | "active" | "past_due" | "canceled";
  current_period_end: string | null;
  provider: "stub" | "stripe";
};

export type CheckoutOut = { url: string };

export type FileOut = {
  id: string;
  storage_key: string;
  tier: "hot" | "cold";
  byte_size: number;
  content_type: string;
  created_at: string;
};

export type ProjectStatus = "draft" | "in_progress" | "completed" | "archived";
export type ProjectOut = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type RenderStatus = "queued" | "running" | "done" | "failed";
export type RenderJobOut = {
  id: string;
  prompt: string;
  status: RenderStatus;
  failure_reason: string | null;
  output_file_id: string | null;
  created_at: string;
  updated_at: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
  }
}

type ReqOpts = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

async function request<T>(path: string, opts: ReqOpts = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string | Record<string, unknown> };
      if (typeof body.detail === "string") detail = body.detail;
      else if (body.detail) detail = JSON.stringify(body.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }

  // 202/204 with no body
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  health: () => request<{ status: string; version: string }>("/api/health"),

  register: (email: string, password: string, display_name = "") =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: { email, password, display_name },
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  me: (token: string) => request<UserOut>("/api/auth/me", { token }),

  submitRender: (token: string, prompt: string) =>
    request<RenderJobOut>("/api/render", { method: "POST", body: { prompt }, token }),

  getRender: (token: string, jobId: string, signal?: AbortSignal) =>
    request<RenderJobOut>(`/api/render/${jobId}`, { token, signal }),

  fileUrl: (fileId: string) => `${API_BASE}/api/files/${fileId}`,

  listMyFiles: (token: string) => request<FileOut[]>("/api/files/my", { token }),

  uploadFile: async (token: string, file: File): Promise<FileOut> => {
    const form = new FormData();
    form.append("upload", file);
    const res = await fetch(`${API_BASE}/api/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { detail?: string };
        if (typeof body.detail === "string") detail = body.detail;
      } catch {
        /* non-JSON */
      }
      throw new ApiError(res.status, detail);
    }
    return (await res.json()) as FileOut;
  },

  listProjects: (token: string) => request<ProjectOut[]>("/api/projects", { token }),

  createProject: (token: string, title: string, description = "") =>
    request<ProjectOut>("/api/projects", {
      method: "POST",
      body: { title, description },
      token,
    }),

  getProject: (token: string, id: string) =>
    request<ProjectOut>(`/api/projects/${id}`, { token }),

  updateProject: (
    token: string,
    id: string,
    patch: { title?: string; description?: string; status?: ProjectStatus },
  ) =>
    request<ProjectOut>(`/api/projects/${id}`, {
      method: "PATCH",
      body: patch,
      token,
    }),

  deleteProject: (token: string, id: string) =>
    request<void>(`/api/projects/${id}`, { method: "DELETE", token }),

  getSubscription: (token: string) =>
    request<SubscriptionOut>("/api/billing/subscription", { token }),

  checkout: (token: string) =>
    request<CheckoutOut>("/api/billing/checkout", { method: "POST", token }),

  portal: (token: string) =>
    request<CheckoutOut>("/api/billing/portal", { method: "POST", token }),

  stubActivate: (token: string) =>
    request<SubscriptionOut>("/api/billing/stub-activate", {
      method: "POST",
      body: {},
      token,
    }),

  listPresets: (token: string, kind?: string) =>
    request<PresetOut[]>(`/api/presets${kind ? `?kind=${encodeURIComponent(kind)}` : ""}`, {
      token,
    }),

  createPreset: (
    token: string,
    kind: string,
    name: string,
    payload: Record<string, unknown>,
  ) =>
    request<PresetOut>("/api/presets", {
      method: "POST",
      body: { kind, name, payload },
      token,
    }),

  deletePreset: (token: string, id: string) =>
    request<void>(`/api/presets/${id}`, { method: "DELETE", token }),

  meStats: (token: string) => request<MeStats>("/api/users/me/stats", { token }),

  meUsage: (token: string) => request<MeUsage>("/api/users/me/usage", { token }),

  meRecentRenders: (token: string, limit = 12, status?: RenderStatus) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (status) qs.set("status", status);
    return request<RenderJobOut[]>(`/api/users/me/renders?${qs.toString()}`, { token });
  },
};
