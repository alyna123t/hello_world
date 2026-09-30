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
    <main className="mx-auto w-full max-w-md p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        &larr; Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-gray-600">{user.email}</p>
      <ProfileForm
        userId={user.id}
        firstName={profile?.first_name ?? ""}
        lastName={profile?.last_name ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </main>
  );
}
