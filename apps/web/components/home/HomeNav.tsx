"use client";

import Link from "next/link";
import { SiteNav } from "@/components/landing/SiteNav";
import { Avatar } from "@/components/home/Avatar";
import { useAuth } from "@/lib/auth";

export function HomeNav() {
  const auth = useAuth();
  const signedIn = !auth.loading && !!auth.token;

  return (
    <SiteNav
      cta={
        signedIn ? (
          <div className="flex items-center gap-3">
            <Avatar />
            <Link
              href="/studio"
              className="rounded-full bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-opacity hover:opacity-90"
            >
              Generate
            </Link>
            <button
              type="button"
              onClick={auth.signOut}
              className="text-xs text-muted hover:text-gold"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="rounded-full bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-opacity hover:opacity-90"
            >
              Generate
            </Link>
            <Link
              href="/signin"
              className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-bg"
            >
              Sign in
            </Link>
          </div>
        )
      }
    />
  );
}
