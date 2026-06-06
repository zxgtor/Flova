"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type FileOut } from "@/lib/api";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetsPage() {
  const auth = useAuth();
  const [files, setFiles] = useState<FileOut[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      setFiles(await api.listMyFiles(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !auth.token) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadFile(auth.token, file);
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDownload(f: FileOut) {
    if (!auth.token) return;
    const res = await fetch(api.fileUrl(f.id), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.storage_key.split("/").pop() ?? f.id;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/manage/assets" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage assets.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 font-display text-2xl">Assets</h1>

        <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Upload</h2>
          <label
            data-testid="upload-drop"
            className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-2 text-xs text-muted hover:border-gold hover:text-gold"
          >
            <span>{uploading ? "Uploading…" : "Click to pick a file"}</span>
            <span className="mt-1 text-[10px]">Up to 50 MB</span>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={onPick}
              disabled={uploading}
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </section>

        {files === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted">No assets uploaded yet.</p>
        ) : (
          <ul className="space-y-2" data-testid="asset-list">
            {files.map((f) => (
              <li
                key={f.id}
                data-testid="asset-row"
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-text">
                    {f.storage_key.split("/").pop() ?? f.id}
                  </div>
                  <div className="text-xs text-muted">
                    {f.content_type} · {humanSize(f.byte_size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDownload(f)}
                  className="ml-3 rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
