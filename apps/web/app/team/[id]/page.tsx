"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type TeamMemberOut, type TeamOut, type TeamRole } from "@/lib/api";

const ROLES: TeamRole[] = ["admin", "editor", "viewer"];

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-gold/20 text-gold",
  admin: "bg-gold/15 text-gold",
  editor: "bg-emerald-500/20 text-emerald-400",
  viewer: "bg-surface-2 text-muted",
};

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();
  const [team, setTeam] = useState<TeamOut | null>(null);
  const [members, setMembers] = useState<TeamMemberOut[] | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("viewer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      const [t, m] = await Promise.all([
        api.getTeam(token, id),
        api.listTeamMembers(token, id),
      ]);
      setTeam(t);
      setMembers(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.addTeamMember(auth.token, id, email.trim(), role);
      setEmail("");
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(memberId: string) {
    if (!auth.token) return;
    if (!confirm("Remove this member?")) return;
    setError(null);
    try {
      await api.removeTeamMember(auth.token, id, memberId);
      await refresh(auth.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href={`/signin?next=/team/${id}`} className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to view this team.
        </main>
      </>
    );
  }

  const canManage = team?.my_role === "owner" || team?.my_role === "admin";

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/team" className="mb-4 inline-block text-xs text-muted hover:text-gold">
          ← All teams
        </Link>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        {team === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          team && (
            <>
              <header className="mb-6">
                <h1 className="font-display text-2xl">{team.name}</h1>
                <p className="mt-1 text-xs text-muted">
                  Your role:{" "}
                  <span
                    className={
                      "inline-block rounded-full px-2 py-0.5 " +
                      (ROLE_STYLES[team.my_role] ?? "")
                    }
                  >
                    {team.my_role}
                  </span>
                </p>
              </header>

              {canManage && (
                <form
                  onSubmit={onAdd}
                  className="mb-8 rounded-2xl border border-border bg-surface p-5"
                >
                  <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
                    Add Member
                  </h2>
                  <p className="mb-3 text-[10px] text-muted">
                    The invitee must already have a Flova account.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@example.com"
                      className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as TeamRole)}
                      className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-gold focus:outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={busy || !email.trim()}
                      className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
                    >
                      {busy ? "…" : "Add"}
                    </button>
                  </div>
                </form>
              )}

              <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Members</h2>
              {members === null ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : (
                <ul className="space-y-2" data-testid="member-list">
                  {members.map((m) => {
                    const handle = m.display_name?.trim() || m.email.split("@")[0];
                    const isSelf = m.user_id === auth.user?.id;
                    return (
                      <li
                        key={m.id}
                        data-testid="member-row"
                        className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-text">@{handle}</div>
                          <div className="text-xs text-muted">{m.email}</div>
                        </div>
                        <span
                          className={
                            "ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs " +
                            (ROLE_STYLES[m.role] ?? "")
                          }
                        >
                          {m.role}
                        </span>
                        {canManage && m.role !== "owner" && !isSelf && (
                          <button
                            type="button"
                            onClick={() => onRemove(m.id)}
                            className="ml-3 rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-red-500/50 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )
        )}
      </main>
    </>
  );
}
