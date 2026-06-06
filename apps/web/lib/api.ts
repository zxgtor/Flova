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
};
