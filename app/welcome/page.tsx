import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/server";
import WelcomeForm from "./WelcomeForm";

export const metadata = {
  title: "Welcome",
};

export default async function WelcomePage() {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome!</h1>
        <p className="mt-1 text-gray-600">
          Before you continue, tell us your name.
        </p>
      </div>
      <WelcomeForm
        firstName={profile?.first_name ?? ""}
        lastName={profile?.last_name ?? ""}
      />
    </main>
  );
}
