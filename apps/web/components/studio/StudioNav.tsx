import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

type Props = { title: string };

export function StudioNav({ title }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href="/home" aria-label="Home" className="opacity-80 hover:opacity-100">
          <Logo wordmark={false} />
        </Link>
        <h1 className="font-display text-base font-medium text-text">{title}</h1>
      </div>
      <nav className="flex items-center gap-6 text-sm text-muted">
        <Link href="/manage/projects" className="hover:text-text">
          Projects
        </Link>
        <Link href="/community" className="hover:text-text">
          Collaboration
        </Link>
        <Link href="/account/settings" className="hover:text-text">
          Settings
        </Link>
      </nav>
    </header>
  );
}
