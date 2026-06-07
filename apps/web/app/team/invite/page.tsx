"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type TeamOut, type TeamRole } from "@/lib/api";

const ROLES: { id: TeamRole; label: string; blurb: string }[] = [
  { id: "admin", label: "Admin", blurb: "Full control over workspace, members, and seats." },
  { id: "editor", label: "Editor", blurb: "Generate and edit videos and projects." },
  { id: "viewer", label: "Viewer", blurb: "View, share, and comment on content." },
];

export default function InvitePage() {
  const auth = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<TeamOut[] | null>(null);
  const [teamId, setTeamId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      const list = await api.listTeams(token);
      // Only teams where caller can manage members.
      const manageable = list.filter(
        (t) => t.my_role === "owner" || t.my_role === "admin",
      );
      setTeams(manageable);
      const first = manageable[0];
      if (first && !teamId) setTeamId(first.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, [teamId]);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !email.trim() || !teamId) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const member = await api.addTeamMember(auth.token, teamId, email.trim(), role);
      setSuccess(`Added ${member.email} as ${member.role}.`);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/team/invite" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to invite collaborators.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl p-8">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="mb-6 text-center font-display text-2xl">Invite a Collaborator</h1>

          {teams === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted">
              You don&apos;t own or admin any team yet.{" "}
              <button
                type="button"
                onClick={() => router.push("/team")}
                className="text-gold hover:underline"
              >
                Create one first
              </button>
              .
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
                Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="mb-6 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-gold focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="mb-2 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
              <p className="mb-6 text-[10px] text-muted">
                Invitee must already have a Flova account.
              </p>

              <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
                Role
              </label>
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    data-testid="role-card"
                    className={
                      "rounded-xl border p-4 text-left " +
                      (role === r.id
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-surface-2 text-text")
                    }
                  >
                    <div className="text-sm font-medium">{r.label}</div>
                    <p className="mt-1 text-xs text-muted">{r.blurb}</p>
                  </button>
                ))}
              </div>

              {error && (
                <p role="alert" className="mb-3 text-xs text-red-300">
                  {error}
                </p>
              )}
              {success && (
                <p className="mb-3 text-xs text-emerald-400">{success}</p>
              )}

              <div className="flex justify-end gap-3">
                <Link
                  href="/team"
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={busy || !email.trim()}
                  className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
                >
                  {busy ? "…" : "Send Invitation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
