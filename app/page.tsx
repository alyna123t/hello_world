import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <div className="flex gap-3">
        <Link
          href="/restaurants"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          View NYC Restaurants
        </Link>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-500/10"
        >
          {user ? "Dashboard" : "Log in"}
        </Link>
      </div>
    </main>
  );
}
