import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "NYC Vibes — AI restaurant vibe checks",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        AI-powered · Community-voted
      </p>

      <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        Find your vibe in<br />New York City
      </h1>

      <p className="mt-5 max-w-sm text-base leading-relaxed text-[var(--muted)]">
        Real, honest restaurant snapshots — written by AI, shaped by your
        situation, voted on by people who&apos;ve actually been there.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/restaurants"
          className="rounded-xl bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
        >
          Browse restaurants
        </Link>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="rounded-xl border border-[var(--border)] px-7 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
        >
          {user ? "My profile" : "Log in to generate & vote"}
        </Link>
      </div>
    </main>
  );
}
