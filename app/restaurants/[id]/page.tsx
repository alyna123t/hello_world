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
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        ← All restaurants
      </Link>

      {/* Hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroUrl}
        alt={restaurant.name}
        className="mt-4 h-56 w-full rounded-2xl object-cover"
      />

      {/* Restaurant header */}
      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight">{restaurant.name}</h1>
          <span className="shrink-0 rounded-lg bg-[var(--surface)] px-2.5 py-1 text-sm font-medium text-[var(--muted)]">
            {restaurant.price_range}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {restaurant.neighbourhood} &middot; {restaurant.cuisine} &middot;{" "}
          {priceLabel[restaurant.price_range] ?? restaurant.price_range}
        </p>
      </div>

      {/* What is a Vibe Check */}
      <div className="mt-6 rounded-2xl bg-[var(--accent-light)] p-4">
        <p className="text-sm font-semibold text-[var(--accent)]">
          What&apos;s a Vibe Check?
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
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
          <p className="mt-2 text-sm text-[var(--muted)]">
            <Link
              href="/login"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Log in
            </Link>{" "}
            to generate a vibe check and vote on others.
          </p>
        )}
      </section>

      {/* Vibes list */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Community Vibes{" "}
          <span className="font-normal text-[var(--muted)]">({vibes.length})</span>
        </h2>

        {vibes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              {user
                ? "No vibes yet — be the first to generate one!"
                : "No vibes yet. Log in to generate the first vibe!"}
            </p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {vibes.map((vibe) => (
              <li
                key={vibe.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm"
              >
                <p className="text-sm leading-relaxed">{vibe.content}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">
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
                      className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
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
