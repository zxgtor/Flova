import { HomeNav } from "@/components/home/HomeNav";

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    blurb: "Full control over workspace, billing, and seats.",
  },
  {
    id: "editor",
    label: "Editor",
    blurb: "Generate and edit videos and projects.",
    active: true,
  },
  {
    id: "viewer",
    label: "Viewer",
    blurb: "View, share, and comment on content.",
  },
];

export default function InviteMemberPage() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl p-8">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="mb-6 text-center font-display text-2xl">Invite a Collaborator</h1>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@studio.com"
            className="mb-6 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                data-testid="role-card"
                className={
                  "rounded-xl border p-4 text-left " +
                  (r.active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-surface-2 text-text")
                }
              >
                <div className="text-sm font-medium">{r.label}</div>
                <p className="mt-1 text-xs text-muted">{r.blurb}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
