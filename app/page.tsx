import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <Link
        href="/restaurants"
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        View NYC Restaurants
      </Link>
    </main>
  );
}
