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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">NYC Vibes</h1>
      <p className="max-w-sm text-gray-600 dark:text-gray-400">
        AI-generated vibe checks for NYC restaurants — written for people
        exploring the city for the first time.
      </p>
      <div className="mt-2 flex gap-3">
        <Link
          href="/restaurants"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Browse restaurants
        </Link>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-500/10"
        >
          {user ? "Dashboard" : "Log in to generate & vote"}
        </Link>
      </div>
    </main>
  );
}
