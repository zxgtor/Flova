import { HomeNav } from "@/components/home/HomeNav";

const SEATS = [
  { name: "John Doe", role: "Admin", status: "Active" },
  { name: "Sarah Smith", role: "Editor", status: "Active" },
  { name: "Michael Lee", role: "Viewer", status: "Pending" },
];

const HISTORY = [
  { date: "Nov 15, 2024", invoice: "INV-1098", amount: "$3,880" },
  { date: "Oct 15, 2024", invoice: "INV-1077", amount: "$3,880" },
  { date: "Sep 15, 2024", invoice: "INV-1056", amount: "$3,880" },
];

export default function BillingPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <h1 className="mb-6 font-display text-2xl">Team Billing &amp; Seats</h1>
        <section className="mb-6 rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-muted">Plan Overview</h2>
            <button
              type="button"
              className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-xs font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            >
              Upgrade Plan
            </button>
          </div>
          <div className="text-sm text-text">Current Plan: Enterprise Pro</div>
          <div className="mt-1 text-xs text-muted">
            Billing Cycle: Monthly · Next Payment: November 15, 2024 · Amount: $3,880
          </div>
        </section>
        <section className="mb-6 rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-muted">Seat Management</h2>
            <button
              type="button"
              className="rounded-md border border-gold px-4 py-1.5 text-xs text-gold hover:bg-gold/10"
            >
              Invite New Member
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Role</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {SEATS.map((s) => (
                <tr
                  key={s.name}
                  data-testid="seat-row"
                  className="border-t border-border text-text"
                >
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 text-muted">{s.role}</td>
                  <td className="py-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs " +
                        (s.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-gold/20 text-gold")
                      }
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-muted hover:text-gold"
                      aria-label={`Manage ${s.name}`}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Payment Methods</h2>
            <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">
              <span className="text-text">Visa •••• 1234 (exp 12/26)</span>
              <button
                type="button"
                className="text-xs text-muted hover:text-gold"
                aria-label="Manage card"
              >
                Manage
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Billing History</h2>
            <ul className="space-y-2 text-sm">
              {HISTORY.map((h) => (
                <li
                  key={h.invoice}
                  data-testid="invoice-row"
                  className="flex items-center justify-between"
                >
                  <span className="text-text">
                    {h.date} <span className="text-muted">·</span> {h.invoice}
                  </span>
                  <span className="text-gold">{h.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
