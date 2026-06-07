"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type TeamOut } from "@/lib/api";

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-gold/20 text-gold",
  admin: "bg-gold/15 text-gold",
  editor: "bg-emerald-500/20 text-emerald-400",
  viewer: "bg-surface-2 text-muted",
};

export default function TeamsListPage() {
  const auth = useAuth();
  const [teams, setTeams] = useState<TeamOut[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      setTeams(await api.listTeams(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.createTeam(auth.token, name.trim());
      setName("");
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/team" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage teams.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 font-display text-2xl">Teams</h1>

        <form
          onSubmit={onCreate}
          className="mb-8 rounded-2xl border border-border bg-surface p-5"
        >
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">New Team</h2>
          <div className="flex gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aurora Studio"
              className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
            >
              {creating ? "…" : "Create"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </form>

        {teams === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-muted">
            You&apos;re not on any team yet. Create one above.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="team-list">
            {teams.map((t) => (
              <li key={t.id} data-testid="team-row">
                <Link
                  href={`/team/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-gold"
                >
                  <div>
                    <div className="text-sm text-text">{t.name}</div>
                    <div className="text-xs text-muted">
                      Created {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (ROLE_STYLES[t.my_role] ?? "")
                    }
                  >
                    {t.my_role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
