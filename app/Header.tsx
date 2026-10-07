import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-base font-bold tracking-tight">
          NYC Vibes
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/restaurants"
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            Restaurants
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-dark)]"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
