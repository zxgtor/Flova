import Link from "next/link";

export function Avatar() {
  return (
    <Link
      href="/account/profile"
      aria-label="Account"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-muted transition-colors hover:border-gold hover:text-gold"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.314 0-8 1.657-8 5v1h16v-1c0-3.343-4.686-5-8-5z" />
      </svg>
    </Link>
  );
}
