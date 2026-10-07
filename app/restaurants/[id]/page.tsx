import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient, getUserAndProfile } from "@/lib/supabase/server";
import type { VibeWithVotes } from "@/lib/supabase";
import GenerateVibeForm from "./GenerateVibeForm";
import VoteButtons from "./VoteButtons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", Number(id))
    .single();
  return { title: data?.name ? `${data.name} Vibes` : "Restaurant Vibes" };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantId = Number(id);

  const { supabase, user } = await getUserAndProfile();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, neighbourhood, cuisine, price_range")
    .eq("id", restaurantId)
    .single();

  if (!restaurant) notFound();

  // Fetch vibes — readable by everyone (anon RLS policy allows this)
  const { data: vibesRaw } = await supabase
    .from("vibes")
    .select("id, content, author_name, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  // Fetch votes only for authenticated users (RLS restricts anon reads)
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
      return {
        ...v,
        restaurant_id: restaurantId,
        user_id: "",
        prompt: "",
        score,
        userVote,
      };
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
      <Link
        href="/restaurants"
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; All restaurants
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="mt-1 text-gray-500">
          {restaurant.neighbourhood} &middot; {restaurant.cuisine} &middot;{" "}
          {restaurant.price_range}{" "}
          <span className="text-gray-400">
            ({priceLabel[restaurant.price_range] ?? restaurant.price_range})
          </span>
        </p>
      </div>

      {/* Generate section */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Generate a vibe check</h2>
        {user ? (
          <GenerateVibeForm restaurantId={restaurant.id} />
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>{" "}
            to generate AI-powered vibe checks for this restaurant.
          </p>
        )}
      </section>

      {/* Vibes list */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Community vibes{" "}
          <span className="text-gray-400 font-normal">({vibes.length})</span>
        </h2>

        {vibes.length === 0 ? (
          <p className="mt-3 text-gray-500">
            No vibes yet.{" "}
            {user
              ? "Be the first to generate one above!"
              : "Log in to generate the first vibe!"}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {vibes.map((vibe) => (
              <li
                key={vibe.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
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
