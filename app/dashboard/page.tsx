import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile, needsName } from "@/lib/supabase/server";
import Avatar from "@/app/Avatar";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (needsName(profile)) redirect("/welcome");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar
          url={profile?.avatar_url ?? null}
          name={profile?.first_name ?? ""}
          size={64}
        />
        <div>
          <h1 className="text-2xl font-bold">Hi, {profile?.first_name}!</h1>
          <p className="text-sm text-[var(--muted)]">
            Discover authentic NYC restaurant vibes from the community.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
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
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
