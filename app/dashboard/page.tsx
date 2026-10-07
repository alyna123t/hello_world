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
    <main className="mx-auto w-full max-w-2xl p-8">
      <div className="flex items-center gap-4">
        <Avatar
          url={profile?.avatar_url ?? null}
          name={profile?.first_name ?? ""}
          size={64}
        />
        <div>
          <h1 className="text-3xl font-bold">Hi, {profile?.first_name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover authentic NYC restaurant vibes from the community.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/restaurants"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Browse restaurants &amp; vibes
        </Link>
        <Link
          href="/profile"
          className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-500/10"
        >
          Edit profile
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-500/10"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
