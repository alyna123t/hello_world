import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile, needsName } from "@/lib/supabase/server";
import Avatar from "@/app/Avatar";

export const metadata = {
  title: "Dashboard — NYC Vibes",
};

export default async function DashboardPage() {
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (needsName(profile)) redirect("/welcome");

  const { data: myVibes } = await supabase
    .from("vibes")
    .select("id, content, created_at, restaurant_id, restaurants(id, name, neighbourhood)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const vibes = (myVibes ?? []) as Array<{
    id: number;
    content: string;
    created_at: string;
    restaurant_id: number;
    restaurants: { id: number; name: string; neighbourhood: string }[] | null;
  }>;

  return (
    <main className="min-h-full bg-[var(--surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl space-y-5">

        {/* ── Profile card ── */}
        <div className="rounded-2xl bg-[var(--background)] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-4">
            <Avatar
              url={profile?.avatar_url ?? null}
              name={profile?.first_name ?? ""}
              size={56}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Welcome back
              </p>
              <h1 className="text-xl font-bold">{profile?.first_name} {profile?.last_name}</h1>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
            <Link
              href="/restaurants"
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
            >
              Browse restaurants
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
            >
              Edit profile
            </Link>
          </div>
        </div>

        {/* ── Your vibes ── */}
        <div className="rounded-2xl bg-[var(--background)] shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Your contributions
              </p>
              <h2 className="text-lg font-bold leading-tight">Your Vibes</h2>
            </div>
            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-sm font-medium text-[var(--muted)]">
              {vibes.length}
            </span>
          </div>

          {vibes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-[var(--muted)]">
                No vibes yet.{" "}
                <Link
                  href="/restaurants"
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  Browse restaurants
                </Link>{" "}
                to generate your first one.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {vibes.map((vibe) => (
                <li key={vibe.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {(() => {
                        const r = Array.isArray(vibe.restaurants) ? vibe.restaurants[0] : vibe.restaurants;
                        return r ? (
                          <>
                            <Link
                              href={`/restaurants/${r.id}`}
                              className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                            >
                              {r.name}
                            </Link>
                            <p className="text-xs text-[var(--muted)]">{r.neighbourhood}</p>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--muted)]">Unknown restaurant</span>
                        );
                      })()}
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground)]/80">
                        {vibe.content}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-[var(--muted)]">
                      {new Date(vibe.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}
