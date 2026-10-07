import { connection } from "next/server";
import Link from "next/link";
import { supabase, type Restaurant } from "@/lib/supabase";

export const metadata = {
  title: "NYC Restaurants — NYC Vibes",
};

const CUISINE_PHOTO: Record<string, string> = {
  Pizza:        "photo-1565299624946-b28f40a0ae38",
  Deli:         "photo-1619740455993-9e612b1af08a",
  Chinese:      "photo-1569050467447-ce54b3bbc37d",
  Mexican:      "photo-1565299585323-38d6b0865b47",
  Steakhouse:   "photo-1546964124-0cce460f38ef",
  Italian:      "photo-1555396273-367ea4eb4db5",
  "Korean BBQ": "photo-1414235077428-338989a2e8c0",
  Vegetarian:   "photo-1512621776951-a57141f2eefd",
};

const PRICE_LABEL: Record<string, string> = {
  $: "Budget",
  $$: "Mid-range",
  $$$: "Upscale",
  $$$$: "Splurge",
};

export default async function RestaurantsPage() {
  await connection();

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, neighbourhood, cuisine, price_range")
    .order("name");

  const restaurants: Restaurant[] = data ?? [];

  const { data: vibeCounts } = await supabase
    .from("vibes")
    .select("restaurant_id");

  const countByRestaurant: Record<number, number> = {};
  for (const row of vibeCounts ?? []) {
    countByRestaurant[row.restaurant_id] =
      (countByRestaurant[row.restaurant_id] ?? 0) + 1;
  }


  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">NYC Restaurants</h1>
        <p className="mt-2 text-[var(--muted)]">
          Explore AI vibe checks from the community.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          Could not load restaurants: {error.message}
        </p>
      ) : restaurants.length === 0 ? (
        <p className="text-[var(--muted)]">
          No restaurants yet. Add some rows to the table in Supabase.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => {
            const photoId = CUISINE_PHOTO[r.cuisine] ?? "photo-1414235077428-338989a2e8c0";
            const photoUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=600&h=350`;
            const vibeCount = countByRestaurant[r.id] ?? 0;

            return (
              <Link
                key={r.id}
                href={`/restaurants/${r.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Food photo */}
                <div className="relative h-44 w-full overflow-hidden bg-[var(--surface)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={r.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Cuisine pill floating over image */}
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--background)]/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                    {r.cuisine}
                  </span>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold leading-snug">
                      {r.name}
                    </h2>
                    <span
                      className="shrink-0 rounded-md bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]"
                      title={PRICE_LABEL[r.price_range]}
                    >
                      {r.price_range}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted)]">
                    {r.neighbourhood}
                  </p>

                  <div className="mt-auto flex items-center justify-end pt-3">
                    <span
                      className={`text-xs font-medium ${
                        vibeCount > 0
                          ? "text-[var(--accent)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {vibeCount === 0
                        ? "No vibes yet"
                        : `${vibeCount} ${vibeCount === 1 ? "vibe" : "vibes"} →`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
