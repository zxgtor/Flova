import Link from "next/link";
import { SiteNav } from "@/components/landing/SiteNav";
import { Avatar } from "@/components/home/Avatar";

export function HomeNav() {
  return (
    <SiteNav
      cta={
        <div className="flex items-center gap-3">
          <Avatar />
          <Link
            href="/studio"
            className="rounded-full bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-opacity hover:opacity-90"
          >
            Generate
          </Link>
        </div>
      }
    />
  );
}
