import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile, needsName } from "@/lib/supabase/server";
import Avatar from "@/app/Avatar";

export const metadata = {
  title: "Dashboard",
};

// Only visible to logged-in users (proxy.ts also guards this route).
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
          <h1 className="text-3xl font-bold">
            Hi, {profile?.first_name}!
          </h1>
          <p className="text-gray-600">This page is only for logged-in users.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/profile"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Edit profile
        </Link>
        <Link
          href="/restaurants"
          className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-500/10"
        >
          NYC Restaurants
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
