import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { NAV_SECTIONS } from "@/lib/nav";

type SiteNavProps = {
  cta?: ReactNode;
};

export function SiteNav({ cta }: SiteNavProps = {}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-4">
      <Link href="/" aria-label="Flova home">
        <Logo />
      </Link>
      <nav className="hidden gap-8 md:flex">
        {NAV_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="text-sm text-muted transition-colors hover:text-text"
          >
            {section.label}
          </Link>
        ))}
      </nav>
      {cta ?? (
        <Link
          href="/account/profile"
          className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-bg"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
