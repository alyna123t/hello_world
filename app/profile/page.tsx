import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");

  return (
    <main className="min-h-full bg-[var(--surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Dashboard
        </Link>

        <div className="mt-5 rounded-2xl bg-[var(--background)] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Account
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
          </div>

          <ProfileForm
            userId={user.id}
            firstName={profile?.first_name ?? ""}
            lastName={profile?.last_name ?? ""}
            avatarUrl={profile?.avatar_url ?? null}
          />
        </div>
      </div>
    </main>
  );
}
