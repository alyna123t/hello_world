import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserAndProfile } from "@/lib/supabase/server";
import { supabase as anonClient } from "@/lib/supabase";
import type { VibeWithVotes } from "@/lib/supabase";
import GenerateVibeForm from "./GenerateVibeForm";
import VoteButtons from "./VoteButtons";

// Direct Unsplash photo IDs — no redirect, no API key needed
const CUISINE_PHOTO: Record<string, string> = {
  Pizza:        "photo-1565299624946-b28f40a0ae38",
  Deli:         "photo-1619740455993-9e612b1af08a",
  Chinese:      "photo-1569050467447-ce54b3bbc37d",
  Mexican:      "photo-1565299585323-38d6b0865b47",
  Steakhouse:   "photo-1546964124-0cce460f38ef",
  Italian:      "photo-1555396273-367ea4eb4db5",
  "Korean BBQ": "photo-1604759835237-e3e1bd93e8a6",
  Vegetarian:   "photo-1512621776951-a57141f2eefd",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await anonClient
    .from("restaurants")
    .select("name")
    .eq("id", Number(id))
    .single();
  return { title: data?.name ? `${data.name} — NYC Vibes` : "NYC Vibes" };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantId = Number(id);

  const { supabase, user } = await getUserAndProfile();

  const { data: restaurant } = await anonClient
    .from("restaurants")
    .select("id, name, neighbourhood, cuisine, price_range")
    .eq("id", restaurantId)
    .single();

  if (!restaurant) notFound();

  const { data: vibesRaw } = await anonClient
    .from("vibes")
    .select("id, content, author_name, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  let vibes: VibeWithVotes[] = [];
  if (user && vibesRaw && vibesRaw.length > 0) {
    const vibeIds = vibesRaw.map((v) => v.id);
    const { data: votes } = await supabase
      .from("vibe_votes")
      .select("vibe_id, vote, user_id")
      .in("vibe_id", vibeIds);

    vibes = vibesRaw.map((v) => {
      const vibeVotes = votes?.filter((vote) => vote.vibe_id === v.id) ?? [];
      const score = vibeVotes.reduce(
        (acc: number, vote: { vote: number }) => acc + vote.vote,
        0,
      );
      const userVote =
        (vibeVotes.find((vote: { user_id: string }) => vote.user_id === user.id)
          ?.vote as 1 | -1 | undefined) ?? null;
      return { ...v, restaurant_id: restaurantId, user_id: "", prompt: "", score, userVote };
    });
    vibes.sort((a, b) => b.score - a.score || b.created_at.localeCompare(a.created_at));
  } else {
    vibes = (vibesRaw ?? []).map((v) => ({
      ...v,
      restaurant_id: restaurantId,
      user_id: "",
      prompt: "",
      score: 0,
      userVote: null,
    }));
  }

  const priceLabel: Record<string, string> = {
    $: "Budget-friendly",
    $$: "Mid-range",
    $$$: "Upscale",
    $$$$: "Splurge",
  };

  const photoId =
    CUISINE_PHOTO[restaurant.cuisine] ?? "photo-1414235077428-338989a2e8c0";
  const heroUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=500`;

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <Link href="/restaurants" className="text-sm text-blue-600 hover:underline">
        &larr; All restaurants
      </Link>

      {/* Hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroUrl}
        alt={`${restaurant.cuisine} food`}
        className="mt-4 h-52 w-full rounded-xl object-cover shadow"
      />

      {/* Restaurant header */}
      <div className="mt-5">
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {restaurant.neighbourhood} &middot; {restaurant.cuisine} &middot;{" "}
          {restaurant.price_range}{" "}
          <span className="text-gray-400">
            ({priceLabel[restaurant.price_range] ?? restaurant.price_range})
          </span>
        </p>
      </div>

      {/* What is a Vibe Check */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          What&apos;s a Vibe Check?
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Our AI writes a short, honest 2–3 sentence snapshot of what it&apos;s
          really like to eat here — the crowd, the energy, and what to order.
          Add context below to personalize it (or leave it blank for a general
          vibe). Then vote on the vibes others have generated.
        </p>
      </div>

      {/* Generate section */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Generate a Vibe Check</h2>
        {user ? (
          <GenerateVibeForm restaurantId={restaurant.id} />
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>{" "}
            to generate a vibe check and vote on others.
          </p>
        )}
      </section>

      {/* Vibes list */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Community Vibes{" "}
          <span className="font-normal text-gray-400">({vibes.length})</span>
        </h2>

        {vibes.length === 0 ? (
          <p className="mt-3 text-gray-500">
            No vibes yet —{" "}
            {user ? "be the first to generate one!" : "log in to generate the first vibe!"}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {vibes.map((vibe) => (
              <li
                key={vibe.id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
              >
                {/* Food photo thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=200`}
                  alt="food"
                  className="h-32 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-base leading-relaxed">{vibe.content}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      by {vibe.author_name} &middot;{" "}
                      {new Date(vibe.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {user ? (
                      <VoteButtons
                        vibeId={vibe.id}
                        restaurantId={restaurantId}
                        currentVote={vibe.userVote}
                        score={vibe.score}
                      />
                    ) : (
                      <Link
                        href="/login"
                        className="text-xs text-gray-400 hover:text-blue-600"
                      >
                        Log in to vote
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
