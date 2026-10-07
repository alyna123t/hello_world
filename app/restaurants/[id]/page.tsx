import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserAndProfile } from "@/lib/supabase/server";
import { supabase as anonClient } from "@/lib/supabase";
import type { VibeWithVotes } from "@/lib/supabase";
import GenerateVibeForm from "./GenerateVibeForm";
import VoteButtons from "./VoteButtons";

// Wikipedia article titles for restaurants that have pages
const WIKI_TITLES: Record<number, string> = {
  1: "Joe's Pizza",
  2: "Katz's Delicatessen",
  3: "Xi'an Famous Foods",
  5: "Peter Luger Steak House",
  8: "Superiority Burger",
};

// Fallback Unsplash photo IDs by cuisine (for restaurants without Wikipedia pages)
const CUISINE_FALLBACK: Record<string, string> = {
  Mexican:      "photo-1565958011703-44f9829ba187",
  Italian:      "photo-1498579150354-977475b7ea0b",
  "Korean BBQ": "photo-1529042410759-befb1204b468",
};
const DEFAULT_PHOTO = "photo-1414235077428-338989a2e8c0";

async function fetchWikipediaImage(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const src: string | undefined = json?.thumbnail?.source;
    if (!src) return null;
    // Wikipedia returns small thumbnails; upscale to 800px wide
    return src.replace(/\/\d+px-/, "/800px-");
  } catch {
    return null;
  }
}

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

  // Try Wikipedia first, fall back to Unsplash
  const wikiTitle = WIKI_TITLES[restaurantId];
  const wikiImage = wikiTitle ? await fetchWikipediaImage(wikiTitle) : null;
  const fallbackId = CUISINE_FALLBACK[restaurant.cuisine] ?? DEFAULT_PHOTO;
  const heroUrl =
    wikiImage ??
    `https://images.unsplash.com/${fallbackId}?auto=format&fit=crop&w=1200&h=500`;

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

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <Link href="/restaurants" className="text-sm text-blue-600 hover:underline">
        &larr; All restaurants
      </Link>

      {/* Hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroUrl}
        alt={restaurant.name}
        className="mt-4 h-56 w-full rounded-xl object-cover shadow"
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
          Add context to personalize it, or leave it blank for a general vibe.
          Then vote on vibes others have generated.
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
            {user
              ? "be the first to generate one!"
              : "log in to generate the first vibe!"}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {vibes.map((vibe) => (
              <li
                key={vibe.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
