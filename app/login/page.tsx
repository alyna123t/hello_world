import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GoogleSignInButton from "./GoogleSignInButton";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Link
        href="/"
        className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        ← Home
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Log in to generate vibe checks and vote.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          Login failed. Please try again.
        </p>
      ) : null}
      <GoogleSignInButton />
    </main>
  );
}
