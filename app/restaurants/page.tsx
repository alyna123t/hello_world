import { connection } from "next/server";
import Link from "next/link";
import { supabase, type Restaurant } from "@/lib/supabase";

export const metadata = {
  title: "NYC Restaurants",
};

export default async function RestaurantsPage() {
  await connection();

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, neighbourhood, cuisine, price_range")
    .order("name");

  const restaurants: Restaurant[] = data ?? [];

  // Fetch vibe counts for each restaurant (anon-accessible)
  const { data: vibeCounts } = await supabase
    .from("vibes")
    .select("restaurant_id");

  const countByRestaurant: Record<number, number> = {};
  for (const row of vibeCounts ?? []) {
    countByRestaurant[row.restaurant_id] =
      (countByRestaurant[row.restaurant_id] ?? 0) + 1;
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        &larr; Home
      </Link>
      <h1 className="mt-4 text-3xl font-bold">NYC Restaurants</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        Click a restaurant to read or generate AI vibe checks.
      </p>

      {error ? (
        <p className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
          Could not load restaurants: {error.message}
        </p>
      ) : restaurants.length === 0 ? (
        <p className="mt-6 text-gray-600">
          No restaurants yet. Add some rows to the table in Supabase.
        </p>
      ) : (
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Neighbourhood</th>
              <th className="py-2 pr-4">Cuisine</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 text-right">Vibes</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                <td className="py-2 pr-4 font-medium">
                  <Link
                    href={`/restaurants/${r.id}`}
                    className="hover:underline text-blue-700 dark:text-blue-400"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="py-2 pr-4">{r.neighbourhood}</td>
                <td className="py-2 pr-4">{r.cuisine}</td>
                <td className="py-2 pr-4">{r.price_range}</td>
                <td className="py-2 text-right">
                  <Link
                    href={`/restaurants/${r.id}`}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {countByRestaurant[r.id] ?? 0} vibe
                    {countByRestaurant[r.id] === 1 ? "" : "s"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
