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
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 p-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        &larr; Home
      </Link>
      <h1 className="text-3xl font-bold">Log in</h1>
      {error ? (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Login failed. Please try again.
        </p>
      ) : null}
      <GoogleSignInButton />
    </main>
  );
}
